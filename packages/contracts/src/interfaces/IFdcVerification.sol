// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IFdcVerification {
    struct PaymentProof {
        bytes32[] merkleProof;
        PaymentData data;
    }

    struct PaymentData {
        bytes32 attestationType;
        bytes32 sourceId;
        uint64 votingRound;
        uint64 lowestUsedTimestamp;
        PaymentRequestBody requestBody;
        PaymentResponseBody responseBody;
    }

    struct PaymentRequestBody {
        bytes32 transactionId;
        bool inUtxo;
        uint32 utxo;
    }

    struct PaymentResponseBody {
        int256 blockNumber;
        uint64 blockTimestamp;
        bytes32 sourceAddressHash;
        bytes32 receivingAddressHash;
        int256 intendedAmount;
        int256 receivedAmount;
        bytes32 standardPaymentReference;
        bool oneToOne;
        bool status;
    }

    struct EvmTxProof {
        bytes32[] merkleProof;
        EvmTxData data;
    }

    struct EvmTxData {
        bytes32 attestationType;
        bytes32 sourceId;
        uint64 votingRound;
        uint64 lowestUsedTimestamp;
        EvmTxRequestBody requestBody;
        EvmTxResponseBody responseBody;
    }

    struct EvmTxRequestBody {
        bytes32 transactionHash;
        uint256 requiredConfirmations;
        bool provideInput;
        bool listEvents;
        bytes4[] logEventSigs;
    }

    struct EvmTxResponseBody {
        int256 blockNumber;
        uint64 blockTimestamp;
        address sourceAddress;
        bool isContractCreation;
        address destinationAddress;
        uint256 value;
        uint256 maxFeePerGas;
        uint256 maxPriorityFeePerGas;
        uint256 gasPrice;
        uint256 gasUsed;
        uint256 status;
        bytes input;
    }

    function verifyPayment(PaymentProof calldata _proof) external view returns (bool);
    function verifyEvmTransaction(EvmTxProof calldata _proof) external view returns (bool);
}
