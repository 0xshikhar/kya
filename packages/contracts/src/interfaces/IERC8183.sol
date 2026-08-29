// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../DataTypes.sol";

interface IERC8183 {
    event JobFunded(uint256 indexed jobId, bytes32 indexed mandateId, address indexed provider, uint128 amount);
    event JobSubmitted(uint256 indexed jobId, bytes32 deliverableHash);
    event JobCompleted(uint256 indexed jobId, uint128 amountPaid);
    event JobRejected(uint256 indexed jobId, string reason);
    event JobRefunded(uint256 indexed jobId, uint128 amountRefunded);

    function fundJob(
        bytes32 mandateId,
        address provider,
        address evaluator,
        uint128 amount,
        uint64 deadline,
        bytes32 expectedDeliverableHash
    ) external returns (uint256 jobId);

    function submitJob(uint256 jobId, bytes32 deliverableHash) external;
    function complete(uint256 jobId) external;
    function reject(uint256 jobId, string calldata reason) external;
    function refundExpired(uint256 jobId) external;
    function sweepFunded(bytes32 mandateId, uint256 maxN) external returns (uint256 sweptCount);

    function getJob(uint256 jobId) external view returns (OpenJob memory);
    function getJobIdsByMandate(bytes32 mandateId) external view returns (uint256[] memory);
}
