// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../DataTypes.sol";

interface IMandateTree {
    event RootCreated(bytes32 indexed rootId, address indexed owner, address indexed agent, uint128 budget);
    event Spawned(bytes32 indexed childId, bytes32 indexed parentId, address indexed childAgent, uint128 granted);
    event SubtreeRevoked(bytes32 indexed mandateId, address indexed revoker, uint32 newEpoch);
    event LockJob(bytes32 indexed mandateId, uint256 indexed jobId, uint128 amount);
    event UnlockJob(bytes32 indexed mandateId, uint256 indexed jobId, uint128 amount, bool spent);

    event RootCredited(bytes32 indexed rootId, uint128 amount);

    function createRoot(
        address owner,
        address agent,
        address watchdog,
        address asset,
        uint128 granted,
        uint64 expiry,
        address[] calldata allowlist,
        bytes32 policyHash
    ) external returns (bytes32 rootId);

    function creditRoot(bytes32 rootId, uint128 amount) external;

    function spawn(
        bytes32 parentId,
        address childAgent,
        address childWatchdog,
        uint128 granted,
        uint64 expiry,
        address[] calldata childAllowlist,
        bytes32 childPolicyHash
    ) external returns (bytes32 childId);

    function revokeSubtree(bytes32 mandateId) external;

    function lockForJob(bytes32 mandateId, uint256 jobId, uint128 amount, address provider) external;
    function releaseJobLocked(bytes32 mandateId, uint256 jobId, uint128 amount, bool spent) external;

    function sync(bytes32 mandateId) external;
    function getNode(bytes32 mandateId) external view returns (MandateNode memory);
    function isNodeLive(bytes32 mandateId) external view returns (bool);
    function isAddressAllowed(bytes32 mandateId, address target) external view returns (bool);
    function getChildren(bytes32 mandateId) external view returns (bytes32[] memory);
}
