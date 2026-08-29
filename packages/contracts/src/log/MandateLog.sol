// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IMandateLog.sol";

contract MandateLog is IMandateLog {
    address public immutable treeContract;
    address public immutable adapterContract;

    uint32 public currentEpoch = 1;
    uint256 public leafCount = 0;

    mapping(uint256 => bytes32) public leaves;
    mapping(uint32 => bytes32) public epochRoots;
    mapping(uint32 => uint256) public epochLeafCounts;

    modifier onlyAuthorized() {
        require(msg.sender == treeContract || msg.sender == adapterContract, "Unauthorized logger");
        _;
    }

    constructor(address _treeContract, address _adapterContract) {
        treeContract = _treeContract;
        adapterContract = _adapterContract;
    }

    function appendLeaf(bytes32 mandateId, bytes32 actionHash) external override onlyAuthorized returns (uint256 index) {
        index = leafCount++;
        bytes32 leaf = keccak256(abi.encodePacked(index, mandateId, actionHash, block.timestamp));
        leaves[index] = leaf;

        emit LogLeafAppended(index, leaf, mandateId);
    }

    function commitEpoch() external override returns (uint32 epoch, bytes32 root) {
        require(leafCount > 0, "No leaves to commit");
        epoch = currentEpoch++;
        
        // Simple incremental rolling hash root for MVP
        root = keccak256(abi.encodePacked(epochRoots[epoch - 1], leaves[leafCount - 1], leafCount));
        epochRoots[epoch] = root;
        epochLeafCounts[epoch] = leafCount;

        emit EpochRootCommitted(epoch, root, leafCount);
    }

    function getEpochRoot(uint32 epoch) external view override returns (bytes32) {
        return epochRoots[epoch];
    }
}
