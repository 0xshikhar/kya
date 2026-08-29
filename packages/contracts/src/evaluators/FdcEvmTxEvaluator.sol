// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IEvaluator.sol";
import "../interfaces/IFdcVerification.sol";
import "../interfaces/IERC8183.sol";

contract FdcEvmTxEvaluator is IEvaluator {
    address public immutable adapterContract;
    address public fdcVerification;
    address public owner;

    struct EvmCondition {
        address destinationAddress;
        uint256 minValue;
        bytes4  expectedSelector;
    }

    mapping(uint256 => EvmCondition) public expectedConditions;

    event EvmConditionSet(uint256 indexed jobId, address destinationAddress, uint256 minValue, bytes4 expectedSelector);
    event JobEvmVerified(uint256 indexed jobId, bytes32 transactionHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _adapterContract, address _fdcVerification) {
        require(_adapterContract != address(0), "Invalid adapter");
        adapterContract = _adapterContract;
        fdcVerification = _fdcVerification;
        owner = msg.sender;
    }

    function setFdcVerification(address _fdcVerification) external onlyOwner {
        fdcVerification = _fdcVerification;
    }

    function setCondition(
        uint256 jobId,
        address destinationAddress,
        uint256 minValue,
        bytes4 expectedSelector
    ) external {
        expectedConditions[jobId] = EvmCondition({
            destinationAddress: destinationAddress,
            minValue: minValue,
            expectedSelector: expectedSelector
        });
        emit EvmConditionSet(jobId, destinationAddress, minValue, expectedSelector);
    }

    /// @notice Standard evaluate requires proof for FDC
    function evaluate(uint256) external pure override returns (bool) {
        revert("FDC evaluation requires proof data. Call evaluateWithProof.");
    }

    /// @notice Evaluates EVM transaction proof from Flare Data Connector (FDC)
    function evaluateWithProof(uint256 jobId, bytes calldata proofData) external override returns (bool) {
        require(fdcVerification != address(0), "FDC verification not configured");
        IFdcVerification.EvmTxProof memory proof = abi.decode(proofData, (IFdcVerification.EvmTxProof));

        // 1. Verify Merkle proof against Flare state
        bool proofValid = IFdcVerification(fdcVerification).verifyEvmTransaction(proof);
        require(proofValid, "FDC Merkle proof verification failed");

        // 2. Verify tx status was success (status == 1)
        require(proof.data.responseBody.status == 1, "EVM transaction failed on source chain");

        // 3. Verify conditions
        EvmCondition memory cond = expectedConditions[jobId];
        if (cond.destinationAddress != address(0)) {
            require(proof.data.responseBody.destinationAddress == cond.destinationAddress, "Mismatched destination address");
        }
        if (cond.minValue > 0) {
            require(proof.data.responseBody.value >= cond.minValue, "Insufficient transfer value");
        }
        bytes memory input = proof.data.responseBody.input;
        if (cond.expectedSelector != bytes4(0) && input.length >= 4) {
            bytes4 actualSelector;
            assembly {
                actualSelector := mload(add(input, 32))
            }
            require(actualSelector == cond.expectedSelector, "Mismatched function selector");
        }

        emit JobEvmVerified(jobId, proof.data.requestBody.transactionHash);
        emit Evaluated(jobId, true, proof.data.requestBody.transactionHash, bytes32(cond.expectedSelector));

        // 4. Settle escrow
        IERC8183(adapterContract).complete(jobId);
        return true;
    }
}
