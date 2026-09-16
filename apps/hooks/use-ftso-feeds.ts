"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createPublicClient, http, parseAbi } from "viem"
import { COSTON2_CONTRACTS } from "@/lib/contracts"

export const FLR_USD_FEED_ID = "0x01464c522f55534400000000000000000000000000" as `0x${string}`
export const XRP_USD_FEED_ID = "0x015852502f55534400000000000000000000000000" as `0x${string}`
export const MAX_STALENESS_SECONDS = 600 // 10 minutes policy limit

const FTSO_V2_ABI = parseAbi([
  "function getFeedById(bytes21 feedId) external view returns (uint256 value, int8 decimals, uint64 timestamp)",
])

const coston2Client = createPublicClient({
  transport: http(COSTON2_CONTRACTS.rpcUrl),
})

export interface FtsoFeed {
  id: string
  symbol: "FLR/USD" | "XRP/USD"
  price: number
  formattedPrice: string
  decimals: number
  timestamp: number // seconds
  updatedAt: Date
  stalenessSeconds: number
  isStale: boolean
}

export interface FtsoState {
  flr: FtsoFeed | null
  xrp: FtsoFeed | null
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => Promise<void>
}

export function useFtsoFeeds(): FtsoState {
  const [flr, setFlr] = useState<FtsoFeed | null>(null)
  const [xrp, setXrp] = useState<FtsoFeed | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const isMountedRef = useRef(true)

  const fetchFeeds = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true)
    }

    try {
      const ftsoAddress = (COSTON2_CONTRACTS.oracles?.ftsoV2 ||
        "0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d") as `0x${string}`

      const [flrData, xrpData] = await Promise.all([
        coston2Client.readContract({
          address: ftsoAddress,
          abi: FTSO_V2_ABI,
          functionName: "getFeedById",
          args: [FLR_USD_FEED_ID],
        }),
        coston2Client.readContract({
          address: ftsoAddress,
          abi: FTSO_V2_ABI,
          functionName: "getFeedById",
          args: [XRP_USD_FEED_ID],
        }),
      ])

      const nowSec = Math.floor(Date.now() / 1000)

      // 1. Process FLR/USD
      const [flrVal, flrDec, flrTs] = flrData
      const flrDecNum = Number(flrDec)
      const flrPrice =
        flrDecNum >= 0
          ? Number(flrVal) / Math.pow(10, flrDecNum)
          : Number(flrVal) * Math.pow(10, Math.abs(flrDecNum))
      const flrTimestamp = Number(flrTs)
      const flrStaleness = Math.max(0, nowSec - flrTimestamp)

      const flrFeed: FtsoFeed = {
        id: FLR_USD_FEED_ID,
        symbol: "FLR/USD",
        price: flrPrice,
        formattedPrice: `$${flrPrice.toFixed(6)}`,
        decimals: flrDecNum,
        timestamp: flrTimestamp,
        updatedAt: new Date(flrTimestamp * 1000),
        stalenessSeconds: flrStaleness,
        isStale: flrStaleness > MAX_STALENESS_SECONDS,
      }

      // 2. Process XRP/USD
      const [xrpVal, xrpDec, xrpTs] = xrpData
      const xrpDecNum = Number(xrpDec)
      const xrpPrice =
        xrpDecNum >= 0
          ? Number(xrpVal) / Math.pow(10, xrpDecNum)
          : Number(xrpVal) * Math.pow(10, Math.abs(xrpDecNum))
      const xrpTimestamp = Number(xrpTs)
      const xrpStaleness = Math.max(0, nowSec - xrpTimestamp)

      const xrpFeed: FtsoFeed = {
        id: XRP_USD_FEED_ID,
        symbol: "XRP/USD",
        price: xrpPrice,
        formattedPrice: `$${xrpPrice.toFixed(4)}`,
        decimals: xrpDecNum,
        timestamp: xrpTimestamp,
        updatedAt: new Date(xrpTimestamp * 1000),
        stalenessSeconds: xrpStaleness,
        isStale: xrpStaleness > MAX_STALENESS_SECONDS,
      }

      if (isMountedRef.current) {
        setFlr(flrFeed)
        setXrp(xrpFeed)
        setLastUpdated(new Date())
        setError(null)
      }
    } catch (err: any) {
      console.warn("Failed to query live FTSOv2 price feeds from Coston2:", err)
      if (isMountedRef.current) {
        setError(err.message || "Failed to query Coston2 FTSOv2 feeds")
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }, [])

  // Initial fetch and 15s polling
  useEffect(() => {
    isMountedRef.current = true
    fetchFeeds()

    const pollInterval = setInterval(() => {
      fetchFeeds()
    }, 15000)

    // Tick staleness counters every second
    const tickInterval = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000)
      setFlr((prev) => {
        if (!prev) return prev
        const staleness = Math.max(0, nowSec - prev.timestamp)
        return {
          ...prev,
          stalenessSeconds: staleness,
          isStale: staleness > MAX_STALENESS_SECONDS,
        }
      })
      setXrp((prev) => {
        if (!prev) return prev
        const staleness = Math.max(0, nowSec - prev.timestamp)
        return {
          ...prev,
          stalenessSeconds: staleness,
          isStale: staleness > MAX_STALENESS_SECONDS,
        }
      })
    }, 1000)

    return () => {
      isMountedRef.current = false
      clearInterval(pollInterval)
      clearInterval(tickInterval)
    }
  }, [fetchFeeds])

  const refresh = useCallback(async () => {
    await fetchFeeds(true)
  }, [fetchFeeds])

  return {
    flr,
    xrp,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  }
}
