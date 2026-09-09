// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/MandateHub.sol";
import "../src/MandateTree.sol";
import "../src/JobAdapter.sol";
import "../src/PolicyEngine.sol";
import "../src/evaluators/HashMatchEvaluator.sol";
import "../src/registry/CredentialRegistry.sol";
import "../src/DataTypes.sol";

/// @title InteractKyaCoston2
/// @notice End-to-end live onchain interaction and mathematical verification on Flare Coston2 testnet
contract InteractKyaCoston2 is Script {
    // Deployed Coston2 Protocol Addresses
    address public constant USDC_ADDR = 0x419cFe85e77a0A26B9989059057318F59764F7C5;
    address public constant HUB_ADDR = 0x9f1888516d1c087F835F594892B915dD9DCbe5f1;
    address public constant TREE_ADDR = 0xa6A6dcad668470D3BfC5c73938B4558e5aad1505;
    address public constant ADAPTER_ADDR = 0x7c6aa54Eaeea04Cf8950b1451faF0B21CB6037c2;
    address public constant POLICY_ADDR = 0x766E384Bcf39b95A922BAd71098533bf652BfA11;
    address public constant HASH_EVALUATOR_ADDR = 0xfeEd714CCA799FA57e6aE25f8FE009Dd4fA854e3;
    address public constant CREDENTIAL_REGISTRY_ADDR = 0x07Bf0C7c2168647642f1E9fb4076cdEF0aDb4D6D;

    function run() external {
        vm.startBroadcast();
        address deployer = msg.sender;
        MockUSDC usdc = MockUSDC(USDC_ADDR);
        MandateTree tree = MandateTree(TREE_ADDR);

        console.log("=================================================================");
        console.log("   KYA NETWORK - LIVE COSTON2 MULTI-CONTRACT INTERACTION TEST   ");
        console.log("=================================================================");
        console.log("Actor / Operator: ", deployer);
        console.log("USDC Balance:     ", usdc.balanceOf(deployer) / 1e6, "USDC");

        _step1_registerAgent(deployer);
        bytes32 rootPolicyHash = _step2_configurePolicy(deployer);
        bytes32 rootId = _step3_createRoot(deployer, usdc, tree, rootPolicyHash);
        bytes32 childId = _step4_spawnChild(deployer, tree, rootId);
        _step5_fundAndSettleJob(deployer, usdc, tree, childId);
        _step6_emergencyQuarantine(tree, rootId, childId);

        vm.stopBroadcast();

        console.log("=================================================================");
        console.log("   ALL CONTRACTS INTERACTED & VERIFIED LIVE ON FLARE COSTON2!   ");
        console.log("=================================================================");
    }

    function _step1_registerAgent(address deployer) internal {
        CredentialRegistry credentialRegistry = CredentialRegistry(CREDENTIAL_REGISTRY_ADDR);
        bytes32 agentId = keccak256(abi.encodePacked("KYA_AGENT_COSTON2_", block.timestamp));
        uint256 credentialTokenId = credentialRegistry.registerAgent(
            agentId,
            deployer,
            "ipfs://bafybeikyaagentcoston2metadata"
        );
        console.log("[Step 1] Minted Soulbound Agent Credential NFT ID:", credentialTokenId);
    }

    function _step2_configurePolicy(address deployer) internal returns (bytes32) {
        PolicyEngine policyEngine = PolicyEngine(POLICY_ADDR);
        bytes32 rootPolicyHash = keccak256("POLICY_ROOT_COSTON2_V1");

        address[] memory targets = new address[](1);
        targets[0] = deployer;
        bytes4[] memory selectors = new bytes4[](0);

        policyEngine.setPolicy(
            rootPolicyHash,
            100 * 1e18,  // $100 per call cap
            500 * 1e18,  // $500 per hour cap
            1000 * 1e18, // $1000 per day cap
            0,           // 0s cooldown for instant test
            targets,
            selectors
        );
        console.log("[Step 2] Configured FTSOv2 USD Policy on PolicyEngine");
        return rootPolicyHash;
    }

    function _step3_createRoot(
        address deployer,
        MockUSDC usdc,
        MandateTree tree,
        bytes32 rootPolicyHash
    ) internal returns (bytes32) {
        uint128 rootDeposit = 2000 * 1e6; // 2,000 USDC
        usdc.approve(address(tree), rootDeposit);

        address[] memory allowlist = new address[](2);
        allowlist[0] = deployer;
        allowlist[1] = HASH_EVALUATOR_ADDR;

        bytes32 rootId = tree.createRoot(
            deployer,
            deployer,
            deployer,
            USDC_ADDR,
            rootDeposit,
            uint64(block.timestamp + 86400),
            allowlist,
            rootPolicyHash
        );
        console.log("[Step 3] Created Root Mandate:", vm.toString(rootId));

        MandateNode memory rootNode = tree.getNode(rootId);
        console.log("         Root Granted:   ", uint256(rootNode.granted) / 1e6, "USDC");
        console.log("         Root Idle:      ", uint256(rootNode.idle) / 1e6, "USDC");
        require(rootNode.idle == rootDeposit, "Root idle balance mismatch");
        return rootId;
    }

    function _step4_spawnChild(
        address deployer,
        MandateTree tree,
        bytes32 rootId
    ) internal returns (bytes32) {
        uint128 childGrant = 500 * 1e6; // 500 USDC
        bytes32 childPolicyHash = keccak256("POLICY_CHILD_FASSETS_COPILOT_V1");

        address[] memory childAllowlist = new address[](2);
        childAllowlist[0] = deployer;
        childAllowlist[1] = HASH_EVALUATOR_ADDR;

        bytes32 childId = tree.spawn(
            rootId,
            deployer,
            deployer,
            childGrant,
            uint64(block.timestamp + 43200),
            childAllowlist,
            childPolicyHash
        );
        console.log("[Step 4] Spawned Child Worker:", vm.toString(childId));

        MandateNode memory rootNode = tree.getNode(rootId);
        MandateNode memory childNode = tree.getNode(childId);
        console.log("         Root Idle Balance:  ", uint256(rootNode.idle) / 1e6, "USDC");
        console.log("         Root Child Granted: ", uint256(rootNode.childGranted) / 1e6, "USDC");
        console.log("         Child Idle Balance: ", uint256(childNode.idle) / 1e6, "USDC");

        require(rootNode.idle + rootNode.childGranted == rootNode.granted, "Root conservation broken after spawn");
        console.log("         [OK] L0 Conservation Holds: 1500 Idle + 500 Child = 2000 Granted");
        return childId;
    }

    function _step5_fundAndSettleJob(
        address deployer,
        MockUSDC usdc,
        MandateTree tree,
        bytes32 childId
    ) internal {
        JobAdapter adapter = JobAdapter(ADAPTER_ADDR);
        HashMatchEvaluator hashEvaluator = HashMatchEvaluator(HASH_EVALUATOR_ADDR);

        uint128 jobAmount = 100 * 1e6; // 100 USDC
        bytes32 expectedDeliverable = keccak256("XRPL_SETTLEMENT_TX_PROOF_DATA_101");

        uint256 jobId = adapter.fundJob(
            childId,
            deployer,
            HASH_EVALUATOR_ADDR,
            jobAmount,
            uint64(block.timestamp + 3600),
            expectedDeliverable
        );
        console.log("[Step 5] Funded ERC-8183 Job Escrow ID:", jobId);

        MandateNode memory childNode = tree.getNode(childId);
        console.log("         Child Idle Balance: ", uint256(childNode.idle) / 1e6, "USDC");
        console.log("         Child Job Locked:   ", uint256(childNode.jobLocked) / 1e6, "USDC");
        require(childNode.idle + childNode.jobLocked == childNode.granted, "Child conservation broken");
        console.log("         [OK] L0 Conservation Holds: 400 Idle + 100 JobLocked = 500 Granted");

        // Submit & Settle
        adapter.submitJob(jobId, expectedDeliverable);
        console.log("[Step 6] Submitted Deliverable Hash for Job:", jobId);

        uint256 balanceBefore = usdc.balanceOf(deployer);
        bool passed = hashEvaluator.evaluate(jobId);
        uint256 balanceAfter = usdc.balanceOf(deployer);

        console.log("         Evaluator Result:   Passed =", passed);
        console.log("         Provider Received:  ", (balanceAfter - balanceBefore) / 1e6, "USDC");
        require(passed, "Evaluator failed deliverable");
    }

    function _step6_emergencyQuarantine(
        MandateTree tree,
        bytes32 rootId,
        bytes32 childId
    ) internal {
        console.log("[Step 7] Triggering 1-Tx Emergency Quarantine on Child Node...");
        tree.revokeSubtree(childId);

        MandateNode memory childNode = tree.getNode(childId);
        MandateNode memory rootNode = tree.getNode(rootId);

        console.log("         Child Node Status:  ", childNode.status == NodeStatus.REVOKED ? "REVOKED (FAIL-CLOSED)" : "ACTIVE");
        console.log("         Child Idle Balance: ", uint256(childNode.idle) / 1e6, "USDC (Swept to Root)");
        console.log("         Root Idle Balance:  ", uint256(rootNode.idle) / 1e6, "USDC");

        require(childNode.status == NodeStatus.REVOKED, "Child should be revoked");
        require(rootNode.idle == 1900 * 1e6, "Unspent idle not correctly swept to root");
        console.log("         [OK] Emergency Sweep Verified: 1900 Root Idle + 100 Settled = 2000 Initial Deposit");
    }
}
