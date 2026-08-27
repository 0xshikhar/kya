// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DataTypes.sol";
import "./interfaces/IMandateHub.sol";
import "./interfaces/IMandateTree.sol";
import "./interfaces/IERC8183.sol";
import "./interfaces/IEvaluator.sol";

contract JobAdapter is IERC8183 {
    uint256 public constant MAX_JOBS_PER_MANDATE = 8;

    address public immutable hubContract;
    address public immutable treeContract;

    uint256 private nextJobId = 1;
    mapping(uint256 => OpenJob) private jobs;
    mapping(uint256 => bytes32) public submittedResults;
    mapping(bytes32 => uint256[]) private jobIdsByMandate;

    modifier onlyHubOrTree() {
        require(msg.sender == hubContract || msg.sender == treeContract, "Unauthorized caller");
        _;
    }

    constructor(address _hubContract, address _treeContract) {
        require(_hubContract != address(0) && _treeContract != address(0), "Invalid addresses");
        hubContract = _hubContract;
        treeContract = _treeContract;
    }

    /// @notice Funds a new ERC-8183 conditional escrow under an active mandate.
    function fundJob(
        bytes32 mandateId,
        address provider,
        address evaluator,
        uint128 amount,
        uint64 deadline,
        bytes32 expectedDeliverableHash
    ) external override returns (uint256 jobId) {
        require(amount > 0, "Zero amount");
        require(provider != address(0) && evaluator != address(0), "Invalid addresses");
        require(deadline > block.timestamp, "Invalid deadline");
        require(jobIdsByMandate[mandateId].length < MAX_JOBS_PER_MANDATE, "Max jobs per mandate reached");

        MandateNode memory node = IMandateTree(treeContract).getNode(mandateId);
        require(msg.sender == node.owner || msg.sender == node.agent, "Unauthorized caller");

        jobId = nextJobId++;

        // Lock funds onchain via MandateTree
        IMandateTree(treeContract).lockForJob(mandateId, jobId, amount, provider);

        jobs[jobId] = OpenJob({
            jobId: jobId,
            mandateId: mandateId,
            provider: provider,
            evaluator: evaluator,
            amount: amount,
            deadline: deadline,
            phase: JobPhase.FUNDED,
            expectedDeliverableHash: expectedDeliverableHash
        });

        jobIdsByMandate[mandateId].push(jobId);

        emit JobFunded(jobId, mandateId, provider, amount);
    }

    /// @notice Provider submits deliverable hash before the deadline.
    function submitJob(uint256 jobId, bytes32 deliverableHash) external override {
        OpenJob storage job = jobs[jobId];
        require(job.phase == JobPhase.FUNDED, "Job not in funded phase");
        require(msg.sender == job.provider, "Only provider can submit");
        require(block.timestamp <= job.deadline, "Deadline passed");
        require(deliverableHash != bytes32(0), "Empty deliverable hash");

        job.phase = JobPhase.SUBMITTED;
        submittedResults[jobId] = deliverableHash;

        emit JobSubmitted(jobId, deliverableHash);
    }

    /// @notice Evaluator completes job upon verified deliverable, releasing USDC.
    function complete(uint256 jobId) external override {
        OpenJob storage job = jobs[jobId];
        require(job.phase == JobPhase.SUBMITTED, "Job not submitted");
        require(msg.sender == job.evaluator, "Only evaluator can complete");

        job.phase = JobPhase.COMPLETED;

        // Unlock funds from tree as spent
        IMandateTree(treeContract).releaseJobLocked(job.mandateId, jobId, job.amount, true);

        // Instruct Hub to transfer USDC to provider
        IMandateHub(hubContract).paySettlement(job.mandateId, jobId, job.provider, job.amount);

        emit JobCompleted(jobId, job.amount);
    }

    /// @notice Rejects job upon deliverable or SLA failure, refunding USDC back to mandate idle.
    function reject(uint256 jobId, string calldata reason) external override {
        OpenJob storage job = jobs[jobId];
        require(job.phase == JobPhase.SUBMITTED || job.phase == JobPhase.FUNDED, "Job cannot be rejected");
        require(msg.sender == job.evaluator, "Only evaluator can reject");

        job.phase = JobPhase.REJECTED;

        // Release job lock in tree and restore idle balance to mandate
        IMandateTree(treeContract).releaseJobLocked(job.mandateId, jobId, job.amount, false);

        emit JobRejected(jobId, reason);
    }

    /// @notice Auto-refunds an expired job where provider failed to deliver before the deadline.
    function refundExpired(uint256 jobId) external override {
        OpenJob storage job = jobs[jobId];
        require(job.phase == JobPhase.FUNDED || job.phase == JobPhase.SUBMITTED, "Job already finalized");
        require(block.timestamp > job.deadline, "Deadline not passed");

        job.phase = JobPhase.REFUNDED;

        // Release job lock and refund idle balance to mandate
        IMandateTree(treeContract).releaseJobLocked(job.mandateId, jobId, job.amount, false);

        emit JobRefunded(jobId, job.amount);
    }

    /// @notice Sweeps open FUNDED jobs from a revoked/expired mandate, unlocking funds back to parent
    function sweepFunded(bytes32 mandateId, uint256 maxN) external override returns (uint256 sweptCount) {
        MandateNode memory node = IMandateTree(treeContract).getNode(mandateId);
        require(
            node.status == NodeStatus.REVOKED ||
            node.status == NodeStatus.EXPIRED ||
            msg.sender == node.owner ||
            msg.sender == node.watchdog,
            "Unauthorized to sweep funded jobs"
        );

        uint256[] storage ids = jobIdsByMandate[mandateId];
        for (uint256 i = 0; i < ids.length && sweptCount < maxN; i++) {
            uint256 jId = ids[i];
            OpenJob storage job = jobs[jId];
            if (job.phase == JobPhase.FUNDED) {
                job.phase = JobPhase.REFUNDED;
                IMandateTree(treeContract).releaseJobLocked(mandateId, jId, job.amount, false);
                sweptCount++;
                emit JobRefunded(jId, job.amount);
            }
        }
    }

    function getJob(uint256 jobId) external view override returns (OpenJob memory) {
        return jobs[jobId];
    }

    function getJobIdsByMandate(bytes32 mandateId) external view override returns (uint256[] memory) {
        return jobIdsByMandate[mandateId];
    }
}
