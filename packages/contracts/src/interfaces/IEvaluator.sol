// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IEvaluator {
    event Evaluated(uint256 indexed jobId, bool passed, bytes32 submittedHash, bytes32 expectedHash);

    function evaluate(uint256 jobId) external returns (bool);
    function evaluateWithProof(uint256 jobId, bytes calldata proofData) external returns (bool);
}
