# KYA Network (Know Your Agent)

> **Autonomous Agent Authorization, Policy Containment & Settlement Protocol on Flare**

KYA Network provides the onchain enforcement rails that allow operators to allocate capital to autonomous AI agents **without granting raw treasury custody**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          KYA NETWORK (Flare EVM)                       │
├────────────────────────────────────────────────────────────────────────┤
│  L4  CREDENTIAL   ERC-8004 metadata identity + ERC-5192 Soulbound NFT  │
│  L3  EVALUATORS   Hash-Match · FDC XRPL Payment · FDC EVM Tx           │
│  L2  SETTLEMENT   ERC-8183 conditional job escrow exit gate           │
│  L1  POLICY       Block-latency FTSOv2 USD spend caps & allowlists     │
│  L0  ACCOUNTING   idle + sum(childGranted) + jobLocked = granted       │
│                   Attenuated spawn · O(1) subtree revoke · Fail-closed │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Verified Deployments on Flare Coston2 Testnet

All protocol contracts are deployed and verified live on **Flare Coston2 Testnet (Chain ID: 114)**:

- **Network:** Flare Coston2 Testnet (`chainId: 114`)
- **RPC Endpoint:** `https://coston2-api.flare.network/ext/C/rpc`
- **Block Explorer:** `https://coston2-explorer.flare.network`
- **Deployer / Operator:** [`0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5`](https://coston2-explorer.flare.network/address/0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5)

| Contract | Address | Explorer Link |
|---|---|---|
| **MandateHub** | `0x9f1888516d1c087F835F594892B915dD9DCbe5f1` | [View on Explorer](https://coston2-explorer.flare.network/address/0x9f1888516d1c087F835F594892B915dD9DCbe5f1) |
| **MandateTree** | `0xa6A6dcad668470D3BfC5c73938B4558e5aad1505` | [View on Explorer](https://coston2-explorer.flare.network/address/0xa6A6dcad668470D3BfC5c73938B4558e5aad1505) |
| **JobAdapter** (ERC-8183) | `0x7c6aa54Eaeea04Cf8950b1451faF0B21CB6037c2` | [View on Explorer](https://coston2-explorer.flare.network/address/0x7c6aa54Eaeea04Cf8950b1451faF0B21CB6037c2) |
| **PolicyEngine** (FTSOv2) | `0x766E384Bcf39b95A922BAd71098533bf652BfA11` | [View on Explorer](https://coston2-explorer.flare.network/address/0x766E384Bcf39b95A922BAd71098533bf652BfA11) |
| **CredentialRegistry** (ERC-8004/5192) | `0x07Bf0C7c2168647642f1E9fb4076cdEF0aDb4D6D` | [View on Explorer](https://coston2-explorer.flare.network/address/0x07Bf0C7c2168647642f1E9fb4076cdEF0aDb4D6D) |
| **HashMatchEvaluator** | `0xfeEd714CCA799FA57e6aE25f8FE009Dd4fA854e3` | [View on Explorer](https://coston2-explorer.flare.network/address/0xfeEd714CCA799FA57e6aE25f8FE009Dd4fA854e3) |
| **FdcPaymentEvaluator** (FDC XRPL) | `0xcd34A2d8fFC72E3d587cfAEe3d1B0BdB11859501` | [View on Explorer](https://coston2-explorer.flare.network/address/0xcd34A2d8fFC72E3d587cfAEe3d1B0BdB11859501) |
| **FdcEvmTxEvaluator** (FDC EVM) | `0x87D7E59a37261c3438a70F769B7b2DB5A79Fb927` | [View on Explorer](https://coston2-explorer.flare.network/address/0x87D7E59a37261c3438a70F769B7b2DB5A79Fb927) |
| **MandateLog** (Audit Trail) | `0xF086aB5734Ee1cD10235f6f5f7F7Fc542d78E98e` | [View on Explorer](https://coston2-explorer.flare.network/address/0xF086aB5734Ee1cD10235f6f5f7F7Fc542d78E98e) |
| **MockUSDC** | `0x419cFe85e77a0A26B9989059057318F59764F7C5` | [View on Explorer](https://coston2-explorer.flare.network/address/0x419cFe85e77a0A26B9989059057318F59764F7C5) |

Canonical Flare Coston2 Registry & Oracles:
- `FlareContractRegistry`: `0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019`
- `FtsoV2`: `0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d`
- `FdcVerification`: `0x906507E0B64bcD494Db73bd0459d1C667e14B933`

---

## 2. Live Onchain Multi-Contract Interaction Sequence

The full protocol lifecycle has been verified on Coston2 via [`packages/sdk/scripts/interact-coston2.ts`](./packages/sdk/scripts/interact-coston2.ts):

| Step | Action | Tx Hash | Result |
|---|---|---|---|
| **1** | Mint Soulbound Agent Credential NFT | [`0xa3ce56e1...`](https://coston2-explorer.flare.network/tx/0xa3ce56e15a047df9268ddeb400739211f4b2fd5d51cec1eca6ff41f0a6a1d57f) | Status: `ACTIVE` |
| **2** | Configure FTSOv2 USD Policy | [`0xd3ce96eb...`](https://coston2-explorer.flare.network/tx/0xd3ce96ebc7261edc32f1344cdcd793247e19b141a60b19037f2212db536f6821) | Caps: $100/call, $500/hr, $1000/day |
| **3** | Approve & Create Root Mandate (2,000 USDC) | [`0xe3a051cf...`](https://coston2-explorer.flare.network/tx/0xe3a051cf1a24f34909545f3914a22ec030f74dd6d42de3c54d9367f24e6b9f86) & [`0xe0a7a25d...`](https://coston2-explorer.flare.network/tx/0xe0a7a25d8ff4bf2458c84f53daf1a19e6451fd0338d2256dbd4678b190ea6f25) | Root ID `0x6adf1c16...`, 2000 USDC vaulted |
| **4** | Spawn Attenuated Child Mandate (500 USDC) | [`0x2dd18d64...`](https://coston2-explorer.flare.network/tx/0x2dd18d64ddf0cbc49e11165f9cd3cd48eca06d91f5dcc09f4cb1e30794550308) | Invariant: $1500 + 500 = 2000$ (PASSED) |
| **5a** | Fund ERC-8183 Job Escrow (100 USDC) | [`0x4a237e8c...`](https://coston2-explorer.flare.network/tx/0x4a237e8ce053394362b934654204601a3450881169a440f1a8a1b3bd4e948ce1) | Job ID `1` locked in escrow |
| **5b** | Submit Deliverable Hash | [`0x78168905...`](https://coston2-explorer.flare.network/tx/0x7816890514996839b86a8b14a1e8cd9b6f6585cfe398ee10b9ebe8ab6a1e3e1f) | Cryptographic deliverable submitted |
| **5c** | Evaluator Verification & Settlement | [`0xd7185bd7...`](https://coston2-explorer.flare.network/tx/0xd7185bd724fa608a7ea4bdb6d57362edaf1416a6b8671a3ad7f966183dc16e87) | 100 USDC payout transferred to provider |
| **6** | 1-Tx Emergency Quarantine & Capital Sweep | [`0x1e1e1834...`](https://coston2-explorer.flare.network/tx/0x1e1e183404688fa0261d47335b6e5251528c5840627c388012e0288a7db78b3e) | Child REVOKED; 400 USDC swept to root; Root Idle = 1900 USDC |

---

## 3. Repository Structure

```
kya-network/
├── apps/
│   └── app/                 # Next.js 14 frontend with Obsidian Dark theme & /demo DAG visualizer
├── packages/
│   ├── contracts/           # Foundry EVM smart contracts (MandateTree, Evaluators, PolicyEngine)
│   ├── sdk/                 # TypeScript SDK (@kya-network/sdk) built with Viem
│   ├── relayer/             # FDC state connector settlement worker
│   ├── mcp-server/          # Model Context Protocol server exposing KYA tools to AI agents
│   └── templates/           # FAssets Vault Copilot templates
├── docs/                    # Architecture, threat models, and audit readiness
└── status.md                # Detailed implementation status & 5-track launch roadmap
```

---

## 4. Quickstart & Verification

### Running Smart Contract Tests (Foundry)
```bash
# Run all 47 unit & invariant tests
forge test --root packages/contracts

# Run 128,000-call stateful invariant fuzzing
forge test --root packages/contracts --match-contract MandantInvariantTest
```

### Running SDK Tests & Live Coston2 Interaction (Bun)
```bash
# Run SDK unit tests
bun test packages/sdk/test/sdk.test.ts

# Execute live Coston2 interaction script
bun run packages/sdk/scripts/interact-coston2.ts
```
