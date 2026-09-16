import type { Address, Hash } from "viem"
import { KyaClient, type KyaAddresses } from "@kya-network/sdk"
import {
  FAssetsVaultMonitor,
  type AgentVaultState,
  type CopilotDecision,
} from "./fassets-mock.js"

export interface CopilotPolicyConfig {
  maxSpendPerCallUSD: number
  maxDailySpendUSD: number
  minSafetyCR: number
  criticalCR: number
}

export class VaultCopilotAgent {
  public readonly policy: CopilotPolicyConfig
  private dailySpentUSD: number = 0
  private lastResetDay: number = new Date().getUTCDate()

  constructor(policy?: Partial<CopilotPolicyConfig>) {
    this.policy = {
      maxSpendPerCallUSD: 200.0,
      maxDailySpendUSD: 1000.0,
      minSafetyCR: 160.0,
      criticalCR: 135.0,
      ...policy,
    }
  }

  private _resetDailyBudgetIfNewDay(): void {
    const currentDay = new Date().getUTCDate()
    if (currentDay !== this.lastResetDay) {
      this.dailySpentUSD = 0
      this.lastResetDay = currentDay
    }
  }

  public getDailySpentUSD(): number {
    this._resetDailyBudgetIfNewDay()
    return this.dailySpentUSD
  }

  public evaluateVault(state: AgentVaultState): CopilotDecision {
    this._resetDailyBudgetIfNewDay()
    const currentCR = FAssetsVaultMonitor.calculateCollateralRatio(state)

    // 1. Check if healthy
    if (currentCR >= this.policy.minSafetyCR) {
      return {
        action: "HEALTHY",
        currentCR,
        targetCR: this.policy.minSafetyCR,
        requiredTopUpWei: 0n,
        estimatedCostUSD: 0,
        reason: `Collateral Ratio ${currentCR.toFixed(2)}% is at or above safety target ${this.policy.minSafetyCR}%`,
      }
    }

    // 2. Check required top-up
    const { requiredWei, costUSD } = FAssetsVaultMonitor.calculateTopUpRequired(
      state,
      this.policy.minSafetyCR
    )

    // 3. Check critical liquidation risk
    const isCritical = currentCR < this.policy.criticalCR

    // 4. Validate against KYA USD Policy caps
    if (costUSD > this.policy.maxSpendPerCallUSD) {
      return {
        action: "POLICY_REJECTED",
        currentCR,
        targetCR: this.policy.minSafetyCR,
        requiredTopUpWei: requiredWei,
        estimatedCostUSD: costUSD,
        reason: `Estimated cost ($${costUSD.toFixed(2)}) breaches per-call cap ($${this.policy.maxSpendPerCallUSD})`,
      }
    }

    if (this.dailySpentUSD + costUSD > this.policy.maxDailySpendUSD) {
      return {
        action: "POLICY_REJECTED",
        currentCR,
        targetCR: this.policy.minSafetyCR,
        requiredTopUpWei: requiredWei,
        estimatedCostUSD: costUSD,
        reason: `Estimated cost ($${costUSD.toFixed(2)}) breaches remaining daily budget ($${(this.policy.maxDailySpendUSD - this.dailySpentUSD).toFixed(2)})`,
      }
    }

    return {
      action: isCritical ? "CRITICAL_LIQUIDATION_RISK" : "TOP_UP_REQUIRED",
      currentCR,
      targetCR: this.policy.minSafetyCR,
      requiredTopUpWei: requiredWei,
      estimatedCostUSD: costUSD,
      reason: `CR ${currentCR.toFixed(2)}% below target ${this.policy.minSafetyCR}%. Rebalancing required ($${costUSD.toFixed(2)}).`,
    }
  }

  public executeTopUp(decision: CopilotDecision): boolean {
    if (
      decision.action !== "TOP_UP_REQUIRED" &&
      decision.action !== "CRITICAL_LIQUIDATION_RISK"
    ) {
      return false
    }

    this.dailySpentUSD += decision.estimatedCostUSD
    return true
  }
}

async function main() {
  console.log("=========================================================")
  console.log("   KYA Network — FAssets Vault Copilot Template         ")
  console.log("   Policy: Max $200/call, Max $1,000/day | Target CR: 160%")
  console.log("=========================================================")

  const copilot = new VaultCopilotAgent()

  const sampleState: AgentVaultState = {
    vaultAddress: "0x1234567890123456789012345678901234567890" as Address,
    collateralAsset: "FLR",
    collateralDecimals: 18,
    collateralAmount: 3_000_000n * 10n ** 18n, // 3M FLR
    collateralPriceUSD: 0.025, // $75,000 collateral
    mintedFAsset: "FTestXRP",
    mintedDecimals: 6,
    mintedAmount: 100_000n * 10n ** 6n, // 100,000 XRP
    mintedPriceUSD: 0.55, // $55,000 debt -> CR = 136.36% (Undercollateralized!)
  }

  const decision = copilot.evaluateVault(sampleState)
  console.log(`Current CR: ${decision.currentCR.toFixed(2)}%`)
  console.log(`Decision Action: ${decision.action}`)
  console.log(`Reason: ${decision.reason}`)
  console.log(`Required Wei: ${decision.requiredTopUpWei.toString()}`)
  console.log(`Estimated Cost USD: $${decision.estimatedCostUSD.toFixed(2)}`)
}

if (import.meta.main) {
  main().catch(console.error)
}
