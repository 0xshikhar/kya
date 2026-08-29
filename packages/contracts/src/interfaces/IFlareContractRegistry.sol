// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IFlareContractRegistry {
    function getContractAddressByName(string calldata _name) external view returns (address);
    function getContractAddressesByName(string[] calldata _names) external view returns (address[] memory);
}
