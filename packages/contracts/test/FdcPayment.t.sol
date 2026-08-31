// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/DataTypes.sol";
import "../src/MockUSDC.sol";
import "../src/MandateHub.sol";
import "../src/MandateTree.sol";
import "../src/JobAdapter.sol";
import "../src/evaluators/FdcPaymentEvaluator.sol";
import "../src/mocks/MockFdcVerification.sol";

contract FdcPaymentTest is Test {
    MockUSDC public usdc;
    MandateHub public hub;
    MandateTree public tree;
    JobAdapter public adapter;
    FdcPaymentEvaluator public evaluator;
    MockFdcVerification public mockFdc;

    address public treasury = address(0x1111);
    address public agentAlpha = address(0x2222);
    address public watchdog = address(0x3333);
    address public provider = address(0x4444);

    bytes32 public rootId;
    bytes32 public alphaId;

    bytes32 public constant XRPL_DEST_HASH = keccak256("rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh");
    bytes32 public constant PAYMENT_REF = keccak256("KYA_JOB_ESCROW_SETTLEMENT_REF");

    function setUp() public {
        vm.warp(10_000);
        usdc = new MockUSDC();
        hub = new MandateHub(address(usdc));
        tree = new MandateTree(address(hub));
        adapter = new JobAdapter(address(hub), address(tree));
        mockFdc = new MockFdcVerification();
        evaluator = new FdcPaymentEvaluator(address(adapter), address(mockFdc));

        hub.setContracts(address(tree), address(adapter));
        tree.setAdapterAndLog(address(adapter), address(0));

        // Fund Treasury
        usdc.mint(treasury, 100_000 * 1e6);
        vm.prank(treasury);
        usdc.approve(address(tree), type(uint256).max);

        // Create Root
        address[] memory allowlist = new address[](2);
        allowlist[0] = address(evaluator);
        allowlist[1] = provider;

        vm.prank(treasury);
        rootId = tree.createRoot(
            treasury,
            treasury,
            watchdog,
            address(usdc),
            50_000 * 1e6, // $50,000 USDC
            uint64(block.timestamp + 86400),
            allowlist,
            bytes32(0)
        );

        // Spawn Agent Alpha with $5,000 grant
        vm.prank(treasury);
        alphaId = tree.spawn(
            rootId,
            agentAlpha,
            watchdog,
            5_000 * 1e6,
            uint64(block.timestamp + 43200),
            allowlist,
            bytes32(0)
        );
    }

    function _buildValidProof(
        bytes32 destHash,
        int256 amount,
        bytes32 ref
    ) internal view returns (IFdcVerification.PaymentProof memory) {
        bytes32[] memory merkleProof = new bytes32[](1);
        merkleProof[0] = keccak256("LEAF_1");

        return IFdcVerification.PaymentProof({
            merkleProof: merkleProof,
            data: IFdcVerification.PaymentData({
                attestationType: bytes32("Payment"),
                sourceId: bytes32("XRPL"),
                votingRound: 10420,
                lowestUsedTimestamp: uint64(block.timestamp - 60),
                requestBody: IFdcVerification.PaymentRequestBody({
                    transactionId: keccak256("TX_XRPL_HASH_99182"),
                    inUtxo: false,
                    utxo: 0
                }),
                responseBody: IFdcVerification.PaymentResponseBody({
                    blockNumber: 849201,
                    blockTimestamp: uint64(block.timestamp - 30),
                    sourceAddressHash: keccak256("rPVMhWBsfF9iMXYj3aAzJVkPDTFNSyWdKy"),
                    receivingAddressHash: destHash,
                    intendedAmount: amount,
                    receivedAmount: amount,
                    standardPaymentReference: ref,
                    oneToOne: true,
                    status: true
                })
            })
        });
    }

    function test_HappyPath_FdcPaymentSettlesJob() public {
        // 1. Agent Alpha funds $200 job conditioned on FDC XRPL payment
        uint128 jobAmount = 200 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        // 2. Set expected XRPL condition
        evaluator.setCondition(jobId, XRPL_DEST_HASH, int256(uint256(jobAmount)), PAYMENT_REF);

        // 3. Provider submits job deliverable
        vm.prank(provider);
        adapter.submitJob(jobId, keccak256("XRPL_PROOF_DELIVERABLE"));

        // 4. Provider/relayer submits matching FDC proof
        IFdcVerification.PaymentProof memory proof = _buildValidProof(XRPL_DEST_HASH, int256(uint256(jobAmount)), PAYMENT_REF);

        vm.prank(provider);
        bool evaluated = evaluator.evaluateWithProof(jobId, abi.encode(proof));
        assertTrue(evaluated);

        // 4. Verify provider received 200 USDC and job completed
        assertEq(usdc.balanceOf(provider), jobAmount);
        OpenJob memory job = adapter.getJob(jobId);
        assertEq(uint8(job.phase), uint8(JobPhase.COMPLETED));

        // Invariant check on Alpha node
        MandateNode memory node = tree.getNode(alphaId);
        assertEq(node.idle, 4_800 * 1e6);
        assertEq(node.jobLocked, 0);
    }

    function test_RevertIf_MismatchedPaymentMemo() public {
        uint128 jobAmount = 200 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        evaluator.setCondition(jobId, XRPL_DEST_HASH, int256(uint256(jobAmount)), PAYMENT_REF);

        // Proof carries wrong memo reference
        bytes32 wrongMemo = keccak256("WRONG_FORGED_MEMO");
        IFdcVerification.PaymentProof memory proof = _buildValidProof(XRPL_DEST_HASH, int256(uint256(jobAmount)), wrongMemo);

        vm.expectRevert("Mismatched payment memo reference");
        evaluator.evaluateWithProof(jobId, abi.encode(proof));
    }

    function test_RevertIf_MismatchedDestination() public {
        uint128 jobAmount = 200 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        evaluator.setCondition(jobId, XRPL_DEST_HASH, int256(uint256(jobAmount)), PAYMENT_REF);

        bytes32 wrongDest = keccak256("rUnapprovedAddress123");
        IFdcVerification.PaymentProof memory proof = _buildValidProof(wrongDest, int256(uint256(jobAmount)), PAYMENT_REF);

        vm.expectRevert("Mismatched destination address");
        evaluator.evaluateWithProof(jobId, abi.encode(proof));
    }

    function test_RevertIf_InsufficientAmount() public {
        uint128 jobAmount = 200 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        evaluator.setCondition(jobId, XRPL_DEST_HASH, int256(uint256(jobAmount)), PAYMENT_REF);

        // Only sent $100 instead of $200
        IFdcVerification.PaymentProof memory proof = _buildValidProof(XRPL_DEST_HASH, 100 * 1e6, PAYMENT_REF);

        vm.expectRevert("Insufficient payment amount");
        evaluator.evaluateWithProof(jobId, abi.encode(proof));
    }

    function test_RevertIf_SourceTransactionFailed() public {
        uint128 jobAmount = 200 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        evaluator.setCondition(jobId, XRPL_DEST_HASH, int256(uint256(jobAmount)), PAYMENT_REF);

        IFdcVerification.PaymentProof memory proof = _buildValidProof(XRPL_DEST_HASH, int256(uint256(jobAmount)), PAYMENT_REF);
        proof.data.responseBody.status = false; // source tx reverted

        vm.expectRevert("Payment transaction failed on source chain");
        evaluator.evaluateWithProof(jobId, abi.encode(proof));
    }

    function test_RevertIf_InvalidMerkleProof() public {
        uint128 jobAmount = 200 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        evaluator.setCondition(jobId, XRPL_DEST_HASH, int256(uint256(jobAmount)), PAYMENT_REF);

        mockFdc.setVerifyPaymentPass(false); // mock FDC rejecting Merkle proof
        IFdcVerification.PaymentProof memory proof = _buildValidProof(XRPL_DEST_HASH, int256(uint256(jobAmount)), PAYMENT_REF);

        vm.expectRevert("FDC Merkle proof verification failed");
        evaluator.evaluateWithProof(jobId, abi.encode(proof));
    }

    function test_DeadlineExpiryRefundsIdleBalance() public {
        uint128 jobAmount = 300 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 600), // 10 min deadline
            bytes32(0)
        );

        MandateNode memory nodeBefore = tree.getNode(alphaId);
        assertEq(nodeBefore.idle, 4_700 * 1e6);
        assertEq(nodeBefore.jobLocked, 300 * 1e6);

        // Warp past deadline
        vm.warp(block.timestamp + 601);

        adapter.refundExpired(jobId);

        MandateNode memory nodeAfter = tree.getNode(alphaId);
        assertEq(nodeAfter.idle, 5_000 * 1e6); // fully refunded
        assertEq(nodeAfter.jobLocked, 0);
    }

    function test_MidJobRevocationSweepsFundedJob() public {
        uint128 jobAmount = 400 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        // Revoke Alpha subtree mid-job
        vm.prank(watchdog);
        tree.revokeSubtree(alphaId);

        // Sweep open funded job
        adapter.sweepFunded(alphaId, 5);

        OpenJob memory job = adapter.getJob(jobId);
        assertEq(uint8(job.phase), uint8(JobPhase.REFUNDED));

        // Ensure Root Treasury recaptured Alpha's funds
        MandateNode memory root = tree.getNode(rootId);
        assertEq(root.idle, 50_000 * 1e6);
    }
}
