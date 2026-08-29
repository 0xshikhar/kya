// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IEvaluator.sol";
import "../interfaces/IFdcVerification.sol";
import "../interfaces/IERC8183.sol";

contract FdcPaymentEvaluator is IEvaluator {
    address public immutable adapterContract;
    address public fdcVerification;
    address public owner;

    struct PaymentCondition {
        bytes32 destinationAddressHash;
        int256  minAmount;
        bytes32 paymentReference; // XRPL memo or payment reference
    }

    mapping(uint256 => PaymentCondition) public expectedConditions;

    event PaymentConditionSet(uint256 indexed jobId, bytes32 destinationAddressHash, int256 minAmount, bytes32 paymentReference);
    event JobFdcVerified(uint256 indexed jobId, bytes32 transactionId, int256 receivedAmount);

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
        bytes32 destinationAddressHash,
        int256 minAmount,
        bytes32 paymentReference
    ) external {
        expectedConditions[jobId] = PaymentCondition({
            destinationAddressHash: destinationAddressHash,
            minAmount: minAmount,
            paymentReference: paymentReference
        });
        emit PaymentConditionSet(jobId, destinationAddressHash, minAmount, paymentReference);
    }

    /// @notice Standard evaluate requires proof for FDC
    function evaluate(uint256) external pure override returns (bool) {
        revert("FDC evaluation requires proof data. Call evaluateWithProof.");
    }

    /// @notice Evaluates XRPL/BTC payment proof from Flare Data Connector (FDC)
    function evaluateWithProof(uint256 jobId, bytes calldata proofData) external override returns (bool) {
        require(fdcVerification != address(0), "FDC verification not configured");
        IFdcVerification.PaymentProof memory proof = abi.decode(proofData, (IFdcVerification.PaymentProof));

        // 1. Verify Merkle proof against Flare state
        bool proofValid = IFdcVerification(fdcVerification).verifyPayment(proof);
        require(proofValid, "FDC Merkle proof verification failed");

        // 2. Verify status is successful
        require(proof.data.responseBody.status, "Payment transaction failed on source chain");

        // 3. Verify conditions if registered
        PaymentCondition memory cond = expectedConditions[jobId];
        if (cond.destinationAddressHash != bytes32(0)) {
            require(proof.data.responseBody.receivingAddressHash == cond.destinationAddressHash, "Mismatched destination address");
        }
        if (cond.minAmount > 0) {
            require(proof.data.responseBody.receivedAmount >= cond.minAmount, "Insufficient payment amount");
        }
        if (cond.paymentReference != bytes32(0)) {
            require(proof.data.responseBody.standardPaymentReference == cond.paymentReference, "Mismatched payment memo reference");
        }

        emit JobFdcVerified(jobId, proof.data.requestBody.transactionId, proof.data.responseBody.receivedAmount);
        emit Evaluated(jobId, true, proof.data.requestBody.transactionId, cond.paymentReference);

        // 4. Trigger settlement in JobAdapter / Escrow
        IERC8183(adapterContract).complete(jobId);
        return true;
    }
}
