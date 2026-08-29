// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IFtsoV2.sol";

contract MockFtsoV2 is IFtsoV2 {
    mapping(bytes21 => uint256) public prices;
    mapping(bytes21 => int8) public decimals;
    mapping(bytes21 => uint64) public timestamps;

    function setFeed(bytes21 feedId, uint256 price, int8 _decimals, uint64 timestamp) external {
        prices[feedId] = price;
        decimals[feedId] = _decimals;
        timestamps[feedId] = timestamp;
    }

    function getFeedById(bytes21 feedId) external view override returns (uint256, int8, uint64) {
        require(prices[feedId] > 0, "Feed not found");
        return (prices[feedId], decimals[feedId], timestamps[feedId]);
    }

    function getFeedsById(bytes21[] calldata feedIds) external view override returns (uint256[] memory, int8[] memory, uint64) {
        uint256[] memory values = new uint256[](feedIds.length);
        int8[] memory decs = new int8[](feedIds.length);
        for (uint256 i = 0; i < feedIds.length; i++) {
            values[i] = prices[feedIds[i]];
            decs[i] = decimals[feedIds[i]];
        }
        return (values, decs, uint64(block.timestamp));
    }
}
