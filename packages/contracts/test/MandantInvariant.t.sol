// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "forge-std/StdInvariant.sol";
import "../src/DataTypes.sol";
import "../src/MockUSDC.sol";
import "../src/MandateHub.sol";
import "../src/MandateTree.sol";
import "../src/JobAdapter.sol";
import "../src/evaluators/HashMatchEvaluator.sol";
import "../src/log/MandateLog.sol";

contract MandantHandler is Test {
    MockUSDC public usdc;
    MandateHub public hub;
    MandateTree public tree;
    JobAdapter public adapter;
    HashMatchEvaluator public evaluator;

    address public treasury;
    address public provider;
    address public watchdog;
    bytes32 public rootId;

    bytes32[] public activeNodes;
    uint256 public agentNonce;

    constructor(
        MockUSDC _usdc,
        MandateHub _hub,
        MandateTree _tree,
        JobAdapter _adapter,
        HashMatchEvaluator _evaluator,
        address _treasury,
        address _provider,
        address _watchdog,
        bytes32 _rootId
    ) {
        usdc = _usdc;
        hub = _hub;
        tree = _tree;
        adapter = _adapter;
        evaluator = _evaluator;
        treasury = _treasury;
        provider = _provider;
        watchdog = _watchdog;
        rootId = _rootId;

        activeNodes.push(rootId);
    }

    function spawn(uint256 parentIdxSeed, uint128 rawGrant) external {
        if (activeNodes.length == 0) return;
        bytes32 parentId = activeNodes[parentIdxSeed % activeNodes.length];

        MandateNode memory parent = tree.getNode(parentId);
        if (parent.status != NodeStatus.ACTIVE || parent.idle == 0 || parent.depth >= 4 || parent.childCount >= 8) {
            return;
        }

        uint128 grant = uint128(bound(rawGrant, 1, parent.idle));
        agentNonce++;
        address childAgent = address(uint160(0xCAFE0000 + agentNonce));

        address[] memory allowlist = new address[](1);
        allowlist[0] = provider;

        vm.prank(parent.agent);
        try tree.spawn(
            parentId,
            childAgent,
            watchdog,
            grant,
            parent.expiry,
            allowlist,
            bytes32(0)
        ) returns (bytes32 childId) {
            activeNodes.push(childId);
        } catch {}
    }

    function revoke(uint256 nodeIdxSeed) external {
        if (activeNodes.length <= 1) return;
        uint256 idx = nodeIdxSeed % activeNodes.length;
        bytes32 targetId = activeNodes[idx];

        // Do not revoke root in invariant fuzz so tree stays active
        if (targetId == rootId) return;

        MandateNode memory node = tree.getNode(targetId);
        if (node.status != NodeStatus.ACTIVE) return;

        vm.prank(watchdog);
        try tree.revokeSubtree(targetId) {} catch {}
    }

    function deposit(uint128 rawAmount) external {
        uint128 amount = uint128(bound(rawAmount, 10 * 1e6, 10_000 * 1e6));

        usdc.mint(treasury, amount);
        vm.startPrank(treasury);
        usdc.approve(address(hub), amount);
        try hub.deposit(rootId, amount) {} catch {}
        vm.stopPrank();
    }
}

contract MandantInvariantTest is StdInvariant, Test {
    MockUSDC public usdc;
    MandateHub public hub;
    MandateTree public tree;
    JobAdapter public adapter;
    HashMatchEvaluator public evaluator;
    MandateLog public mandateLog;
    MandantHandler public handler;

    address public treasury = address(0x1111);
    address public leadOrchestrator = address(0x2222);
    address public watchdog = address(0x5555);
    address public computeProvider = address(0x6666);

    bytes32 public rootId;

    function setUp() public {
        usdc = new MockUSDC();
        hub = new MandateHub(address(usdc));
        tree = new MandateTree(address(hub));
        adapter = new JobAdapter(address(hub), address(tree));
        evaluator = new HashMatchEvaluator(address(adapter));
        mandateLog = new MandateLog(address(tree), address(adapter));

        hub.setContracts(address(tree), address(adapter));
        tree.setAdapterAndLog(address(adapter), address(mandateLog));

        // Fund Treasury and create Root Mandate
        usdc.mint(treasury, 1_000_000 * 1e6);
        vm.prank(treasury);
        usdc.approve(address(tree), type(uint256).max);

        address[] memory rootAllowlist = new address[](1);
        rootAllowlist[0] = computeProvider;

        vm.prank(treasury);
        rootId = tree.createRoot(
            treasury,
            leadOrchestrator,
            watchdog,
            address(usdc),
            50_000 * 1e6,
            uint64(block.timestamp + 30 days),
            rootAllowlist,
            bytes32(0)
        );

        handler = new MandantHandler(
            usdc,
            hub,
            tree,
            adapter,
            evaluator,
            treasury,
            computeProvider,
            watchdog,
            rootId
        );

        targetContract(address(handler));
    }

    /// @notice Core Invariant: Root node capital conservation holds under all random spawn/revoke/deposit permutations
    function invariant_RootConservation() public view {
        MandateNode memory root = tree.getNode(rootId);
        assertEq(
            root.idle + root.childGranted + root.jobLocked,
            root.granted,
            "Root conservation violated: idle + childGranted + jobLocked != granted"
        );
    }

    /// @notice Core Invariant: Hub USDC vault balance exactly equals root granted active capital
    function invariant_VaultBackingEqualsGranted() public view {
        MandateNode memory root = tree.getNode(rootId);
        assertEq(
            usdc.balanceOf(address(hub)),
            root.granted,
            "Hub vault balance does not match total root granted"
        );
    }
}
