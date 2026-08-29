// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../DataTypes.sol";
import "../interfaces/IMandateTree.sol";

interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

contract CredentialRegistry is IERC5192 {
    string public name = "KYA Agent Identity";
    string public symbol = "KYA-ID";

    address public owner;
    address public mandateTreeContract;

    struct AgentRecord {
        bytes32 agentId;
        address agentAddress;
        address operatorAddress;
        string  metadataURI;
        uint64  registeredAt;
        bool    isRevoked;
    }

    uint256 private nextTokenId = 1;
    mapping(uint256 => AgentRecord) public records;
    mapping(bytes32 => uint256) public agentIdToTokenId;
    mapping(uint256 => address) public tokenOwner;

    event AgentRegistered(uint256 indexed tokenId, bytes32 indexed agentId, address indexed agentAddress, string metadataURI);
    event AgentRevoked(uint256 indexed tokenId, bytes32 indexed agentId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _mandateTree) {
        owner = msg.sender;
        mandateTreeContract = _mandateTree;
    }

    function setMandateTree(address _mandateTree) external onlyOwner {
        mandateTreeContract = _mandateTree;
    }

    /// @notice Register an agent with ERC-8004 metadata and mint soulbound credential NFT
    function registerAgent(
        bytes32 agentId,
        address agentAddress,
        string calldata metadataURI
    ) external returns (uint256 tokenId) {
        require(agentIdToTokenId[agentId] == 0, "Agent already registered");
        require(agentAddress != address(0), "Invalid agent address");

        tokenId = nextTokenId++;
        records[tokenId] = AgentRecord({
            agentId: agentId,
            agentAddress: agentAddress,
            operatorAddress: msg.sender,
            metadataURI: metadataURI,
            registeredAt: uint64(block.timestamp),
            isRevoked: false
        });

        agentIdToTokenId[agentId] = tokenId;
        tokenOwner[tokenId] = msg.sender;

        emit Locked(tokenId);
        emit AgentRegistered(tokenId, agentId, agentAddress, metadataURI);
    }

    /// @notice ERC-5192: All credentials are permanently locked (soulbound)
    function locked(uint256 tokenId) external view override returns (bool) {
        require(tokenOwner[tokenId] != address(0), "Nonexistent token");
        return true;
    }

    /// @notice Soulbound: Transfers are prohibited
    function transferFrom(address, address, uint256) external pure {
        revert("Soulbound: Token cannot be transferred");
    }

    /// @notice Mark agent credential revoked upon subtree revocation
    function revokeAgent(bytes32 agentId) external {
        uint256 tokenId = agentIdToTokenId[agentId];
        require(tokenId != 0, "Agent not registered");
        require(
            msg.sender == owner || msg.sender == mandateTreeContract || msg.sender == records[tokenId].operatorAddress,
            "Unauthorized"
        );

        records[tokenId].isRevoked = true;
        emit AgentRevoked(tokenId, agentId);
    }

    /// @notice Public verifier query for autonomous agents
    function verifyAgent(bytes32 agentId) external view returns (
        NodeStatus status,
        address agentAddress,
        address operatorAddress,
        string memory metadataURI
    ) {
        uint256 tokenId = agentIdToTokenId[agentId];
        if (tokenId == 0) {
            return (NodeStatus.EXPIRED, address(0), address(0), "");
        }

        AgentRecord memory rec = records[tokenId];
        if (rec.isRevoked) {
            return (NodeStatus.REVOKED, rec.agentAddress, rec.operatorAddress, rec.metadataURI);
        }

        if (mandateTreeContract != address(0)) {
            MandateNode memory node = IMandateTree(mandateTreeContract).getNode(agentId);
            if (node.status == NodeStatus.REVOKED) {
                return (NodeStatus.REVOKED, rec.agentAddress, rec.operatorAddress, rec.metadataURI);
            }
            if (node.expiry > 0 && block.timestamp >= node.expiry) {
                return (NodeStatus.EXPIRED, rec.agentAddress, rec.operatorAddress, rec.metadataURI);
            }
        }

        return (NodeStatus.ACTIVE, rec.agentAddress, rec.operatorAddress, rec.metadataURI);
    }
}
