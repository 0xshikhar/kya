// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../DataTypes.sol";
import "../interfaces/IEvaluator.sol";

interface IJobAdapterReader {
    function getJob(uint256 jobId) external view returns (OpenJob memory);
    function submittedResults(uint256 jobId) external view returns (bytes32);
    function complete(uint256 jobId) external;
    function reject(uint256 jobId, string calldata reason) external;
}

contract HashMatchEvaluator is IEvaluator {
    address public immutable adapterContract;

    constructor(address _adapterContract) {
        require(_adapterContract != address(0), "Invalid adapter");
        adapterContract = _adapterContract;
    }

    /// @notice Evaluates submitted deliverable against the expected cryptographic hash.
    function evaluate(uint256 jobId) public override returns (bool) {
        OpenJob memory job = IJobAdapterReader(adapterContract).getJob(jobId);
        require(job.phase == JobPhase.SUBMITTED, "Job not submitted");

        bytes32 submitted = IJobAdapterReader(adapterContract).submittedResults(jobId);
        bool passed = (submitted == job.expectedDeliverableHash && submitted != bytes32(0));

        emit Evaluated(jobId, passed, submitted, job.expectedDeliverableHash);

        if (passed) {
            IJobAdapterReader(adapterContract).complete(jobId);
        } else {
            IJobAdapterReader(adapterContract).reject(jobId, "HASH_MISMATCH: Deliverable does not match expected hash");
        }

        return passed;
    }

    function evaluateWithProof(uint256 jobId, bytes calldata) external override returns (bool) {
        return evaluate(jobId);
    }
}
