# KYA

An autonomous collateral ratio (CR) monitoring and rebalancing copilot template for FAssets AgentVault operators on Flare (Coston2 Testnet & Flare Mainnet).

## Overview

FAssets agents risk liquidation if market volatility causes their vault collateral ratio to fall below required safety boundaries (e.g., $140\% - 160\%$).
However, giving an autonomous bot unlimited hot wallet authorization to deposit or trade introduces prompt injection and drainage risks.

**The KYA Solution:**
1. **Mathematical Conservation (L0):** The copilot operates under an attenuated child mandate. It cannot spend more than its explicitly granted idle balance.
2. **FTSOv2 USD Policy Containment (L1):** Real-time onchain price feeds enforce strict per-call caps ($\le \$200$) and daily velocity limits ($\le \$1,000/\text{day}$).
3. **Emergency Revocation:** If rogue behavior is detected, the operator executes a 1-transaction kill-switch that freezes the copilot and sweeps remaining funds back to the treasury.

## Quickstart

```bash
bun install
bun run src/run-copilot.ts
```

## Running Tests

```bash
bun test
```
