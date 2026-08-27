// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IFlareContractRegistry.sol";
import "./interfaces/IFtsoV2.sol";

contract PolicyEngine {
    // Canonical Flare Coston2 / Mainnet registry address
    address public constant FLARE_REGISTRY_DEFAULT = 0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019;

    bytes21 public constant FLR_USD_FEED = 0x01464c522f55534400000000000000000000000000;
    bytes21 public constant XRP_USD_FEED = 0x015852502f55534400000000000000000000000000;
    uint64 public constant MAX_STALENESS = 600; // 10 minutes

    address public owner;
    address public registryAddress;
    address public ftsoOverride; // for testing or direct override

    struct NodePolicy {
        uint128 maxSpendPerCallUSD; // 18 decimals USD
        uint128 maxSpendPerHourUSD;
        uint128 maxSpendPerDayUSD;
        uint32  cooldownSeconds;
        uint64  lastExecutionTimestamp;
        bool    isConfigured;
    }

    mapping(bytes32 => NodePolicy) public policies;
    mapping(bytes32 => mapping(address => bool)) public targetAllowlists;
    mapping(bytes32 => mapping(bytes4 => bool)) public selectorAllowlists;
    mapping(bytes32 => mapping(uint64 => uint128)) public hourlySpendUSD; // hourKey => spent
    mapping(bytes32 => mapping(uint64 => uint128)) public dailySpendUSD;  // dayKey => spent

    event PolicySet(
        bytes32 indexed nodeId,
        uint128 maxSpendPerCallUSD,
        uint128 maxSpendPerHourUSD,
        uint128 maxSpendPerDayUSD,
        uint32 cooldownSeconds
    );
    event SpendRecorded(bytes32 indexed nodeId, uint128 amountUSD, uint64 timestamp);

    error NodePolicyNotSet();
    error StalePriceFeed(uint64 feedTimestamp, uint256 currentTimestamp);
    error ExceedsPerCallUSDLimit(uint128 spendUSD, uint128 limitUSD);
    error ExceedsHourlyUSDLimit(uint128 totalHourSpendUSD, uint128 limitUSD);
    error ExceedsDailyUSDLimit(uint128 totalDaySpendUSD, uint128 limitUSD);
    error CooldownActive(uint64 nextAllowedTimestamp);
    error TargetNotAllowlisted(address target);
    error SelectorNotAllowlisted(bytes4 selector);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _registry) {
        owner = msg.sender;
        registryAddress = _registry != address(0) ? _registry : FLARE_REGISTRY_DEFAULT;
    }

    function setRegistry(address _registry) external onlyOwner {
        registryAddress = _registry;
    }

    function setFtsoOverride(address _ftso) external onlyOwner {
        ftsoOverride = _ftso;
    }

    function getFtsoV2() public view returns (IFtsoV2) {
        if (ftsoOverride != address(0)) {
            return IFtsoV2(ftsoOverride);
        }
        if (registryAddress.code.length > 0) {
            address ftsoAddr = IFlareContractRegistry(registryAddress).getContractAddressByName("FtsoV2");
            if (ftsoAddr != address(0)) {
                return IFtsoV2(ftsoAddr);
            }
        }
        revert("FtsoV2 not resolved");
    }

    function setPolicy(
        bytes32 nodeId,
        uint128 maxSpendPerCallUSD,
        uint128 maxSpendPerHourUSD,
        uint128 maxSpendPerDayUSD,
        uint32 cooldownSeconds,
        address[] calldata allowedTargets,
        bytes4[] calldata allowedSelectors
    ) external {
        policies[nodeId] = NodePolicy({
            maxSpendPerCallUSD: maxSpendPerCallUSD,
            maxSpendPerHourUSD: maxSpendPerHourUSD,
            maxSpendPerDayUSD: maxSpendPerDayUSD,
            cooldownSeconds: cooldownSeconds,
            lastExecutionTimestamp: 0,
            isConfigured: true
        });

        for (uint256 i = 0; i < allowedTargets.length; i++) {
            targetAllowlists[nodeId][allowedTargets[i]] = true;
        }
        for (uint256 j = 0; j < allowedSelectors.length; j++) {
            selectorAllowlists[nodeId][allowedSelectors[j]] = true;
        }

        emit PolicySet(nodeId, maxSpendPerCallUSD, maxSpendPerHourUSD, maxSpendPerDayUSD, cooldownSeconds);
    }

    /// @notice Get USD valuation for an asset amount
    /// @param asset Asset address (address(0) for native FLR, or token address)
    /// @param amount Amount in asset's native decimals
    /// @param assetDecimals Decimals of asset (18 for FLR, 6 for USDC, 18 or 6 for FXRP)
    function getAssetValueUSD(
        address asset,
        uint256 amount,
        uint8 assetDecimals
    ) public view returns (uint128 valueUSD) {
        if (amount == 0) return 0;

        // USDC is pegged to $1
        // We assume 6 decimals for standard USDC
        if (assetDecimals == 6) {
            return uint128(amount * 1e12); // convert 6 decimals to 18 decimals USD
        }

        bytes21 feedId = FLR_USD_FEED;
        // In full deployment, token address maps to feed ID. Default to FLR feed.
        IFtsoV2 ftso = getFtsoV2();
        (uint256 price, int8 decimals, uint64 feedTimestamp) = ftso.getFeedById(feedId);

        if (block.timestamp > feedTimestamp && block.timestamp - feedTimestamp > MAX_STALENESS) {
            revert StalePriceFeed(feedTimestamp, block.timestamp);
        }

        // Standardize price into 18 decimals
        uint256 priceScaled;
        if (decimals >= 0) {
            priceScaled = price * (10 ** (18 - uint8(int8(decimals))));
        } else {
            priceScaled = price * (10 ** (18 + uint8(int8(-decimals))));
        }

        // valueUSD = (amount * priceScaled) / 10^assetDecimals
        uint256 usdValue = (amount * priceScaled) / (10 ** assetDecimals);
        return uint128(usdValue);
    }

    /// @notice Validate execution against policy caps and record spend
    function validateAndRecordSpend(
        bytes32 nodeId,
        address target,
        bytes4 selector,
        uint128 spendUSD
    ) external {
        NodePolicy storage policy = policies[nodeId];
        if (!policy.isConfigured) {
            // Unrestricted or default fallback if policy not explicitly set
            return;
        }

        // Check target allowlist if configured
        if (target != address(0) && !targetAllowlists[nodeId][target]) {
            revert TargetNotAllowlisted(target);
        }

        // Check selector allowlist if configured
        if (selector != bytes4(0) && !selectorAllowlists[nodeId][selector]) {
            revert SelectorNotAllowlisted(selector);
        }

        // Check cooldown
        if (policy.cooldownSeconds > 0 && policy.lastExecutionTimestamp > 0) {
            uint64 nextAllowed = policy.lastExecutionTimestamp + policy.cooldownSeconds;
            if (block.timestamp < nextAllowed) {
                revert CooldownActive(nextAllowed);
            }
        }

        // Check per-call limit
        if (policy.maxSpendPerCallUSD > 0 && spendUSD > policy.maxSpendPerCallUSD) {
            revert ExceedsPerCallUSDLimit(spendUSD, policy.maxSpendPerCallUSD);
        }

        uint64 hourKey = uint64(block.timestamp / 3600);
        uint64 dayKey = uint64(block.timestamp / 86400);

        // Check hourly limit
        if (policy.maxSpendPerHourUSD > 0) {
            uint128 hourTotal = hourlySpendUSD[nodeId][hourKey] + spendUSD;
            if (hourTotal > policy.maxSpendPerHourUSD) {
                revert ExceedsHourlyUSDLimit(hourTotal, policy.maxSpendPerHourUSD);
            }
            hourlySpendUSD[nodeId][hourKey] = hourTotal;
        }

        // Check daily limit
        if (policy.maxSpendPerDayUSD > 0) {
            uint128 dayTotal = dailySpendUSD[nodeId][dayKey] + spendUSD;
            if (dayTotal > policy.maxSpendPerDayUSD) {
                revert ExceedsDailyUSDLimit(dayTotal, policy.maxSpendPerDayUSD);
            }
            dailySpendUSD[nodeId][dayKey] = dayTotal;
        }

        policy.lastExecutionTimestamp = uint64(block.timestamp);
        emit SpendRecorded(nodeId, spendUSD, uint64(block.timestamp));
    }
}
