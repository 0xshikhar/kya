# KYA — The Financial Firewall for Autonomous AI

> **Bounded capital, real-time USD velocity policies, and proof-gated settlement for AI agents - enforced natively by Flare's oracle infrastructure.**  


---

## 1. Executive Summary

Autonomous AI agents (Coinbase AgentKit, ElizaOS, Virtuals, LangChain) are receiving Web3 wallets to manage DeFi positions, liquidate vaults, and execute trades. Today, operators face a critical dilemma: **either give an agent hot wallet custody over treasury assets, or don't let it transact at all.** A single prompt injection, infinite execution loop, or rogue container can drain the entire vault in seconds.

**KYA by Mandant is the financial firewall that solves this.**  
Instead of raw private key custody, agents operate inside mathematically bounded mandates. Capital is attenuated downward through a directed acyclic graph (DAG), spends are dynamically converted and capped in USD using **Flare FTSOv2** sub-second oracles, and cross-chain payouts are proof-gated via the **Flare Data Connector (FDC)**. If an agent goes rogue, an operator triggers an $O(1)$ kill-switch that instantly freezes the subtree and sweeps unspent capital back to the treasury.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KYA PROTOCOL (Flare EVM)                        │
├────────────────────────────────────────────────────────────────────────┤
│  L4  CREDENTIAL   ERC-8004 machine identity + ERC-5192 Soulbound NFT   │
│  L3  EVALUATORS   Hash-Match · FDC XRPL Payment · FDC EVM Tx Proofs    │
│  L2  SETTLEMENT   ERC-8183 conditional job escrow exit gate           │
│  L1  POLICY       Block-latency FTSOv2 USD spend caps & allowlists     │
│  L0  ACCOUNTING   Idle + sum(ChildGranted) + JobLocked = Granted       │
│                   Attenuated spawn · O(1) subtree revoke · Fail-closed │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Core Mathematical Conservation Invariant

Every KYA mandate adheres to a strict conservation law verified across 128,000 fuzzing runs with 0 reverts:

$$\text{Idle} + \sum \text{ChildGranted} + \text{JobLocked} = \text{GrantedBudget}$$

* **Downward Attenuation:** A child mandate cannot be granted more than its parent's idle balance ($\text{child.granted} \le \text{parent.idle}$).
* **Policy Containment:** A child's target contracts and function selectors must be a strict subset of its parent's allowlist ($\text{child.allowlist} \subseteq \text{parent.allowlist}$).
* **Bounded Expiry:** A child's lifespan cannot exceed its parent's expiration ($\text{child.expiry} \le \text{parent.expiry}$).
* **Single Value Exit:** Capital can **only** leave the hierarchy through verified `evaluator.complete()` job settlements (ERC-8183).
* **Atomic $O(1)$ Revocation:** Revoking a node flips its status to `REVOKED`, immediately sweeping all unspent idle capital up the tree while leaving sibling subtrees intact.

---

## 3. Verified Deployments on Flare Coston2 Testnet

All 10 protocol contracts are deployed and verified live on **Flare Coston2 Testnet (Chain ID: 114)**:

- **Network:** Flare Coston2 Testnet (`chainId: 114`)
- **RPC Endpoint:** `https://coston2-api.flare.network/ext/C/rpc`
- **Block Explorer:** `https://coston2-explorer.flare.network`
- **Deployer / Operator:** [`0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5`](https://coston2-explorer.flare.network/address/0x1B4AcaBA13f8B3B858c0796A7d62FC35A5ED3BA5)

| Contract | Layer | Address | Explorer Link | Standards |
|---|---|---|---|---|
| **MandateHub** | L0 | `0x9f1888516d1c087F835F594892B915dD9DCbe5f1` | [View Bytecode](https://coston2-explorer.flare.network/address/0x9f1888516d1c087F835F594892B915dD9DCbe5f1) | KYA Vault |
| **MandateTree** | L0 | `0xa6A6dcad668470D3BfC5c73938B4558e5aad1505` | [View Bytecode](https://coston2-explorer.flare.network/address/0xa6A6dcad668470D3BfC5c73938B4558e5aad1505) | DAG Accounting |
| **JobAdapter** | L2 | `0x7c6aa54Eaeea04Cf8950b1451faF0B21CB6037c2` | [View Bytecode](https://coston2-explorer.flare.network/address/0x7c6aa54Eaeea04Cf8950b1451faF0B21CB6037c2) | ERC-8183 |
| **PolicyEngine** | L1 | `0x766E384Bcf39b95A922BAd71098533bf652BfA11` | [View Bytecode](https://coston2-explorer.flare.network/address/0x766E384Bcf39b95A922BAd71098533bf652BfA11) | FTSOv2 Limits |
| **CredentialRegistry** | L4 | `0x07Bf0C7c2168647642f1E9fb4076cdEF0aDb4D6D` | [View Bytecode](https://coston2-explorer.flare.network/address/0x07Bf0C7c2168647642f1E9fb4076cdEF0aDb4D6D) | ERC-8004 / 5192 |
| **HashMatchEvaluator** | L3 | `0xfeEd714CCA799FA57e6aE25f8FE009Dd4fA854e3` | [View Bytecode](https://coston2-explorer.flare.network/address/0xfeEd714CCA799FA57e6aE25f8FE009Dd4fA854e3) | Hash-Match |
| **FdcPaymentEvaluator** | L3 | `0xcd34A2d8fFC72E3d587cfAEe3d1B0BdB11859501` | [View Bytecode](https://coston2-explorer.flare.network/address/0xcd34A2d8fFC72E3d587cfAEe3d1B0BdB11859501) | FDC XRPL Proof |
| **FdcEvmTxEvaluator** | L3 | `0x87D7E59a37261c3438a70F769B7b2DB5A79Fb927` | [View Bytecode](https://coston2-explorer.flare.network/address/0x87D7E59a37261c3438a70F769B7b2DB5A79Fb927) | FDC EVM Proof |
| **MandateLog** | L0 | `0xF086aB5734Ee1cD10235f6f5f7F7Fc542d78E98e` | [View Bytecode](https://coston2-explorer.flare.network/address/0xF086aB5734Ee1cD10235f6f5f7F7Fc542d78E98e) | Audit Log |
| **MockUSDC** | L0 | `0x419cFe85e77a0A26B9989059057318F59764F7C5` | [View Bytecode](https://coston2-explorer.flare.network/address/0x419cFe85e77a0A26B9989059057318F59764F7C5) | ERC-20 |

### Canonical Flare Oracles & Live Feed IDs
* **FlareContractRegistry:** `0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019`
* **FtsoV2 Contract:** `0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d`
* **FLR / USD Feed:** `0x01464c522f55534400000000000000000000000000` (8 decimals)
* **XRP / USD Feed:** `0x015852502f55534400000000000000000000000000` (6 decimals)
* **Max Staleness Constraint:** `< 600s` (10 minutes) enforced fail-closed (`PolicyEngine.sol:L13`)
* **FdcVerification:** `0x906507E0B64bcD494Db73bd0459d1C667e14B933`

---

## 4. Live Verified Multi-Contract On-Chain Sequence

The entire end-to-end lifecycle has been executed and confirmed on Flare Coston2 Testnet via [`packages/sdk/scripts/interact-coston2.ts`](./packages/sdk/scripts/interact-coston2.ts):

| Step | Action | Tx Hash | Result |
|---|---|---|---|
| **1** | Mint Soulbound Agent Credential NFT | [`0xa3ce56e1...`](https://coston2-explorer.flare.network/tx/0xa3ce56e15a047df9268ddeb400739211f4b2fd5d51cec1eca6ff41f0a6a1d57f) | Status: `ACTIVE` (ERC-8004) |
| **2** | Configure FTSOv2 USD Policy | [`0xd3ce96eb...`](https://coston2-explorer.flare.network/tx/0xd3ce96ebc7261edc32f1344cdcd793247e19b141a60b19037f2212db536f6821) | Caps: $100/call, $500/hr, $1000/day |
| **3** | Approve & Create Root Mandate (2,000 USDC) | [`0xe3a051cf...`](https://coston2-explorer.flare.network/tx/0xe3a051cf1a24f34909545f3914a22ec030f74dd6d42de3c54d9367f24e6b9f86) & [`0xe0a7a25d...`](https://coston2-explorer.flare.network/tx/0xe0a7a25d8ff4bf2458c84f53daf1a19e6451fd0338d2256dbd4678b190ea6f25) | Root ID `0x6adf1c16...`, 2,000 USDC vaulted |
| **4** | Spawn Attenuated Child Mandate (500 USDC) | [`0x2dd18d64...`](https://coston2-explorer.flare.network/tx/0x2dd18d64ddf0cbc49e11165f9cd3cd48eca06d91f5dcc09f4cb1e30794550308) | Invariant: $1,500 + 500 = 2,000$ (PASSED) |
| **5a** | Fund ERC-8183 Job Escrow (100 USDC) | [`0x4a237e8c...`](https://coston2-explorer.flare.network/tx/0x4a237e8ce053394362b934654204601a3450881169a440f1a8a1b3bd4e948ce1) | Job ID `1` locked in escrow |
| **5b** | Submit Deliverable Hash | [`0x78168905...`](https://coston2-explorer.flare.network/tx/0x7816890514996839b86a8b14a1e8cd9b6f6585cfe398ee10b9ebe8ab6a1e3e1f) | Cryptographic deliverable submitted |
| **5c** | Evaluator Verification & Settlement | [`0xd7185bd7...`](https://coston2-explorer.flare.network/tx/0xd7185bd724fa608a7ea4bdb6d57362edaf1416a6b8671a3ad7f966183dc16e87) | 100 USDC payout transferred to provider |
| **6** | 1-Tx Emergency Quarantine & Capital Sweep | [`0x1e1e1834...`](https://coston2-explorer.flare.network/tx/0x1e1e183404688fa0261d47335b6e5251528c5840627c388012e0288a7db78b3e) | Child REVOKED; 400 USDC swept to root; Conservation preserved |

---

## 5. Monorepo Structure

```
kya-network/
├── apps/                    # Next.js 15 App (Light Studio Aesthetic)
│   ├── app/                 # Routes: / (Landing), /dashboard (Console), /demo (DAG), /login, /signup
│   ├── components/          # Design system, XYFlow DAG nodes, wallet button, oracle telemetry
│   ├── hooks/               # useWallet (Viem EIP-1193), useFtsoFeeds (Live Coston2 Oracle)
│   └── lib/                 # Contract configurations, demo path simulations
├── packages/
│   ├── contracts/           # Foundry EVM smart contracts (MandateTree, PolicyEngine, Evaluators)
│   ├── sdk/                 # TypeScript SDK (@kya-network/sdk) built with Viem
│   ├── relayer/             # FDC state connector background settlement worker
│   ├── mcp-server/          # Model Context Protocol tools for AI agents (Claude, Cursor, Eliza)
│   └── templates/           # Autonomous FAssets Vault Copilot template
├── docs/                    # Architecture, threat model, grant pitch, and audit readiness
└── status.md                # Implementation milestones and phase roadmap
```

---

## 6. Quickstart & Verification

### Prerequisites
* [Foundry](https://getfoundry.sh/) (`forge`, `cast`)
* [Bun](https://bun.sh/) (for SDK, scripts, and MCP server)
* [pnpm](https://pnpm.io/) (for the Next.js frontend)

### 1. Smart Contract Tests (Foundry)
```bash
# Run all 47 unit and audit penetration tests
forge test --root packages/contracts

# Run 128,000-call stateful invariant fuzzing
forge test --root packages/contracts --match-contract MandantInvariantTest
```

### 2. TypeScript SDK & Live Coston2 Interaction (Bun)
```bash
# Run SDK unit tests
bun test packages/sdk/test/sdk.test.ts

# Execute live Coston2 interaction script
bun run packages/sdk/scripts/interact-coston2.ts
```

### 3. Frontend Operator Console (Next.js)
```bash
cd apps
pnpm install
pnpm run dev
# Visit http://localhost:3000 (Landing), /dashboard (Operator Console), /demo (DAG Visualizer)
```

---

## 7. Developer SDK Quickstart (`@kya-network/sdk`)

```typescript
import { KyaClient, COSTON2_CONFIG } from "@kya-network/sdk"
import { privateKeyToAccount } from "viem/accounts"

const operator = privateKeyToAccount(process.env.OPERATOR_KEY as `0x${string}`)
const client = new KyaClient(COSTON2_CONFIG, operator)

// 1. Initialize root mandate with $10,000 USDC vault
const rootMandate = await client.createRoot({
  amountUSD: 10_000n,
  expiry: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
})

// 2. Spawn an attenuated child agent with FTSOv2 USD spend cap
const childAgent = await client.spawn({
  parentId: rootMandate.id,
  agentAddress: "0xAgentWalletAddress...",
  grantedUSD: 1_000n,
  policy: {
    maxSpendPerCallUSD: 50n,  // Enforced by live FTSOv2 price feeds
    maxSpendPerDayUSD: 200n,
    targetAllowlist: ["0xSparkDexRouterAddress..."],
  },
})

// 3. Emergency 1-Tx kill-switch (sweeps unspent idle capital back to root)
await client.revokeSubtree(childAgent.id)
```

---

## 8. License

KYA by Mandant is open-source software licensed under the [GPL-3.0](./packages/contracts/LICENSE).
