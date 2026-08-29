// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PolicyEngine.sol";
import "../src/registry/CredentialRegistry.sol";
import "../src/mocks/MockFtsoV2.sol";
import "../src/mocks/MockFlareContractRegistry.sol";

contract FlarePolicyTest is Test {
    PolicyEngine public policyEngine;
    CredentialRegistry public credentialRegistry;
    MockFtsoV2 public mockFtso;
    MockFlareContractRegistry public mockRegistry;

    bytes32 public agentNodeId = keccak256("AGENT_ALPHA");
    address public agentAddress = address(0x2222);
    address public operator = address(0x1111);
    address public allowedTarget = address(0x8888);
    address public disallowedTarget = address(0x9999);
    bytes4 public allowedSelector = bytes4(keccak256("executeTask(bytes)"));
    bytes4 public disallowedSelector = bytes4(keccak256("drainVault()"));

    function setUp() public {
        mockRegistry = new MockFlareContractRegistry();
        mockFtso = new MockFtsoV2();

        mockRegistry.setContract("FtsoV2", address(mockFtso));

        policyEngine = new PolicyEngine(address(mockRegistry));
        credentialRegistry = new CredentialRegistry(address(0)); // test mode

        // Setup FTSO Feeds
        // FLR/USD = $0.025 (25000 with 6 decimals)
        mockFtso.setFeed(
            policyEngine.FLR_USD_FEED(),
            25000,
            6,
            uint64(block.timestamp)
        );

        // Configure policy for agentNodeId
        // Max $50/call, $200/hour, $500/day, 10s cooldown
        address[] memory targets = new address[](1);
        targets[0] = allowedTarget;

        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = allowedSelector;

        policyEngine.setPolicy(
            agentNodeId,
            50 * 1e18,  // $50 max per call (18 decimals)
            200 * 1e18, // $200 max per hour
            500 * 1e18, // $500 max per day
            10,         // 10 second cooldown
            targets,
            selectors
        );
    }

    function test_FtsoV2DynamicResolution() public view {
        IFtsoV2 ftso = policyEngine.getFtsoV2();
        assertEq(address(ftso), address(mockFtso));
    }

    function test_PolicyAllowsCompliantSpend() public {
        // Spend $30 USD (within $50 limit)
        uint128 spendUSD = 30 * 1e18;
        policyEngine.validateAndRecordSpend(agentNodeId, allowedTarget, allowedSelector, spendUSD);

        uint64 hourKey = uint64(block.timestamp / 3600);
        uint64 dayKey = uint64(block.timestamp / 86400);

        assertEq(policyEngine.hourlySpendUSD(agentNodeId, hourKey), spendUSD);
        assertEq(policyEngine.dailySpendUSD(agentNodeId, dayKey), spendUSD);
    }

    function test_PolicyRevertsOnPerCallCapBreach() public {
        // Spend $60 USD (exceeds $50 limit)
        uint128 spendUSD = 60 * 1e18;
        vm.expectRevert(abi.encodeWithSelector(PolicyEngine.ExceedsPerCallUSDLimit.selector, spendUSD, 50 * 1e18));
        policyEngine.validateAndRecordSpend(agentNodeId, allowedTarget, allowedSelector, spendUSD);
    }

    function test_PolicyRevertsOnTargetNotAllowlisted() public {
        uint128 spendUSD = 20 * 1e18;
        vm.expectRevert(abi.encodeWithSelector(PolicyEngine.TargetNotAllowlisted.selector, disallowedTarget));
        policyEngine.validateAndRecordSpend(agentNodeId, disallowedTarget, allowedSelector, spendUSD);
    }

    function test_PolicyRevertsOnSelectorNotAllowlisted() public {
        uint128 spendUSD = 20 * 1e18;
        vm.expectRevert(abi.encodeWithSelector(PolicyEngine.SelectorNotAllowlisted.selector, disallowedSelector));
        policyEngine.validateAndRecordSpend(agentNodeId, allowedTarget, disallowedSelector, spendUSD);
    }

    function test_PolicyEnforcesCooldown() public {
        uint128 spendUSD = 10 * 1e18;
        policyEngine.validateAndRecordSpend(agentNodeId, allowedTarget, allowedSelector, spendUSD);

        // Immediate next call should revert due to 10s cooldown
        vm.expectRevert();
        policyEngine.validateAndRecordSpend(agentNodeId, allowedTarget, allowedSelector, spendUSD);

        // After 11s, it should succeed
        vm.warp(block.timestamp + 11);
        policyEngine.validateAndRecordSpend(agentNodeId, allowedTarget, allowedSelector, spendUSD);
    }

    function test_PolicyRevertsOnStaleFtsoFeed() public {
        vm.warp(2000);
        // Set feed timestamp to 15 minutes ago (> 10 min max staleness)
        mockFtso.setFeed(
            policyEngine.FLR_USD_FEED(),
            25000,
            6,
            uint64(block.timestamp - 900)
        );

        vm.expectRevert();
        policyEngine.getAssetValueUSD(address(0), 1000 * 1e18, 18);
    }

    function test_CredentialRegistryLifecycle() public {
        vm.prank(operator);
        uint256 tokenId = credentialRegistry.registerAgent(agentNodeId, agentAddress, "ipfs://QmAgentAlphaMetadata");

        assertEq(tokenId, 1);
        assertTrue(credentialRegistry.locked(tokenId));

        // Transfer must revert (Soulbound)
        vm.expectRevert("Soulbound: Token cannot be transferred");
        credentialRegistry.transferFrom(operator, address(0x9999), tokenId);

        // Verify active status
        (NodeStatus status, address returnedAgent, address returnedOp, string memory meta) = credentialRegistry.verifyAgent(agentNodeId);
        assertEq(uint8(status), uint8(NodeStatus.ACTIVE));
        assertEq(returnedAgent, agentAddress);
        assertEq(returnedOp, operator);
        assertEq(meta, "ipfs://QmAgentAlphaMetadata");

        // Revoke
        vm.prank(operator);
        credentialRegistry.revokeAgent(agentNodeId);

        (NodeStatus revokedStatus, , , ) = credentialRegistry.verifyAgent(agentNodeId);
        assertEq(uint8(revokedStatus), uint8(NodeStatus.REVOKED));
    }
}
