// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DataTypes.sol";
import "./interfaces/IMandateHub.sol";
import "./interfaces/IMandateTree.sol";
import "./interfaces/IMandateLog.sol";

interface IERC20Vault {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract MandateTree is IMandateTree {
    uint8 public constant MAX_DEPTH = 4;
    uint16 public constant MAX_CHILDREN = 16;
    uint16 public constant MAX_ALLOWLIST = 16;

    address public immutable hubContract;
    address public adapterContract;
    address public logContract;

    uint256 private nonce;

    mapping(bytes32 => MandateNode) private nodes;
    mapping(bytes32 => mapping(address => bool)) private allowlists;
    mapping(bytes32 => bytes32[]) private children;

    modifier onlyHub() {
        require(msg.sender == hubContract, "Only hub");
        _;
    }

    modifier onlyAdapter() {
        require(msg.sender == adapterContract, "Only adapter");
        _;
    }

    constructor(address _hubContract) {
        require(_hubContract != address(0), "Invalid hub");
        hubContract = _hubContract;
    }

    function setAdapterAndLog(address _adapterContract, address _logContract) external {
        require(msg.sender == IMandateHub(hubContract).owner(), "Only hub owner");
        require(adapterContract == address(0), "Already configured");
        adapterContract = _adapterContract;
        logContract = _logContract;
    }

    /// @notice Creates the top-level root mandate. Locks USDC into the Hub vault.
    function createRoot(
        address owner,
        address agent,
        address watchdog,
        address asset,
        uint128 granted,
        uint64 expiry,
        address[] calldata allowlist,
        bytes32 policyHash
    ) external override returns (bytes32 rootId) {
        require(owner != address(0) && agent != address(0), "Invalid addresses");
        require(granted > 0, "Zero grant");
        require(expiry > block.timestamp, "Invalid expiry");
        require(allowlist.length <= MAX_ALLOWLIST, "Allowlist too large");

        // Transfer funds into Hub vault
        bool success = IERC20Vault(asset).transferFrom(msg.sender, hubContract, granted);
        require(success, "Vault deposit failed");

        nonce++;
        rootId = keccak256(abi.encodePacked(owner, agent, granted, block.timestamp, nonce));

        bytes32 allowlistHash = _registerAllowlist(rootId, allowlist);

        nodes[rootId] = MandateNode({
            parentId: bytes32(0),
            owner: owner,
            agent: agent,
            watchdog: watchdog,
            asset: asset,
            granted: granted,
            idle: granted,
            childGranted: 0,
            jobLocked: 0,
            expiry: expiry,
            subtreeEpoch: 0,
            seenParentEpoch: 0,
            childCount: 0,
            depth: 0,
            status: NodeStatus.ACTIVE,
            allowlistHash: allowlistHash,
            policyHash: policyHash
        });

        if (logContract != address(0)) {
            IMandateLog(logContract).appendLeaf(rootId, keccak256(abi.encode("CREATE_ROOT", granted, owner, agent)));
        }

        emit RootCreated(rootId, owner, agent, granted);
    }

    /// @notice Credits an existing root mandate with additional deposit from Hub.
    function creditRoot(bytes32 rootId, uint128 amount) external override onlyHub {
        MandateNode storage root = nodes[rootId];
        require(root.parentId == bytes32(0), "Not root");
        require(root.status == NodeStatus.ACTIVE, "Root not active");
        require(amount > 0, "Zero amount");

        root.granted += amount;
        root.idle += amount;

        if (logContract != address(0)) {
            IMandateLog(logContract).appendLeaf(rootId, keccak256(abi.encode("CREDIT_ROOT", amount, msg.sender)));
        }

        emit RootCredited(rootId, amount);
    }

    /// @notice Spawns an attenuated child mandate under a parent node.
    function spawn(
        bytes32 parentId,
        address childAgent,
        address childWatchdog,
        uint128 granted,
        uint64 expiry,
        address[] calldata childAllowlist,
        bytes32 childPolicyHash
    ) external override returns (bytes32 childId) {
        _sync(parentId);
        MandateNode storage parent = nodes[parentId];

        require(parent.status == NodeStatus.ACTIVE, "Parent revoked");
        require(parent.expiry > block.timestamp, "Parent expired");
        require(msg.sender == parent.owner || msg.sender == parent.agent, "Unauthorized caller");
        require(childAgent != address(0), "Invalid child agent");
        require(granted <= parent.idle, "Budget exceeds parent idle");
        
        // Allow $0 watchdog nodes; financial nodes require granted > 0
        if (granted == 0) {
            require(childWatchdog != address(0) || childPolicyHash != bytes32(0), "Zero grant requires watchdog");
        }
        
        require(expiry <= parent.expiry, "Child expiry exceeds parent");
        require(parent.depth + 1 <= MAX_DEPTH, "Max depth exceeded");
        require(parent.childCount + 1 <= MAX_CHILDREN, "Max children exceeded");
        require(childAllowlist.length <= MAX_ALLOWLIST, "Allowlist too large");

        // Enforce strict subset allowlist
        for (uint256 i = 0; i < childAllowlist.length; i++) {
            require(allowlists[parentId][childAllowlist[i]], "Child allowlist not subset of parent");
        }

        // State update on parent (Conservation Invariant)
        if (granted > 0) {
            parent.idle -= granted;
            parent.childGranted += granted;
        }
        parent.childCount += 1;

        nonce++;
        childId = keccak256(abi.encodePacked(parentId, childAgent, granted, block.timestamp, nonce));

        bytes32 childAllowlistHash = _registerAllowlist(childId, childAllowlist);

        // Child owner is always root treasury (parent.owner)
        nodes[childId] = MandateNode({
            parentId: parentId,
            owner: parent.owner,
            agent: childAgent,
            watchdog: childWatchdog != address(0) ? childWatchdog : parent.watchdog,
            asset: parent.asset,
            granted: granted,
            idle: granted,
            childGranted: 0,
            jobLocked: 0,
            expiry: expiry,
            subtreeEpoch: 0,
            seenParentEpoch: parent.subtreeEpoch,
            childCount: 0,
            depth: parent.depth + 1,
            status: NodeStatus.ACTIVE,
            allowlistHash: childAllowlistHash,
            policyHash: childPolicyHash
        });

        children[parentId].push(childId);

        if (logContract != address(0)) {
            IMandateLog(logContract).appendLeaf(childId, keccak256(abi.encode("SPAWN", granted, childAgent, parentId)));
        }

        emit Spawned(childId, parentId, childAgent, granted);
    }

    /// @notice Revokes a mandate node and sweeps unspent idle up to nearest active ancestor.
    function revokeSubtree(bytes32 mandateId) external override {
        MandateNode storage node = nodes[mandateId];
        require(node.owner != address(0), "Node does not exist");
        require(node.status != NodeStatus.REVOKED, "Already revoked");

        // Permission: node owner, node watchdog, root owner, or parent agent
        bool isAuthorized = (msg.sender == node.owner || msg.sender == node.watchdog);
        if (!isAuthorized && node.parentId != bytes32(0)) {
            MandateNode memory parent = nodes[node.parentId];
            isAuthorized = (msg.sender == parent.owner || msg.sender == parent.agent || msg.sender == parent.watchdog);
        }
        require(isAuthorized, "Unauthorized to revoke");

        node.status = NodeStatus.REVOKED;
        node.subtreeEpoch += 1;

        _sweepIdleUp(mandateId);
        _revokeDescendants(mandateId);

        if (logContract != address(0)) {
            IMandateLog(logContract).appendLeaf(mandateId, keccak256(abi.encode("REVOKE", msg.sender, node.subtreeEpoch)));
        }

        emit SubtreeRevoked(mandateId, msg.sender, node.subtreeEpoch);
    }

    /// @dev Recursively marks descendants as REVOKED and sweeps any idle funds upward
    function _revokeDescendants(bytes32 parentId) internal {
        bytes32[] storage childList = children[parentId];
        for (uint256 i = 0; i < childList.length; i++) {
            bytes32 cId = childList[i];
            MandateNode storage cNode = nodes[cId];
            if (cNode.status == NodeStatus.ACTIVE) {
                cNode.status = NodeStatus.REVOKED;
                cNode.subtreeEpoch += 1;
                _sweepIdleUp(cId);
                _revokeDescendants(cId);
            }
        }
    }

    /// @notice Locks idle funds for an ERC-8183 job escrow.
    function lockForJob(
        bytes32 mandateId,
        uint256 jobId,
        uint128 amount,
        address provider
    ) external override onlyAdapter {
        _sync(mandateId);
        MandateNode storage node = nodes[mandateId];

        require(node.status == NodeStatus.ACTIVE, "Mandate revoked");
        require(node.expiry > block.timestamp, "Mandate expired");
        require(node.granted > 0 && amount > 0, "Zero grant cannot fund jobs");
        require(amount <= node.idle, "Insufficient idle balance");
        require(allowlists[mandateId][provider], "Provider not on allowlist");

        node.idle -= amount;
        node.jobLocked += amount;

        if (logContract != address(0)) {
            IMandateLog(logContract).appendLeaf(mandateId, keccak256(abi.encode("LOCK_JOB", jobId, amount, provider)));
        }

        emit LockJob(mandateId, jobId, amount);
    }

    /// @notice Unlocks escrowed job funds. If spent is true, funds left Hub. If false, funds refund to idle.
    function releaseJobLocked(
        bytes32 mandateId,
        uint256 jobId,
        uint128 amount,
        bool spent
    ) external override onlyAdapter {
        MandateNode storage node = nodes[mandateId];
        require(node.jobLocked >= amount, "Amount exceeds jobLocked");

        node.jobLocked -= amount;

        if (!spent) {
            _sync(mandateId);
            if (node.status == NodeStatus.ACTIVE) {
                node.idle += amount;
            } else {
                // If revoked/expired while job was active, refund sweeps up to nearest active ancestor!
                node.idle += amount;
                _sweepIdleUp(mandateId);
            }
        }

        if (logContract != address(0)) {
            IMandateLog(logContract).appendLeaf(mandateId, keccak256(abi.encode("UNLOCK_JOB", jobId, amount, spent)));
        }

        emit UnlockJob(mandateId, jobId, amount, spent);
    }

    /// @notice Explicitly synchronizes generational epoch and expiry for a mandate node
    function sync(bytes32 mandateId) external override {
        _sync(mandateId);
    }

    /// @dev Synchronizes generational epoch to propagate lazy revocation downward and checks expiry
    function _sync(bytes32 mandateId) internal {
        MandateNode storage node = nodes[mandateId];
        if (node.status == NodeStatus.REVOKED) return;

        // Check node's own expiry
        if (block.timestamp >= node.expiry && node.status == NodeStatus.ACTIVE) {
            node.status = NodeStatus.EXPIRED;
            _sweepIdleUp(mandateId);
            return;
        }

        if (node.parentId == bytes32(0)) return;

        // Multi-hop ancestor check up to MAX_DEPTH
        bytes32 curr = node.parentId;
        bool shouldRevoke = false;
        for (uint8 d = 0; d < MAX_DEPTH && curr != bytes32(0); d++) {
            MandateNode storage anc = nodes[curr];
            if (anc.status == NodeStatus.REVOKED || anc.status == NodeStatus.EXPIRED || block.timestamp >= anc.expiry) {
                shouldRevoke = true;
                break;
            }
            curr = anc.parentId;
        }

        if (shouldRevoke) {
            node.status = NodeStatus.REVOKED;
            _sweepIdleUp(mandateId);
        }
    }

    /// @dev Sweeps idle balance up to the nearest active ancestor, repairing conservation accounting
    function _sweepIdleUp(bytes32 mandateId) internal returns (uint128 swept) {
        MandateNode storage node = nodes[mandateId];
        swept = node.idle;
        node.idle = 0;

        if (node.parentId == bytes32(0) || swept == 0) return swept;

        bytes32 curr = node.parentId;
        while (curr != bytes32(0)) {
            MandateNode storage ancestor = nodes[curr];
            if (ancestor.status == NodeStatus.ACTIVE) {
                ancestor.idle += swept;
                if (ancestor.childGranted >= swept) {
                    ancestor.childGranted -= swept;
                } else {
                    ancestor.childGranted = 0;
                }
                break;
            }
            curr = ancestor.parentId;
        }
    }

    function _registerAllowlist(bytes32 id, address[] calldata list) internal returns (bytes32) {
        for (uint256 i = 0; i < list.length; i++) {
            allowlists[id][list[i]] = true;
        }
        return keccak256(abi.encodePacked(list));
    }

    function getNode(bytes32 mandateId) external view override returns (MandateNode memory) {
        return nodes[mandateId];
    }

    function getChildren(bytes32 mandateId) external view override returns (bytes32[] memory) {
        return children[mandateId];
    }

    function isNodeLive(bytes32 mandateId) external view override returns (bool) {
        MandateNode memory node = nodes[mandateId];
        if (node.status != NodeStatus.ACTIVE || node.expiry <= block.timestamp) {
            return false;
        }
        bytes32 curr = node.parentId;
        for (uint8 d = 0; d < MAX_DEPTH && curr != bytes32(0); d++) {
            MandateNode memory anc = nodes[curr];
            if (anc.status != NodeStatus.ACTIVE || anc.expiry <= block.timestamp) {
                return false;
            }
            curr = anc.parentId;
        }
        return true;
    }

    function isAddressAllowed(bytes32 mandateId, address target) external view override returns (bool) {
        return allowlists[mandateId][target];
    }
}
