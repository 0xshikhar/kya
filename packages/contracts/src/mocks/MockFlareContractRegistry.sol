// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IFlareContractRegistry.sol";

contract MockFlareContractRegistry is IFlareContractRegistry {
    mapping(string => address) public contracts;

    function setContract(string calldata name, address addr) external {
        contracts[name] = addr;
    }

    function getContractAddressByName(string calldata _name) external view override returns (address) {
        return contracts[_name];
    }

    function getContractAddressesByName(string[] calldata _names) external view override returns (address[] memory) {
        address[] memory addrs = new address[](_names.length);
        for (uint256 i = 0; i < _names.length; i++) {
            addrs[i] = contracts[_names[i]];
        }
        return addrs;
    }
}
