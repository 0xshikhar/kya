// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMandateHub {
    event RootCreated(bytes32 indexed rootId, address indexed owner, address indexed asset, uint128 budget);
    event Deposited(bytes32 indexed rootId, uint128 amount);
    event SettlementPaid(bytes32 indexed mandateId, uint256 indexed jobId, address indexed provider, uint128 amount);
    event ProtocolFeePaid(bytes32 indexed mandateId, uint256 indexed jobId, address indexed recipient, uint128 fee);

    function deposit(bytes32 rootId, uint128 amount) external;
    function paySettlement(bytes32 mandateId, uint256 jobId, address provider, uint128 amount) external;
    function owner() external view returns (address);
    function defaultAsset() external view returns (address);
    function treeContract() external view returns (address);
    function adapterContract() external view returns (address);
}
