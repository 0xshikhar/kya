// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IFtsoV2 {
    function getFeedById(bytes21 _feedId) external view returns (uint256 _value, int8 _decimals, uint64 _timestamp);
    function getFeedsById(bytes21[] calldata _feedIds) external view returns (uint256[] memory _values, int8[] memory _decimals, uint64 _timestamp);
}
