// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DataTypes.sol";
import "./interfaces/IMandateHub.sol";
import "./interfaces/IMandateTree.sol";

interface IERC20Minimal {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MandateHub is IMandateHub {
    address public immutable owner;
    address public immutable defaultAsset;

    address public treeContract;
    address public adapterContract;
    address public feeRecipient;
    uint16 public feeBps; // 0 in MVP

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAdapter() {
        require(msg.sender == adapterContract, "Only adapter");
        _;
    }

    constructor(address _defaultAsset) {
        require(_defaultAsset != address(0), "Invalid asset");
        owner = msg.sender;
        defaultAsset = _defaultAsset;
        feeRecipient = msg.sender;
        feeBps = 0;
    }

    function setContracts(address _treeContract, address _adapterContract) external onlyOwner {
        require(treeContract == address(0) && adapterContract == address(0), "Already configured");
        require(_treeContract != address(0) && _adapterContract != address(0), "Invalid addresses");
        treeContract = _treeContract;
        adapterContract = _adapterContract;
    }

    function setFeeConfig(address _feeRecipient, uint16 _feeBps) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid recipient");
        require(_feeBps <= 500, "Fee exceeds 5%");
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;
    }

    /// @notice Top up an existing root mandate with additional USDC
    function deposit(bytes32 rootId, uint128 amount) external override {
        require(amount > 0, "Zero deposit");
        require(treeContract != address(0), "Tree not set");

        MandateNode memory root = IMandateTree(treeContract).getNode(rootId);
        require(root.parentId == bytes32(0), "Can only deposit to root");
        require(root.status == NodeStatus.ACTIVE, "Root not active");

        bool success = IERC20Minimal(root.asset).transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");

        IMandateTree(treeContract).creditRoot(rootId, amount);

        emit Deposited(rootId, amount);
    }

    /// @notice Releases escrowed settlement to the service provider. Called strictly by JobAdapter.
    function paySettlement(
        bytes32 mandateId,
        uint256 jobId,
        address provider,
        uint128 amount
    ) external override onlyAdapter {
        require(amount > 0, "Zero payout");
        require(provider != address(0), "Invalid provider");

        MandateNode memory node = IMandateTree(treeContract).getNode(mandateId);
        address asset = node.asset != address(0) ? node.asset : defaultAsset;

        uint128 fee = (amount * uint128(feeBps)) / 10_000;
        uint128 netPayout = amount - fee;

        if (fee > 0 && feeRecipient != address(0)) {
            bool feeSuccess = IERC20Minimal(asset).transfer(feeRecipient, fee);
            require(feeSuccess, "Fee transfer failed");
            emit ProtocolFeePaid(mandateId, jobId, feeRecipient, fee);
        }

        bool success = IERC20Minimal(asset).transfer(provider, netPayout);
        require(success, "Settlement transfer failed");

        emit SettlementPaid(mandateId, jobId, provider, netPayout);
    }
}
