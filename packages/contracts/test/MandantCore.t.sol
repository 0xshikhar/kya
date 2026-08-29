// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/DataTypes.sol";
import "../src/MockUSDC.sol";
import "../src/MandateHub.sol";
import "../src/MandateTree.sol";
import "../src/JobAdapter.sol";
import "../src/evaluators/HashMatchEvaluator.sol";
import "../src/log/MandateLog.sol";

contract MandantCoreTest is Test {
    MockUSDC public usdc;
    MandateHub public hub;
    MandateTree public tree;
    JobAdapter public adapter;
    HashMatchEvaluator public evaluator;
    MandateLog public mandateLog;

    address public treasury = address(0x1111);
    address public leadOrchestrator = address(0x2222);
    address public workerAlpha = address(0x3333);
    address public workerBeta = address(0x4444);
    address public watchdog = address(0x5555);
    address public computeProvider = address(0x6666);
    address public unapprovedVendor = address(0x7777);

    bytes32 public rootId;
    bytes32 public alphaId;
    bytes32 public betaId;

    bytes32 public constant VALID_DELIVERABLE_HASH = keccak256("EXPECTED_INFERENCE_BATCH_OUTPUT_100M");
    bytes32 public constant INVALID_DELIVERABLE_HASH = keccak256("TAMPERED_OR_CORRUPTED_OUTPUT");

    function setUp() public {
        usdc = new MockUSDC();
        hub = new MandateHub(address(usdc));
        tree = new MandateTree(address(hub));
        adapter = new JobAdapter(address(hub), address(tree));
        evaluator = new HashMatchEvaluator(address(adapter));
        mandateLog = new MandateLog(address(tree), address(adapter));

        hub.setContracts(address(tree), address(adapter));
        tree.setAdapterAndLog(address(adapter), address(mandateLog));

        // Fund Treasury with $100,000 USDC
        usdc.mint(treasury, 100_000 * 1e6);
        vm.prank(treasury);
        usdc.approve(address(tree), type(uint256).max);
        vm.prank(treasury);
        usdc.approve(address(hub), type(uint256).max);

        // Treasury creates Root Mandate with $10,000 USDC
        address[] memory rootAllowlist = new address[](2);
        rootAllowlist[0] = computeProvider;
        rootAllowlist[1] = address(0x8888);

        vm.prank(treasury);
        rootId = tree.createRoot(
            treasury,
            leadOrchestrator,
            watchdog,
            address(usdc),
            10_000 * 1e6,
            uint64(block.timestamp + 7 days),
            rootAllowlist,
            bytes32(0)
        );
    }

    function test_InitialRootConservation() public view {
        MandateNode memory root = tree.getNode(rootId);
        assertEq(root.granted, 10_000 * 1e6);
        assertEq(root.idle, 10_000 * 1e6);
        assertEq(root.childGranted, 0);
        assertEq(root.jobLocked, 0);
        assertEq(uint256(root.status), uint256(NodeStatus.ACTIVE));
        assertEq(usdc.balanceOf(address(hub)), 10_000 * 1e6);

        // Invariant: idle + childGranted + jobLocked == granted
        assertEq(root.idle + root.childGranted + root.jobLocked, root.granted);
    }

    function test_SpawnAttenuatedChildren() public {
        address[] memory workerAllowlist = new address[](1);
        workerAllowlist[0] = computeProvider;

        // Lead Orchestrator spawns Worker Alpha ($3,000) and Worker Beta ($1,500)
        vm.startPrank(leadOrchestrator);
        alphaId = tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            3_000 * 1e6,
            uint64(block.timestamp + 3 days),
            workerAllowlist,
            bytes32(0)
        );

        betaId = tree.spawn(
            rootId,
            workerBeta,
            watchdog,
            1_500 * 1e6,
            uint64(block.timestamp + 3 days),
            workerAllowlist,
            bytes32(0)
        );
        vm.stopPrank();

        // Check Root state after spawns
        MandateNode memory root = tree.getNode(rootId);
        assertEq(root.idle, 5_500 * 1e6);
        assertEq(root.childGranted, 4_500 * 1e6);
        assertEq(root.childCount, 2);
        assertEq(root.idle + root.childGranted + root.jobLocked, root.granted);

        // Check Worker Alpha state
        MandateNode memory alpha = tree.getNode(alphaId);
        assertEq(alpha.granted, 3_000 * 1e6);
        assertEq(alpha.idle, 3_000 * 1e6);
        assertEq(alpha.depth, 1);
        assertEq(alpha.idle + alpha.childGranted + alpha.jobLocked, alpha.granted);
    }

    function test_RevertIfChildBudgetExceedsParentIdle() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        vm.prank(leadOrchestrator);
        vm.expectRevert("Budget exceeds parent idle");
        tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            10_001 * 1e6, // Exceeds parent's 10,000 idle!
            uint64(block.timestamp + 1 days),
            allowlist,
            bytes32(0)
        );
    }

    function test_RevertIfChildAllowlistNotSubset() public {
        address[] memory invalidAllowlist = new address[](1);
        invalidAllowlist[0] = unapprovedVendor; // Not in root allowlist!

        vm.prank(leadOrchestrator);
        vm.expectRevert("Child allowlist not subset of parent");
        tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            1_000 * 1e6,
            uint64(block.timestamp + 1 days),
            invalidAllowlist,
            bytes32(0)
        );
    }

    function test_OutcomeConditionedJobSettlementHappyPath() public {
        // Spawn Alpha with $2,000
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        vm.prank(leadOrchestrator);
        alphaId = tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            2_000 * 1e6,
            uint64(block.timestamp + 3 days),
            allowlist,
            bytes32(0)
        );

        // Alpha funds a $500 job with expected hash
        vm.prank(workerAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            computeProvider,
            address(evaluator),
            500 * 1e6,
            uint64(block.timestamp + 1 hours),
            VALID_DELIVERABLE_HASH
        );

        MandateNode memory alphaAfterFund = tree.getNode(alphaId);
        assertEq(alphaAfterFund.idle, 1_500 * 1e6);
        assertEq(alphaAfterFund.jobLocked, 500 * 1e6);

        // Provider delivers valid hash
        vm.prank(computeProvider);
        adapter.submitJob(jobId, VALID_DELIVERABLE_HASH);

        // Evaluator triggers evaluation
        evaluator.evaluate(jobId);

        // Verify USDC was released from Hub to computeProvider
        assertEq(usdc.balanceOf(computeProvider), 500 * 1e6);

        // Alpha node: jobLocked is cleared
        MandateNode memory alphaAfterComplete = tree.getNode(alphaId);
        assertEq(alphaAfterComplete.jobLocked, 0);
        assertEq(alphaAfterComplete.idle, 1_500 * 1e6);
    }

    function test_JobRejectionRefundsIdleBalance() public {
        // Spawn Alpha with $2,000
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        vm.prank(leadOrchestrator);
        alphaId = tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            2_000 * 1e6,
            uint64(block.timestamp + 3 days),
            allowlist,
            bytes32(0)
        );

        // Alpha funds $500 job
        vm.prank(workerAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            computeProvider,
            address(evaluator),
            500 * 1e6,
            uint64(block.timestamp + 1 hours),
            VALID_DELIVERABLE_HASH
        );

        // Provider submits invalid/corrupted hash
        vm.prank(computeProvider);
        adapter.submitJob(jobId, INVALID_DELIVERABLE_HASH);

        // Evaluator rejects
        evaluator.evaluate(jobId);

        // Provider receives $0
        assertEq(usdc.balanceOf(computeProvider), 0);

        // Alpha node: $500 is restored to idle!
        MandateNode memory alphaAfterReject = tree.getNode(alphaId);
        assertEq(alphaAfterReject.jobLocked, 0);
        assertEq(alphaAfterReject.idle, 2_000 * 1e6); // Fully refunded!
    }

    function test_SubtreeRevocationAndSiblingIsolation() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        // Spawn Alpha ($2,000) and Beta ($1,000)
        vm.startPrank(leadOrchestrator);
        alphaId = tree.spawn(rootId, workerAlpha, watchdog, 2_000 * 1e6, uint64(block.timestamp + 3 days), allowlist, bytes32(0));
        betaId = tree.spawn(rootId, workerBeta, watchdog, 1_000 * 1e6, uint64(block.timestamp + 3 days), allowlist, bytes32(0));
        vm.stopPrank();

        // Worker Beta exhibits anomalous / rogue behavior -> Watchdog triggers revokeSubtree!
        vm.prank(watchdog);
        tree.revokeSubtree(betaId);

        // Beta is REVOKED and its $1,000 idle is swept back into Root!
        MandateNode memory beta = tree.getNode(betaId);
        assertEq(uint256(beta.status), uint256(NodeStatus.REVOKED));
        assertEq(beta.idle, 0);

        // Root idle increases by Beta's unspent $1,000!
        MandateNode memory root = tree.getNode(rootId);
        assertEq(root.idle, 8_000 * 1e6); // 7,000 original remaining + 1,000 swept

        // Sibling Isolation: Worker Alpha remains ACTIVE and can execute jobs uninterrupted!
        MandateNode memory alpha = tree.getNode(alphaId);
        assertEq(uint256(alpha.status), uint256(NodeStatus.ACTIVE));
        assertEq(alpha.idle, 2_000 * 1e6);

        // Alpha successfully funds and executes a job
        vm.prank(workerAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            computeProvider,
            address(evaluator),
            300 * 1e6,
            uint64(block.timestamp + 1 hours),
            VALID_DELIVERABLE_HASH
        );

        vm.prank(computeProvider);
        adapter.submitJob(jobId, VALID_DELIVERABLE_HASH);
        evaluator.evaluate(jobId);

        assertEq(usdc.balanceOf(computeProvider), 300 * 1e6);

        // Revoked Beta cannot fund or spawn anything!
        vm.prank(workerBeta);
        vm.expectRevert("Mandate revoked");
        adapter.fundJob(
            betaId,
            computeProvider,
            address(evaluator),
            100 * 1e6,
            uint64(block.timestamp + 1 hours),
            VALID_DELIVERABLE_HASH
        );
    }

    /// @notice A1: Nested revoke sweeps grandchild idle back to Root
    function test_NestedRevokeSweepsGrandchildIdleToRoot() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        // Root ($10,000) -> Child ($4,000) -> Grandchild ($1,000)
        vm.prank(leadOrchestrator);
        bytes32 childId = tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            4_000 * 1e6,
            uint64(block.timestamp + 4 days),
            allowlist,
            bytes32(0)
        );

        vm.prank(workerAlpha);
        bytes32 grandchildId = tree.spawn(
            childId,
            workerBeta,
            watchdog,
            1_000 * 1e6,
            uint64(block.timestamp + 2 days),
            allowlist,
            bytes32(0)
        );

        // State before revoke:
        // Root idle = 6,000, childGranted = 4,000
        // Child idle = 3,000, childGranted = 1,000
        // Grandchild idle = 1,000
        MandateNode memory rBefore = tree.getNode(rootId);
        assertEq(rBefore.idle, 6_000 * 1e6);
        assertEq(rBefore.childGranted, 4_000 * 1e6);

        // Revoke Child subtree
        vm.prank(watchdog);
        tree.revokeSubtree(childId);

        // Child and Grandchild are both REVOKED
        assertEq(uint256(tree.getNode(childId).status), uint256(NodeStatus.REVOKED));
        assertEq(uint256(tree.getNode(grandchildId).status), uint256(NodeStatus.REVOKED));

        // Root idle has swept Child idle (3,000) + Grandchild idle (1,000) = 10,000 total!
        MandateNode memory rAfter = tree.getNode(rootId);
        assertEq(rAfter.idle, 10_000 * 1e6);
        assertEq(rAfter.childGranted, 0);

        // Conservation invariant holds at Root
        assertEq(rAfter.idle + rAfter.childGranted + rAfter.jobLocked, rAfter.granted);

        // Grandchild next fundJob reverts
        vm.prank(workerBeta);
        vm.expectRevert("Mandate revoked");
        adapter.fundJob(
            grandchildId,
            computeProvider,
            address(evaluator),
            100 * 1e6,
            uint64(block.timestamp + 1 hours),
            VALID_DELIVERABLE_HASH
        );
    }

    /// @notice A2: sweepFunded refunds locked job capital after mandate revocation
    function test_SweepFundedAfterRevoke() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        vm.prank(leadOrchestrator);
        alphaId = tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            2_000 * 1e6,
            uint64(block.timestamp + 3 days),
            allowlist,
            bytes32(0)
        );

        // Alpha funds a $500 job
        vm.prank(workerAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            computeProvider,
            address(evaluator),
            500 * 1e6,
            uint64(block.timestamp + 1 hours),
            VALID_DELIVERABLE_HASH
        );
        assertTrue(jobId > 0);

        MandateNode memory alphaBefore = tree.getNode(alphaId);
        assertEq(alphaBefore.idle, 1_500 * 1e6);
        assertEq(alphaBefore.jobLocked, 500 * 1e6);

        // Revoke Alpha
        vm.prank(watchdog);
        tree.revokeSubtree(alphaId);

        // Unspent idle (1,500) swept to Root. Root idle is 8,000 + 1,500 = 9,500
        MandateNode memory rootMid = tree.getNode(rootId);
        assertEq(rootMid.idle, 9_500 * 1e6);

        // Alpha still has 500 in jobLocked
        MandateNode memory alphaMid = tree.getNode(alphaId);
        assertEq(alphaMid.jobLocked, 500 * 1e6);

        // Watchdog sweeps funded jobs
        vm.prank(watchdog);
        uint256 sweptCount = adapter.sweepFunded(alphaId, 8);
        assertEq(sweptCount, 1);

        // Alpha jobLocked is 0, Root idle is fully restored to 10,000!
        MandateNode memory alphaEnd = tree.getNode(alphaId);
        assertEq(alphaEnd.jobLocked, 0);

        MandateNode memory rootEnd = tree.getNode(rootId);
        assertEq(rootEnd.idle, 10_000 * 1e6);
        assertEq(rootEnd.childGranted, 0);
        assertEq(usdc.balanceOf(computeProvider), 0);
    }

    /// @notice A3: Hub.deposit credits granted and idle on Root mandate
    function test_DepositCreditsRootIdle() public {
        MandateNode memory beforeRoot = tree.getNode(rootId);
        assertEq(beforeRoot.granted, 10_000 * 1e6);
        assertEq(beforeRoot.idle, 10_000 * 1e6);

        // Treasury deposits an additional $500 into Hub
        vm.prank(treasury);
        hub.deposit(rootId, 500 * 1e6);

        MandateNode memory afterRoot = tree.getNode(rootId);
        assertEq(afterRoot.granted, 10_500 * 1e6);
        assertEq(afterRoot.idle, 10_500 * 1e6);
        assertEq(usdc.balanceOf(address(hub)), 10_500 * 1e6);
        assertEq(afterRoot.idle + afterRoot.childGranted + afterRoot.jobLocked, afterRoot.granted);
    }

    /// @notice A4: Child node owner is always root treasury
    function test_ChildOwnerIsRootTreasury() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        vm.prank(leadOrchestrator);
        alphaId = tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            1_000 * 1e6,
            uint64(block.timestamp + 2 days),
            allowlist,
            bytes32(0)
        );

        MandateNode memory alpha = tree.getNode(alphaId);
        assertEq(alpha.owner, treasury); // Root treasury, NOT leadOrchestrator!
        assertEq(alpha.agent, workerAlpha);
    }

    /// @notice A6: Zero grant watchdog node cannot fund jobs
    function test_ZeroGrantWatchdogCannotFund() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        address watchdogAgent = address(0x9999);

        // Spawn $0 watchdog node
        vm.prank(leadOrchestrator);
        bytes32 watchdogNodeId = tree.spawn(
            rootId,
            watchdogAgent,
            address(0),
            0,
            uint64(block.timestamp + 2 days),
            allowlist,
            keccak256("WATCHDOG_POLICY")
        );

        MandateNode memory wNode = tree.getNode(watchdogNodeId);
        assertEq(wNode.granted, 0);
        assertEq(wNode.idle, 0);

        // Attempting to fund a job from $0 watchdog node must revert
        vm.prank(watchdogAgent);
        vm.expectRevert("Zero grant cannot fund jobs");
        adapter.fundJob(
            watchdogNodeId,
            computeProvider,
            address(evaluator),
            100 * 1e6,
            uint64(block.timestamp + 1 hours),
            VALID_DELIVERABLE_HASH
        );
    }

    /// @notice A6: Watchdog revokes sibling worker node
    function test_WatchdogRevokesSibling() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        address watchdogAgent = address(0x9999);

        vm.startPrank(leadOrchestrator);
        alphaId = tree.spawn(
            rootId,
            workerAlpha,
            watchdogAgent,
            2_000 * 1e6,
            uint64(block.timestamp + 2 days),
            allowlist,
            bytes32(0)
        );
        tree.spawn(
            rootId,
            watchdogAgent,
            address(0),
            0,
            uint64(block.timestamp + 2 days),
            allowlist,
            keccak256("WATCHDOG_POLICY")
        );
        vm.stopPrank();

        // Watchdog revokes sibling Alpha
        vm.prank(watchdogAgent);
        tree.revokeSubtree(alphaId);

        MandateNode memory alpha = tree.getNode(alphaId);
        assertEq(uint256(alpha.status), uint256(NodeStatus.REVOKED));
        assertEq(alpha.idle, 0);
    }

    /// @notice A7: Expiry sweeps idle funds up to parent/root
    function test_ExpirySweepsIdle() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        uint64 expiryTime = uint64(block.timestamp + 1 days);

        vm.prank(leadOrchestrator);
        alphaId = tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            2_000 * 1e6,
            expiryTime,
            allowlist,
            bytes32(0)
        );

        MandateNode memory rootBefore = tree.getNode(rootId);
        assertEq(rootBefore.idle, 8_000 * 1e6);

        // Warp past Alpha's expiry
        vm.warp(block.timestamp + 2 days);

        // Sync Alpha
        tree.sync(alphaId);

        MandateNode memory alpha = tree.getNode(alphaId);
        assertEq(uint256(alpha.status), uint256(NodeStatus.EXPIRED));
        assertEq(alpha.idle, 0);

        // Root idle is restored to 10,000!
        MandateNode memory rootAfter = tree.getNode(rootId);
        assertEq(rootAfter.idle, 10_000 * 1e6);
        assertEq(rootAfter.childGranted, 0);
    }

    /// @notice A8: Direct complete call from EOA reverts; only evaluate() can complete
    function test_CompleteOnlyViaEvaluator() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        vm.prank(leadOrchestrator);
        alphaId = tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            1_000 * 1e6,
            uint64(block.timestamp + 2 days),
            allowlist,
            bytes32(0)
        );

        vm.prank(workerAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            computeProvider,
            address(evaluator),
            500 * 1e6,
            uint64(block.timestamp + 1 hours),
            VALID_DELIVERABLE_HASH
        );

        vm.prank(computeProvider);
        adapter.submitJob(jobId, VALID_DELIVERABLE_HASH);

        // Direct call from Alpha agent reverts
        vm.prank(workerAlpha);
        vm.expectRevert("Only evaluator can complete");
        adapter.complete(jobId);

        // Direct call from compute provider reverts
        vm.prank(computeProvider);
        vm.expectRevert("Only evaluator can complete");
        adapter.complete(jobId);

        // Evaluator evaluation completes successfully
        bool passed = evaluator.evaluate(jobId);
        assertTrue(passed);
        assertEq(usdc.balanceOf(computeProvider), 500 * 1e6);
    }

    /// @notice Timeout auto-refund path when provider fails to deliver before deadline
    function test_RefundExpired() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        vm.prank(leadOrchestrator);
        alphaId = tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            1_000 * 1e6,
            uint64(block.timestamp + 2 days),
            allowlist,
            bytes32(0)
        );

        uint64 jobDeadline = uint64(block.timestamp + 1 hours);

        vm.prank(workerAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            computeProvider,
            address(evaluator),
            400 * 1e6,
            jobDeadline,
            VALID_DELIVERABLE_HASH
        );

        // Attempting refund before deadline reverts
        vm.expectRevert("Deadline not passed");
        adapter.refundExpired(jobId);

        // Warp past deadline
        vm.warp(block.timestamp + 2 hours);

        // Anyone triggers refundExpired
        adapter.refundExpired(jobId);

        OpenJob memory job = adapter.getJob(jobId);
        assertEq(uint256(job.phase), uint256(JobPhase.REFUNDED));

        // Funds restored to Alpha's idle
        MandateNode memory alpha = tree.getNode(alphaId);
        assertEq(alpha.jobLocked, 0);
        assertEq(alpha.idle, 1_000 * 1e6);
    }

    /// @notice Reverts if provider is not on mandate allowlist
    function test_OffAllowlistFundReverts() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        vm.prank(leadOrchestrator);
        alphaId = tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            1_000 * 1e6,
            uint64(block.timestamp + 2 days),
            allowlist,
            bytes32(0)
        );

        vm.prank(workerAlpha);
        vm.expectRevert("Provider not on allowlist");
        adapter.fundJob(
            alphaId,
            unapprovedVendor, // Off allowlist!
            address(evaluator),
            100 * 1e6,
            uint64(block.timestamp + 1 hours),
            VALID_DELIVERABLE_HASH
        );
    }

    /// @notice Reverts if job amount exceeds node idle budget
    function test_OverBudgetFundReverts() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = computeProvider;

        vm.prank(leadOrchestrator);
        alphaId = tree.spawn(
            rootId,
            workerAlpha,
            watchdog,
            1_000 * 1e6,
            uint64(block.timestamp + 2 days),
            allowlist,
            bytes32(0)
        );

        vm.prank(workerAlpha);
        vm.expectRevert("Insufficient idle balance");
        adapter.fundJob(
            alphaId,
            computeProvider,
            address(evaluator),
            1_500 * 1e6, // Exceeds 1,000 idle!
            uint64(block.timestamp + 1 hours),
            VALID_DELIVERABLE_HASH
        );
    }
}
