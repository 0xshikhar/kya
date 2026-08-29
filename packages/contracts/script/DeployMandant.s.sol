// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/MandateHub.sol";
import "../src/MandateTree.sol";
import "../src/JobAdapter.sol";
import "../src/evaluators/HashMatchEvaluator.sol";
import "../src/log/MandateLog.sol";

contract DeployMandant is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        MockUSDC usdc = new MockUSDC();
        MandateHub hub = new MandateHub(address(usdc));
        MandateTree tree = new MandateTree(address(hub));
        JobAdapter adapter = new JobAdapter(address(hub), address(tree));
        HashMatchEvaluator evaluator = new HashMatchEvaluator(address(adapter));
        MandateLog mandateLog = new MandateLog(address(tree), address(adapter));

        hub.setContracts(address(tree), address(adapter));
        tree.setAdapterAndLog(address(adapter), address(mandateLog));

        // Mint initial USDC for testing
        usdc.mint(deployer, 1_000_000 * 1e6);

        vm.stopBroadcast();

        console.log("=== Mandant Protocol Deployed ===");
        console.log("MockUSDC: ", address(usdc));
        console.log("MandateHub: ", address(hub));
        console.log("MandateTree: ", address(tree));
        console.log("JobAdapter: ", address(adapter));
        console.log("HashMatchEvaluator: ", address(evaluator));
        console.log("MandateLog: ", address(mandateLog));
    }
}
