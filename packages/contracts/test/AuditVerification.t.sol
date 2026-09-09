// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";
import "../src/MandateHub.sol";
import "../src/MandateTree.sol";
import "../src/JobAdapter.sol";
import "../src/evaluators/HashMatchEvaluator.sol";
import "../src/registry/CredentialRegistry.sol";
import "../src/log/MandateLog.sol";

contract MaliciousEvaluator is IEvaluator {
    address public adapter;
    bool public hasReentered;
    bool public reentrancyReverted;

    constructor(address _adapter) {
        adapter = _adapter;
    }

    function evaluate(uint256 jobId) external override returns (bool) {
        // Initial valid completion
        IERC8183(adapter).complete(jobId);

        // Malicious evaluator attempts double-spend reentrancy
        hasReentered = true;
        try IERC8183(adapter).complete(jobId) {
            // Should not succeed
        } catch {
            reentrancyReverted = true;
        }
        return true;
    }

    function evaluateWithProof(uint256 jobId, bytes calldata) external override returns (bool) {
        return this.evaluate(jobId);
    }
}

contract AuditVerificationTest is Test {
    MockUSDC usdc;
    MandateHub hub;
    MandateTree tree;
    JobAdapter adapter;
    HashMatchEvaluator hashEvaluator;
    CredentialRegistry credentialRegistry;
    MandateLog mandateLog;

    address owner = address(0xAA11);
    address watchdog = address(0xBB22);
    address attacker = address(0xDEADC0DE);

    address agentRoot = address(0x1000);
    address agentL1 = address(0x1001);
    address agentL2 = address(0x1002);
    address agentL3 = address(0x1003);
    address provider = address(0x2000);

    bytes32 rootId;

    function setUp() public {
        vm.warp(10_000);

        usdc = new MockUSDC();
        hub = new MandateHub(address(usdc));
        tree = new MandateTree(address(hub));
        adapter = new JobAdapter(address(hub), address(tree));
        hashEvaluator = new HashMatchEvaluator(address(adapter));
        credentialRegistry = new CredentialRegistry(address(tree));
        mandateLog = new MandateLog(address(tree), address(adapter));

        hub.setContracts(address(tree), address(adapter));
        tree.setAdapterAndLog(address(adapter), address(mandateLog));

        // Fund owner with $100,000 USDC
        usdc.mint(owner, 100_000 * 1e6);

        vm.startPrank(owner);
        usdc.approve(address(tree), type(uint256).max);
        usdc.approve(address(hub), type(uint256).max);

        address[] memory allowlist = new address[](2);
        allowlist[0] = address(adapter);
        allowlist[1] = provider;

        rootId = tree.createRoot(
            owner,
            agentRoot,
            watchdog,
            address(usdc),
            10_000 * 1e6, // $10,000
            uint64(block.timestamp + 30 days),
            allowlist,
            bytes32(0)
        );
        vm.stopPrank();
    }

    // 1. REENTRANCY PENETRATION TEST
    function test_Audit_ReentrancyAttackOnCompleteFails() public {
        MaliciousEvaluator maliciousEvaluator = new MaliciousEvaluator(address(adapter));

        vm.prank(agentRoot);
        uint256 jobId = adapter.fundJob(
            rootId,
            provider,
            address(maliciousEvaluator),
            500 * 1e6,
            uint64(block.timestamp + 1 days),
            keccak256("task")
        );

        vm.prank(provider);
        adapter.submitJob(jobId, keccak256("task"));

        // Malicious evaluator attempts reentrancy during evaluate()
        vm.prank(address(maliciousEvaluator));
        maliciousEvaluator.evaluate(jobId);

        // Verify that reentrancy was attempted and blocked
        OpenJob memory job = adapter.getJob(jobId);
        assertEq(uint8(job.phase), uint8(JobPhase.COMPLETED));
        assertEq(maliciousEvaluator.hasReentered(), true);
        assertEq(maliciousEvaluator.reentrancyReverted(), true);
    }

    // 2. GRIEFING / UNAUTHORIZED SWEEP ATTACK
    function test_Audit_UnauthorizedAttackerCannotRevokeOrSweep() public {
        vm.prank(attacker);
        vm.expectRevert("Unauthorized to revoke");
        tree.revokeSubtree(rootId);

        vm.prank(attacker);
        vm.expectRevert("Unauthorized to sweep funded jobs");
        adapter.sweepFunded(rootId, 5);
    }

    // 3. MULTI-LEVEL HIERARCHY CONSERVATION UNDER NESTED REVOCATION
    function test_Audit_FourLevelDeepConservationUnderRevocation() public {
        address[] memory allowlist = new address[](2);
        allowlist[0] = address(adapter);
        allowlist[1] = provider;

        // L1: 4,000 USDC
        vm.prank(agentRoot);
        bytes32 l1Id = tree.spawn(
            rootId,
            agentL1,
            watchdog,
            4_000 * 1e6,
            uint64(block.timestamp + 20 days),
            allowlist,
            bytes32(0)
        );

        // L2: 1,500 USDC
        vm.prank(agentL1);
        bytes32 l2Id = tree.spawn(
            l1Id,
            agentL2,
            watchdog,
            1_500 * 1e6,
            uint64(block.timestamp + 15 days),
            allowlist,
            bytes32(0)
        );

        // L3: 500 USDC
        vm.prank(agentL2);
        bytes32 l3Id = tree.spawn(
            l2Id,
            agentL3,
            watchdog,
            500 * 1e6,
            uint64(block.timestamp + 10 days),
            allowlist,
            bytes32(0)
        );

        // Fund job at L3: 100 USDC
        vm.prank(agentL3);
        uint256 l3JobId = adapter.fundJob(
            l3Id,
            provider,
            address(hashEvaluator),
            100 * 1e6,
            uint64(block.timestamp + 2 days),
            keccak256("l3_task")
        );

        // Check pre-revocation conservation at Root:
        MandateNode memory rBefore = tree.getNode(rootId);
        assertEq(rBefore.idle + rBefore.childGranted + rBefore.jobLocked, rBefore.granted);

        // Revoke L1 subtree (sweeps L3 and L2 unspent idle up through L1 to Root)
        vm.prank(owner);
        tree.revokeSubtree(l1Id);

        MandateNode memory rAfter = tree.getNode(rootId);
        // Idle is 9,900 USDC; 100 USDC remains allocated to L3's open job
        assertEq(rAfter.idle, 9_900 * 1e6);
        assertEq(rAfter.childGranted, 100 * 1e6);
        assertEq(rAfter.jobLocked, 0);
        assertEq(rAfter.idle + rAfter.childGranted + rAfter.jobLocked, rAfter.granted);

        // Sweep the revoked L3 open job -> refunds 100 USDC all the way to Root!
        vm.prank(owner);
        adapter.sweepFunded(l3Id, 1);

        MandateNode memory rFinal = tree.getNode(rootId);
        assertEq(rFinal.idle, 10_000 * 1e6);
        assertEq(rFinal.childGranted, 0);
        assertEq(rFinal.jobLocked, 0);
        assertEq(rFinal.idle, rFinal.granted);
    }

    // 4. DELIVERABLE FRONT-RUNNING & TAMPERING PROTECTION
    function test_Audit_AttackerCannotFrontRunOrAlterDeliverable() public {
        bytes32 expectedHash = keccak256("secret_solution");

        vm.prank(agentRoot);
        uint256 jobId = adapter.fundJob(
            rootId,
            provider,
            address(hashEvaluator),
            1_000 * 1e6,
            uint64(block.timestamp + 1 days),
            expectedHash
        );

        // Attacker attempts to submit wrong solution or front-run provider
        vm.prank(attacker);
        vm.expectRevert("Only provider can submit");
        adapter.submitJob(jobId, keccak256("attacker_solution"));

        // Attacker attempts to complete without evaluator
        vm.prank(attacker);
        vm.expectRevert("Job not submitted");
        adapter.complete(jobId);

        // Legitimate provider submits
        vm.prank(provider);
        adapter.submitJob(jobId, expectedHash);

        // Attacker tries to submit a second time
        vm.prank(provider);
        vm.expectRevert("Job not in funded phase");
        adapter.submitJob(jobId, keccak256("second_submit"));
    }

    // 5. SOULBOUND CREDENTIAL NON-TRANSFERABILITY
    function test_Audit_SoulboundCredentialCannotBeTransferred() public {
        bytes32 agentId = keccak256("agent_soulbound_test");

        vm.prank(owner);
        uint256 tokenId = credentialRegistry.registerAgent(agentId, agentRoot, "ipfs://metadata-hash");

        assertEq(credentialRegistry.locked(tokenId), true);

        vm.prank(agentRoot);
        vm.expectRevert("Soulbound: Token cannot be transferred");
        credentialRegistry.transferFrom(agentRoot, attacker, tokenId);
    }
}
