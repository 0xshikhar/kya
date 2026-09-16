import { describe, expect, it } from "bun:test"
import { VaultCopilotAgent } from "../src/run-copilot.js"
import { FAssetsVaultMonitor, type AgentVaultState } from "../src/fassets-mock.js"
import type { Address } from "viem"

describe("KYA Network — FAssets Vault Copilot", () => {
  const baseVault: AgentVaultState = {
    vaultAddress: "0x1111111111111111111111111111111111111111" as Address,
    collateralAsset: "FLR",
    collateralDecimals: 18,
    collateralAmount: 4_000_000n * 10n ** 18n, // 4M FLR
    collateralPriceUSD: 0.025, // $100,000 collateral
    mintedFAsset: "FTestXRP",
    mintedDecimals: 6,
    mintedAmount: 100_000n * 10n ** 6n, // 100k XRP
    mintedPriceUSD: 0.50, // $50,000 debt -> CR = 200%
  }

  it("calculates accurate collateral ratio and confirms healthy vault", () => {
    const cr = FAssetsVaultMonitor.calculateCollateralRatio(baseVault)
    expect(cr).toBeCloseTo(200.0, 1)

    const copilot = new VaultCopilotAgent()
    const decision = copilot.evaluateVault(baseVault)
    expect(decision.action).toBe("HEALTHY")
    expect(decision.requiredTopUpWei).toBe(0n)
    expect(decision.estimatedCostUSD).toBe(0)
  })

  it("identifies top-up requirement within policy limits", () => {
    // Drop collateral to $77,500 with $50,000 debt -> CR = 155% (< 160%)
    // Shortfall to reach 160% ($80,000) is $2,500.
    // Let's test a smaller debt to fit in $200 per-call limit:
    // Minted debt: 1,000 XRP @ $0.50 = $500 debt. Target 160% = $800 collateral.
    // Current collateral: $750 (CR = 150%). Shortfall = $50 (< $200 limit).
    const smallVault: AgentVaultState = {
      ...baseVault,
      collateralAmount: 30_000n * 10n ** 18n, // 30,000 FLR @ $0.025 = $750
      mintedAmount: 1_000n * 10n ** 6n, // 1,000 XRP @ $0.50 = $500
    }

    const copilot = new VaultCopilotAgent({ maxSpendPerCallUSD: 200, minSafetyCR: 160 })
    const decision = copilot.evaluateVault(smallVault)

    expect(decision.action).toBe("TOP_UP_REQUIRED")
    expect(decision.currentCR).toBeCloseTo(150.0, 1)
    expect(decision.estimatedCostUSD).toBeCloseTo(50.0, 1)
    expect(decision.requiredTopUpWei).toBeGreaterThan(0n)

    const executed = copilot.executeTopUp(decision)
    expect(executed).toBe(true)
    expect(copilot.getDailySpentUSD()).toBeCloseTo(50.0, 1)
  })

  it("reverts/rejects when required top-up exceeds per-call policy cap", () => {
    // Large shortfall of $5,000 exceeds default $200 cap
    const underVault: AgentVaultState = {
      ...baseVault,
      collateralAmount: 3_000_000n * 10n ** 18n, // $75,000 collateral
      mintedAmount: 100_000n * 10n ** 6n, // $50,000 debt -> 160% target needs $80k ($5,000 shortfall)
    }

    const copilot = new VaultCopilotAgent({ maxSpendPerCallUSD: 200 })
    const decision = copilot.evaluateVault(underVault)

    expect(decision.action).toBe("POLICY_REJECTED")
    expect(decision.reason).toContain("breaches per-call cap")
  })

  it("detects critical liquidation risk when CR drops below critical threshold", () => {
    // Collateral $60,000 with $50,000 debt -> CR = 120% (< 135% critical threshold)
    const criticalVault: AgentVaultState = {
      ...baseVault,
      collateralAmount: 2_400_000n * 10n ** 18n, // $60,000
      mintedAmount: 100_000n * 10n ** 6n, // $50,000
    }

    // Set large per-call cap and daily cap so policy allows checking the critical state
    const copilot = new VaultCopilotAgent({ maxSpendPerCallUSD: 50_000, maxDailySpendUSD: 50_000, criticalCR: 135 })
    const decision = copilot.evaluateVault(criticalVault)

    expect(decision.action).toBe("CRITICAL_LIQUIDATION_RISK")
    expect(decision.currentCR).toBeLessThan(135.0)
  })
})
