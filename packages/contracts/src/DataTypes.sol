// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

enum NodeStatus {
    ACTIVE,
    REVOKED,
    EXPIRED
}

enum JobPhase {
    UNINITIALIZED,
    FUNDED,
    SUBMITTED,
    COMPLETED,
    REJECTED,
    REFUNDED
}

struct MandateNode {
    bytes32 parentId;          // bytes32(0) = root
    address owner;             // human / multisig / parent agent that controls policy
    address agent;             // signer allowed to spawn + fund at this node
    address watchdog;          // optional; address(0) = none
    address asset;             // USDC
    uint128 granted;           // immutable grant into this node
    uint128 idle;              // spendable: spawn or fund
    uint128 childGranted;      // sum of active children's granted
    uint128 jobLocked;         // sum of FUNDED + SUBMITTED jobs
    uint64  expiry;            // absolute unix timestamp
    uint32  subtreeEpoch;      // incremented on revoke of THIS node
    uint32  seenParentEpoch;   // last parent.subtreeEpoch this node observed
    uint16  childCount;        // number of spawned children
    uint8   depth;             // root = 0, child = 1, etc.
    NodeStatus status;         // ACTIVE or REVOKED
    bytes32 allowlistHash;     // keccak256(abi.encodePacked(sorted unique addresses))
    bytes32 policyHash;        // EIP-712 commitment of extra rules
}

struct OpenJob {
    uint256 jobId;
    bytes32 mandateId;
    address provider;
    address evaluator;
    uint128 amount;
    uint64  deadline;
    JobPhase phase;            // FUNDED, SUBMITTED
    bytes32 expectedDeliverableHash;
}
