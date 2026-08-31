// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IFdcVerification.sol";

contract MockFdcVerification is IFdcVerification {
    bool public shouldVerifyPaymentPass = true;
    bool public shouldVerifyEvmPass = true;

    function setVerifyPaymentPass(bool _pass) external {
        shouldVerifyPaymentPass = _pass;
    }

    function setVerifyEvmPass(bool _pass) external {
        shouldVerifyEvmPass = _pass;
    }

    function verifyPayment(PaymentProof calldata _proof) external view override returns (bool) {
        // If merkleProof is empty and we want to simulate invalid proof, allow test to flag it
        if (_proof.merkleProof.length > 0 && _proof.merkleProof[0] == bytes32(uint256(999999))) {
            return false;
        }
        return shouldVerifyPaymentPass;
    }

    function verifyEvmTransaction(EvmTxProof calldata _proof) external view override returns (bool) {
        if (_proof.merkleProof.length > 0 && _proof.merkleProof[0] == bytes32(uint256(999999))) {
            return false;
        }
        return shouldVerifyEvmPass;
    }
}
