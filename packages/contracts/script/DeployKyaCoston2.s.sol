// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/MandateHub.sol";
import "../src/MandateTree.sol";
import "../src/JobAdapter.sol";
import "../src/PolicyEngine.sol";
import "../src/evaluators/HashMatchEvaluator.sol";
import "../src/evaluators/FdcPaymentEvaluator.sol";
import "../src/evaluators/FdcEvmTxEvaluator.sol";
import "../src/registry/CredentialRegistry.sol";
import "../src/log/MandateLog.sol";
import "../src/interfaces/IFlareContractRegistry.sol";

/// @title DeployKyaCoston2
/// @notice Dedicated deployment script for KYA Network on Flare Coston2 Testnet (ChainID: 114)
contract DeployKyaCoston2 is Script {
    // Canonical Flare Coston2 Registry
    address public constant COSTON2_FLARE_REGISTRY = 0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019;
    address public constant FALLBACK_FDC_VERIFICATION = 0x906507E0B64bcD494Db73bd0459d1C667e14B933;

    function run() external {
        address flareRegistry = vm.envOr("FLARE_REGISTRY", COSTON2_FLARE_REGISTRY);

        // Dynamically resolve FdcVerification from Coston2 registry with fallback
        address fdcVerification = address(0);
        try IFlareContractRegistry(flareRegistry).getContractAddressByName("FdcVerification") returns (address addr) {
            fdcVerification = addr;
        } catch {
            fdcVerification = FALLBACK_FDC_VERIFICATION;
        }
        if (fdcVerification == address(0)) {
            fdcVerification = FALLBACK_FDC_VERIFICATION;
        }

        vm.startBroadcast();
        address deployer = msg.sender;

        console.log("=================================================================");
        console.log("   KYA NETWORK - FLARE COSTON2 TESTNET DEPLOYMENT (CHAIN 114)   ");
        console.log("=================================================================");
        console.log("Deployer Address:        ", deployer);
        console.log("Coston2 Flare Registry:  ", flareRegistry);
        console.log("Resolved FdcVerification:", fdcVerification);

        // 1. Settlement Asset (Deploy MockUSDC if not specified)
        address settlementAsset = vm.envOr("SETTLEMENT_ASSET", address(0));
        if (settlementAsset == address(0)) {
            MockUSDC usdc = new MockUSDC();
            usdc.mint(deployer, 1_000_000 * 1e6); // 1M Test USDC
            settlementAsset = address(usdc);
            console.log("Deployed Coston2 MockUSDC:", settlementAsset);
        } else {
            console.log("Using Existing Asset:    ", settlementAsset);
        }

        // 2. Layer 0 Core Contracts
        MandateHub hub = new MandateHub(settlementAsset);
        MandateTree tree = new MandateTree(address(hub));
        JobAdapter adapter = new JobAdapter(address(hub), address(tree));
        MandateLog mandateLog = new MandateLog(address(tree), address(adapter));

        // 3. Layer 1 PolicyEngine (Dynamic FTSOv2 price feeds)
        PolicyEngine policyEngine = new PolicyEngine(flareRegistry);

        // 4. Layer 3 Evaluators (FDC consensus verification)
        HashMatchEvaluator hashEvaluator = new HashMatchEvaluator(address(adapter));
        FdcPaymentEvaluator fdcPaymentEvaluator = new FdcPaymentEvaluator(address(adapter), fdcVerification);
        FdcEvmTxEvaluator fdcEvmTxEvaluator = new FdcEvmTxEvaluator(address(adapter), fdcVerification);

        // 5. Layer 4 CredentialRegistry (ERC-8004 + ERC-5192 Soulbound NFT)
        CredentialRegistry credentialRegistry = new CredentialRegistry(address(tree));

        // 6. Connect Wireframe & Permissions
        hub.setContracts(address(tree), address(adapter));
        tree.setAdapterAndLog(address(adapter), address(mandateLog));

        vm.stopBroadcast();

        console.log("-----------------------------------------------------------------");
        console.log("SUCCESSFULLY DEPLOYED TO FLARE COSTON2 TESTNET:");
        console.log("SettlementAsset:     ", settlementAsset);
        console.log("MandateHub:          ", address(hub));
        console.log("MandateTree:         ", address(tree));
        console.log("JobAdapter:          ", address(adapter));
        console.log("PolicyEngine:        ", address(policyEngine));
        console.log("HashMatchEvaluator:  ", address(hashEvaluator));
        console.log("FdcPaymentEvaluator: ", address(fdcPaymentEvaluator));
        console.log("FdcEvmTxEvaluator:   ", address(fdcEvmTxEvaluator));
        console.log("CredentialRegistry:  ", address(credentialRegistry));
        console.log("MandateLog:          ", address(mandateLog));
        console.log("-----------------------------------------------------------------");
        console.log("Update packages/sdk/src/config.ts with these Coston2 addresses.");
        console.log("=================================================================");
    }
}
