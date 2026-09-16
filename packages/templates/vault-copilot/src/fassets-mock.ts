import type { Address } from "viem"

export interface AgentVaultState {
  vaultAddress: Address
  collateralAsset: string
  collateralDecimals: number
  collateralAmount: bigint
  collateralPriceUSD: number
  mintedFAsset: string
  mintedDecimals: number
  mintedAmount: bigint
  mintedPriceUSD: number
}

export interface CopilotDecision {
  action: "HEALTHY" | "TOP_UP_REQUIRED" | "POLICY_REJECTED" | "CRITICAL_LIQUIDATION_RISK"
  currentCR: number
  targetCR: number
  requiredTopUpWei: bigint
  estimatedCostUSD: number
  reason: string
}

export class FAssetsVaultMonitor {
  public static calculateCollateralRatio(state: AgentVaultState): number {
    const collateralValueUSD =
      (Number(state.collateralAmount) / 10 ** state.collateralDecimals) * state.collateralPriceUSD
    const mintedValueUSD =
      (Number(state.mintedAmount) / 10 ** state.mintedDecimals) * state.mintedPriceUSD

    if (mintedValueUSD <= 0) return 999.0 // Infinite ratio if no minted debt
    return (collateralValueUSD / mintedValueUSD) * 100.0
  }

  public static calculateTopUpRequired(
    state: AgentVaultState,
    targetCR: number = 160.0
  ): { requiredWei: bigint; costUSD: number } {
    const currentCR = this.calculateCollateralRatio(state)
    if (currentCR >= targetCR) {
      return { requiredWei: 0n, costUSD: 0 }
    }

    const mintedValueUSD =
      (Number(state.mintedAmount) / 10 ** state.mintedDecimals) * state.mintedPriceUSD
    const targetCollateralValueUSD = (targetCR / 100.0) * mintedValueUSD
    const currentCollateralValueUSD =
      (Number(state.collateralAmount) / 10 ** state.collateralDecimals) * state.collateralPriceUSD
    const shortfallUSD = Math.max(0, targetCollateralValueUSD - currentCollateralValueUSD)

    const requiredAssetTokens = shortfallUSD / state.collateralPriceUSD
    const requiredWei = BigInt(Math.ceil(requiredAssetTokens * 10 ** state.collateralDecimals))

    return {
      requiredWei,
      costUSD: shortfallUSD,
    }
  }
}
