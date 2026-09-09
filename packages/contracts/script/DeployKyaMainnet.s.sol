// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MandateHub.sol";
import "../src/MandateTree.sol";
import "../src/JobAdapter.sol";
import "../src/PolicyEngine.sol";
import "../src/evaluators/HashMatchEvaluator.sol";
import "../src/evaluators/FdcPaymentEvaluator.sol";
import "../src/evaluators/FdcEvmTxEvaluator.sol";
import "../src/registry/CredentialRegistry.sol";
import "../src/log/MandateLog.sol";

/// @title DeployKyaMainnet
/// @notice Production deployment script for KYA Network on Flare Mainnet (chainId: 14) and Coston2 (chainId: 114)
contract DeployKyaMainnet is Script {
    // Flare Contract Registry is canonical across Flare networks
    address public constant CANONICAL_FLARE_REGISTRY = 0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019;

    function run() external {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        address deployer = vm.addr(deployerPrivateKey);

        address flareRegistry = vm.envOr("FLARE_REGISTRY", CANONICAL_FLARE_REGISTRY);
        address settlementAsset = vm.envOr("SETTLEMENT_ASSET", address(0)); // 0 = native / configured ERC20

        console.log("=== Deploying KYA Network to Flare Mainnet / Coston2 ===");
        console.log("Deployer:        ", deployer);
        console.log("Flare Registry:  ", flareRegistry);
        console.log("Settlement Asset:", settlementAsset);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Core Layer 0 Contracts
        MandateHub hub = new MandateHub(settlementAsset);
        MandateTree tree = new MandateTree(address(hub));
        JobAdapter adapter = new JobAdapter(address(hub), address(tree));
        MandateLog mandateLog = new MandateLog(address(tree), address(adapter));

        // 2. Layer 1: PolicyEngine with dynamic FTSOv2 integration
        PolicyEngine policyEngine = new PolicyEngine(flareRegistry);

        // 3. Layer 3: Evaluators
        HashMatchEvaluator hashEvaluator = new HashMatchEvaluator(address(adapter));
        FdcPaymentEvaluator fdcPaymentEvaluator = new FdcPaymentEvaluator(address(adapter), address(0));
        FdcEvmTxEvaluator fdcEvmTxEvaluator = new FdcEvmTxEvaluator(address(adapter), address(0));

        // 4. Layer 4: CredentialRegistry (ERC-8004 + ERC-5192 Soulbound NFT)
        CredentialRegistry credentialRegistry = new CredentialRegistry(address(tree));

        // 5. Connect Wireframe & Permissions
        hub.setContracts(address(tree), address(adapter));
        tree.setAdapterAndLog(address(adapter), address(mandateLog));

        vm.stopBroadcast();

        console.log("--------------------------------------------------");
        console.log("KYA Network Contracts Deployed Successfully:");
        console.log("MandateHub:          ", address(hub));
        console.log("MandateTree:         ", address(tree));
        console.log("JobAdapter:          ", address(adapter));
        console.log("PolicyEngine:        ", address(policyEngine));
        console.log("HashMatchEvaluator:  ", address(hashEvaluator));
        console.log("FdcPaymentEvaluator: ", address(fdcPaymentEvaluator));
        console.log("FdcEvmTxEvaluator:   ", address(fdcEvmTxEvaluator));
        console.log("CredentialRegistry:  ", address(credentialRegistry));
        console.log("MandateLog:          ", address(mandateLog));
        console.log("--------------------------------------------------");
    }
}
