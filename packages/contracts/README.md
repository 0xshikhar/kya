# KYA Network Smart Contracts

> **Core EVM Smart Contracts & Evaluators for KYA Network on Flare Network**

The KYA (Know Your Agent) protocol enforces mathematical capital conservation, downward capability attenuation, block-latency FTSOv2 price feeds, and Flare Data Connector (FDC) payment/EVM deliverable settlement for autonomous AI agents.

---

## 1. Verified Deployments on Flare Coston2 Testnet

- **Network:** Flare Coston2 Testnet
- **Chain ID:** `114`
- **RPC URL:** `https://coston2-api.flare.network/ext/C/rpc`
- **Block Explorer:** `https://coston2-explorer.flare.network`
- **EVM Version:** `paris` (EIP-3855 compatibility)
- **Deployer / Operator:** [`0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5`](https://coston2-explorer.flare.network/address/0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5)

| Contract | Address | Description | Explorer Link |
|---|---|---|---|
| **MandateHub** | `0x9f1888516d1c087F835F594892B915dD9DCbe5f1` | Master asset vault holding root deposits and executing approved settlements | [View on Coston2](https://coston2-explorer.flare.network/address/0x9f1888516d1c087F835F594892B915dD9DCbe5f1) |
| **MandateTree** | `0xa6A6dcad668470D3BfC5c73938B4558e5aad1505` | Hierarchical DAG state engine enforcing $L0$ conservation and $O(1)$ subtree revocation | [View on Coston2](https://coston2-explorer.flare.network/address/0xa6A6dcad668470D3BfC5c73938B4558e5aad1505) |
| **JobAdapter** | `0x7c6aa54Eaeea04Cf8950b1451faF0B21CB6037c2` | ERC-8183 conditional escrow adapter for agent-to-agent and agent-to-human tasks | [View on Coston2](https://coston2-explorer.flare.network/address/0x7c6aa54Eaeea04Cf8950b1451faF0B21CB6037c2) |
| **PolicyEngine** | `0x766E384Bcf39b95A922BAd71098533bf652BfA11` | FTSOv2 price-gated spending caps ($/call, $/hour, $/day) and selector allowlists | [View on Coston2](https://coston2-explorer.flare.network/address/0x766E384Bcf39b95A922BAd71098533bf652BfA11) |
| **CredentialRegistry** | `0x07Bf0C7c2168647642f1E9fb4076cdEF0aDb4D6D` | ERC-8004 metadata identity registry & ERC-5192 soulbound verification NFT | [View on Coston2](https://coston2-explorer.flare.network/address/0x07Bf0C7c2168647642f1E9fb4076cdEF0aDb4D6D) |
| **HashMatchEvaluator** | `0xfeEd714CCA799FA57e6aE25f8FE009Dd4fA854e3` | Level 3 cryptographic hash deliverable verification evaluator | [View on Coston2](https://coston2-explorer.flare.network/address/0xfeEd714CCA799FA57e6aE25f8FE009Dd4fA854e3) |
| **FdcPaymentEvaluator** | `0xcd34A2d8fFC72E3d587cfAEe3d1B0BdB11859501` | Level 3 FDC XRPL / BTC payment Merkle proof settlement evaluator | [View on Coston2](https://coston2-explorer.flare.network/address/0xcd34A2d8fFC72E3d587cfAEe3d1B0BdB11859501) |
| **FdcEvmTxEvaluator** | `0x87D7E59a37261c3438a70F769B7b2DB5A79Fb927` | Level 3 FDC EVM transaction Merkle proof settlement evaluator | [View on Coston2](https://coston2-explorer.flare.network/address/0x87D7E59a37261c3438a70F769B7b2DB5A79Fb927) |
| **MandateLog** | `0xF086aB5734Ee1cD10235f6f5f7F7Fc542d78E98e` | Append-only audit trail recording cryptographic events per node | [View on Coston2](https://coston2-explorer.flare.network/address/0xF086aB5734Ee1cD10235f6f5f7F7Fc542d78E98e) |
| **MockUSDC** | `0x419cFe85e77a0A26B9989059057318F59764F7C5` | 6-decimal testnet settlement token for Coston2 trials | [View on Coston2](https://coston2-explorer.flare.network/address/0x419cFe85e77a0A26B9989059057318F59764F7C5) |

---

## 2. Canonical Flare Oracles & Primitives (Coston2)

| Oracle / Contract | Address | Function |
|---|---|---|
| **FlareContractRegistry** | `0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019` | Canonical onchain registry dynamically resolving all Flare system contracts |
| **FtsoV2** | `0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d` | Block-latency cryptographic price feeds (`FLR/USD`, `XRP/USD`, etc.) |
| **FdcVerification** | `0x906507E0B64bcD494Db73bd0459d1C667e14B933` | Relay contract for state connector Merkle proof verification |

---

## 3. Verified Live Onchain Multi-Contract Interaction Trace

All contracts were interactively tested and verified live on Coston2 via [`packages/sdk/scripts/interact-coston2.ts`](../sdk/scripts/interact-coston2.ts):

1. **Soulbound Agent Credential Registration (L4):**
   - Minted soulbound ERC-5192 NFT on `CredentialRegistry` ([Tx `0xa3ce56e1...`](https://coston2-explorer.flare.network/tx/0xa3ce56e15a047df9268ddeb400739211f4b2fd5d51cec1eca6ff41f0a6a1d57f)). Verified status: `ACTIVE`.
2. **Policy Configuration (L1):**
   - Configured $100 per-call, $500/hr, and $1,000/day caps on `PolicyEngine` ([Tx `0xd3ce96eb...`](https://coston2-explorer.flare.network/tx/0xd3ce96ebc7261edc32f1344cdcd793247e19b141a60b19037f2212db536f6821)).
3. **Root Mandate Creation (L0):**
   - Approved & deposited 2,000 USDC into vault ([Tx `0xe3a051cf...`](https://coston2-explorer.flare.network/tx/0xe3a051cf1a24f34909545f3914a22ec030f74dd6d42de3c54d9367f24e6b9f86) & [Tx `0xe0a7a25d...`](https://coston2-explorer.flare.network/tx/0xe0a7a25d8ff4bf2458c84f53daf1a19e6451fd0338d2256dbd4678b190ea6f25)).
   - Root Mandate ID: `0x6adf1c160c583f5096f98fb5fa6e69f0c991b593f87083527b2b223b4fed8f13`.
4. **Attenuated Child Worker (L0):**
   - Spawned child node with 500 USDC grant ([Tx `0x2dd18d64...`](https://coston2-explorer.flare.network/tx/0x2dd18d64ddf0cbc49e11165f9cd3cd48eca06d91f5dcc09f4cb1e30794550308)).
   - Verified L0 Conservation: `1,500 Idle + 500 Child = 2,000 Granted`.
5. **ERC-8183 Job Escrow & Settlement (L2 / L3):**
   - Funded 100 USDC job escrow ([Tx `0x4a237e8c...`](https://coston2-explorer.flare.network/tx/0x4a237e8ce053394362b934654204601a3450881169a440f1a8a1b3bd4e948ce1)).
   - Submitted deliverable hash ([Tx `0x78168905...`](https://coston2-explorer.flare.network/tx/0x7816890514996839b86a8b14a1e8cd9b6f6585cfe398ee10b9ebe8ab6a1e3e1f)).
   - Verified deliverable via `HashMatchEvaluator` and paid 100 USDC to provider ([Tx `0xd7185bd7...`](https://coston2-explorer.flare.network/tx/0xd7185bd724fa608a7ea4bdb6d57362edaf1416a6b8671a3ad7f966183dc16e87)).
6. **1-Tx Emergency Quarantine & Capital Sweep:**
   - Atomic subtree revocation on child node ([Tx `0x1e1e1834...`](https://coston2-explorer.flare.network/tx/0x1e1e183404688fa0261d47335b6e5251528c5840627c388012e0288a7db78b3e)).
   - Child node flipped to `REVOKED` (fail-closed); 400 USDC unspent balance swept upward to root.
   - Global Invariant Verified: `1,900 Root Idle + 100 Settled = 2,000 Initial Deposit`.

---

## 4. Testing & Verification

Run the complete test suite locally:

```bash
# Run all 47 unit, integration, and invariant fuzz tests
forge test

# Run stateful invariant fuzzing specifically (256 runs x 500 depth = 128,000 calls)
forge test --match-contract MandantInvariantTest -vvv

# Run live Coston2 interaction script via Bun SDK
bun run ../sdk/scripts/interact-coston2.ts
```

All 47 tests pass with 0 errors and 0 invariant violations.
