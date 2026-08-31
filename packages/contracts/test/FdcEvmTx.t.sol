// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/DataTypes.sol";
import "../src/MockUSDC.sol";
import "../src/MandateHub.sol";
import "../src/MandateTree.sol";
import "../src/JobAdapter.sol";
import "../src/evaluators/FdcEvmTxEvaluator.sol";
import "../src/mocks/MockFdcVerification.sol";

contract FdcEvmTxTest is Test {
    MockUSDC public usdc;
    MandateHub public hub;
    MandateTree public tree;
    JobAdapter public adapter;
    FdcEvmTxEvaluator public evaluator;
    MockFdcVerification public mockFdc;

    address public treasury = address(0x1111);
    address public agentAlpha = address(0x2222);
    address public provider = address(0x3333);
    address public targetContract = address(0x8888);
    bytes4 public expectedSelector = bytes4(keccak256("executeTask(bytes)"));

    bytes32 public rootId;
    bytes32 public alphaId;

    function setUp() public {
        vm.warp(10_000);
        usdc = new MockUSDC();
        hub = new MandateHub(address(usdc));
        tree = new MandateTree(address(hub));
        adapter = new JobAdapter(address(hub), address(tree));
        mockFdc = new MockFdcVerification();
        evaluator = new FdcEvmTxEvaluator(address(adapter), address(mockFdc));

        hub.setContracts(address(tree), address(adapter));
        tree.setAdapterAndLog(address(adapter), address(0));

        usdc.mint(treasury, 50_000 * 1e6);
        vm.prank(treasury);
        usdc.approve(address(tree), type(uint256).max);

        address[] memory allowlist = new address[](2);
        allowlist[0] = address(evaluator);
        allowlist[1] = provider;

        vm.prank(treasury);
        rootId = tree.createRoot(
            treasury,
            treasury,
            address(0),
            address(usdc),
            20_000 * 1e6,
            uint64(block.timestamp + 86400),
            allowlist,
            bytes32(0)
        );

        vm.prank(treasury);
        alphaId = tree.spawn(
            rootId,
            agentAlpha,
            address(0),
            2_000 * 1e6,
            uint64(block.timestamp + 43200),
            allowlist,
            bytes32(0)
        );
    }

    function _buildValidEvmProof(
        address destination,
        uint256 value,
        bytes4 selector
    ) internal view returns (IFdcVerification.EvmTxProof memory) {
        bytes32[] memory merkleProof = new bytes32[](1);
        merkleProof[0] = keccak256("EVM_LEAF_1");

        bytes memory inputData = abi.encodeWithSelector(selector, "taskPayload");

        return IFdcVerification.EvmTxProof({
            merkleProof: merkleProof,
            data: IFdcVerification.EvmTxData({
                attestationType: bytes32("EVMTransaction"),
                sourceId: bytes32("ETH"),
                votingRound: 20450,
                lowestUsedTimestamp: uint64(block.timestamp - 120),
                requestBody: IFdcVerification.EvmTxRequestBody({
                    transactionHash: keccak256("EVM_TX_HASH_88172"),
                    requiredConfirmations: 12,
                    provideInput: true,
                    listEvents: false,
                    logEventSigs: new bytes4[](0)
                }),
                responseBody: IFdcVerification.EvmTxResponseBody({
                    blockNumber: 19820120,
                    blockTimestamp: uint64(block.timestamp - 60),
                    sourceAddress: address(0x9999),
                    isContractCreation: false,
                    destinationAddress: destination,
                    value: value,
                    maxFeePerGas: 30 gwei,
                    maxPriorityFeePerGas: 2 gwei,
                    gasPrice: 25 gwei,
                    gasUsed: 120000,
                    status: 1, // Success
                    input: inputData
                })
            })
        });
    }

    function test_HappyPath_FdcEvmTxSettlesJob() public {
        uint128 jobAmount = 150 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        // Provider submits deliverable
        vm.prank(provider);
        adapter.submitJob(jobId, keccak256("EVM_PROOF_DELIVERABLE"));

        IFdcVerification.EvmTxProof memory proof = _buildValidEvmProof(targetContract, 1.5 ether, expectedSelector);

        vm.prank(provider);
        bool evaluated = evaluator.evaluateWithProof(jobId, abi.encode(proof));
        assertTrue(evaluated);

        assertEq(usdc.balanceOf(provider), jobAmount);
        OpenJob memory job = adapter.getJob(jobId);
        assertEq(uint8(job.phase), uint8(JobPhase.COMPLETED));
    }

    function test_RevertIf_MismatchedDestination() public {
        uint128 jobAmount = 150 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        evaluator.setCondition(jobId, targetContract, 1 ether, expectedSelector);

        IFdcVerification.EvmTxProof memory proof = _buildValidEvmProof(address(0xDEAD), 1.5 ether, expectedSelector);

        vm.expectRevert("Mismatched destination address");
        evaluator.evaluateWithProof(jobId, abi.encode(proof));
    }

    function test_RevertIf_InsufficientValue() public {
        uint128 jobAmount = 150 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        evaluator.setCondition(jobId, targetContract, 1 ether, expectedSelector);

        // Only sent 0.5 ether (< 1 ether)
        IFdcVerification.EvmTxProof memory proof = _buildValidEvmProof(targetContract, 0.5 ether, expectedSelector);

        vm.expectRevert("Insufficient transfer value");
        evaluator.evaluateWithProof(jobId, abi.encode(proof));
    }

    function test_RevertIf_MismatchedSelector() public {
        uint128 jobAmount = 150 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        evaluator.setCondition(jobId, targetContract, 1 ether, expectedSelector);

        bytes4 wrongSelector = bytes4(keccak256("differentFunction(uint256)"));
        IFdcVerification.EvmTxProof memory proof = _buildValidEvmProof(targetContract, 1 ether, wrongSelector);

        vm.expectRevert("Mismatched function selector");
        evaluator.evaluateWithProof(jobId, abi.encode(proof));
    }

    function test_RevertIf_EvmTxFailedOnSource() public {
        uint128 jobAmount = 150 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        evaluator.setCondition(jobId, targetContract, 1 ether, expectedSelector);

        IFdcVerification.EvmTxProof memory proof = _buildValidEvmProof(targetContract, 1 ether, expectedSelector);
        proof.data.responseBody.status = 0; // Failed on source chain

        vm.expectRevert("EVM transaction failed on source chain");
        evaluator.evaluateWithProof(jobId, abi.encode(proof));
    }

    function test_RevertIf_InvalidMerkleProof() public {
        uint128 jobAmount = 150 * 1e6;
        vm.prank(agentAlpha);
        uint256 jobId = adapter.fundJob(
            alphaId,
            provider,
            address(evaluator),
            jobAmount,
            uint64(block.timestamp + 1800),
            bytes32(0)
        );

        evaluator.setCondition(jobId, targetContract, 1 ether, expectedSelector);

        mockFdc.setVerifyEvmPass(false);
        IFdcVerification.EvmTxProof memory proof = _buildValidEvmProof(targetContract, 1 ether, expectedSelector);

        vm.expectRevert("FDC Merkle proof verification failed");
        evaluator.evaluateWithProof(jobId, abi.encode(proof));
    }
}
