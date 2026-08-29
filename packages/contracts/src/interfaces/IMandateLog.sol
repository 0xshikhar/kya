// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMandateLog {
    event LogLeafAppended(uint256 indexed index, bytes32 indexed leafHash, bytes32 indexed mandateId);
    event EpochRootCommitted(uint32 indexed epoch, bytes32 root, uint256 leafCount);

    function appendLeaf(bytes32 mandateId, bytes32 actionHash) external returns (uint256 index);
    function commitEpoch() external returns (uint32 epoch, bytes32 root);
    function getEpochRoot(uint32 epoch) external view returns (bytes32);
}
