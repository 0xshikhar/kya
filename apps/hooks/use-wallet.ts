"use client"

import { useState, useEffect, useCallback } from "react"
import { createPublicClient, http, formatEther, formatUnits, parseAbi } from "viem"
import { COSTON2_CONTRACTS } from "@/lib/contracts"

export const COSTON2_CHAIN_ID = 114
export const COSTON2_HEX_CHAIN_ID = "0x72" // 114 in hex
export const FLARE_MAINNET_CHAIN_ID = 14
export const FLARE_COSTON2_FAUCET_URL = "https://faucet.flare.network/coston2"

const coston2Client = createPublicClient({
  transport: http(COSTON2_CONTRACTS.rpcUrl),
})

const ERC20_ABI = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
])

export interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  isSwitchingChain: boolean
  chainId: number | null
  isCoston2: boolean
  isInstalled: boolean
  walletName: string
  balance: string | null // C2FLR native
  usdcBalance: string | null // MockUSDC collateral
  error: string | null
  connect: () => Promise<string | null>
  disconnect: () => void
  switchToCoston2: () => Promise<boolean>
  refreshBalance: () => Promise<void>
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSwitchingChain, setIsSwitchingChain] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [walletName, setWalletName] = useState("Web3 Wallet")

  // Check if wallet is installed and detect name
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      setIsInstalled(true)
      const eth = (window as any).ethereum
      if (eth.isRabby) setWalletName("Rabby")
      else if (eth.isMetaMask) setWalletName("MetaMask")
      else if (eth.isCoinbaseWallet) setWalletName("Coinbase Wallet")
      else if (eth.isBraveWallet) setWalletName("Brave Wallet")
      else setWalletName("Injected Wallet")
    } else {
      setIsInstalled(false)
      setWalletName("No Wallet Detected")
    }
  }, [])

  // Fetch balances for address (Native C2FLR + MockUSDC)
  const fetchBalances = useCallback(async (addr: string) => {
    if (!addr) return

    // 1. Native C2FLR Balance
    try {
      const bal = await coston2Client.getBalance({ address: addr as `0x${string}` })
      const formatted = parseFloat(formatEther(bal)).toFixed(3)
      setBalance(`${formatted} C2FLR`)
    } catch (err) {
      console.warn("Failed to fetch Coston2 native balance:", err)
      setBalance(null)
    }

    // 2. MockUSDC Balance
    try {
      if (COSTON2_CONTRACTS.addresses.mockUSDC) {
        const usdcBal = await coston2Client.readContract({
          address: COSTON2_CONTRACTS.addresses.mockUSDC as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [addr as `0x${string}`],
        })
        const formattedUsdc = parseFloat(formatUnits(usdcBal, 6)).toFixed(2)
        setUsdcBalance(`${formattedUsdc} USDC`)
      }
    } catch {
      // MockUSDC contract might be uninitialized in some blocks, fallback gracefully
      setUsdcBalance(null)
    }
  }, [])

  // Switch to Flare Coston2 Testnet
  const switchToCoston2 = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("No Web3 wallet detected")
      return false
    }

    setIsSwitchingChain(true)
    setError(null)
    const ethereum = (window as any).ethereum

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: COSTON2_HEX_CHAIN_ID }],
      })
      setChainId(COSTON2_CHAIN_ID)
      setError(null)
      return true
    } catch (switchError: any) {
      // Error code 4902 indicates that the chain has not been added to the wallet
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: COSTON2_HEX_CHAIN_ID,
                chainName: COSTON2_CONTRACTS.name,
                nativeCurrency: {
                  name: "Coston2 Flare",
                  symbol: "C2FLR",
                  decimals: 18,
                },
                rpcUrls: [COSTON2_CONTRACTS.rpcUrl],
                blockExplorerUrls: [COSTON2_CONTRACTS.explorerUrl],
              },
            ],
          })
          setChainId(COSTON2_CHAIN_ID)
          setError(null)
          return true
        } catch (addError: any) {
          setError(addError.message || "Failed to add Flare Coston2 network")
          return false
        }
      }
      setError(switchError.message || "Failed to switch to Flare Coston2")
      return false
    } finally {
      setIsSwitchingChain(false)
    }
  }, [])

  // Connect wallet
  const connect = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("No Web3 wallet detected. Please install MetaMask, Rabby, or Coinbase Wallet.")
      return null
    }

    setIsConnecting(true)
    setError(null)

    const ethereum = (window as any).ethereum

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" })
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts authorized.")
      }

      const connectedAddr = accounts[0] as string
      setAddress(connectedAddr)
      localStorage.setItem("kya_wallet_connected", "true")

      const currentChainHex = await ethereum.request({ method: "eth_chainId" })
      const currentChainId = parseInt(currentChainHex, 16)
      setChainId(currentChainId)

      if (currentChainId !== COSTON2_CHAIN_ID) {
        // Prompt to switch to Coston2
        await switchToCoston2()
      }

      await fetchBalances(connectedAddr)
      return connectedAddr
    } catch (err: any) {
      console.error("Wallet connection error:", err)
      setError(err.message || "Failed to connect wallet")
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [switchToCoston2, fetchBalances])

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAddress(null)
    setChainId(null)
    setBalance(null)
    setUsdcBalance(null)
    setError(null)
    localStorage.removeItem("kya_wallet_connected")
  }, [])

  // Manual refresh balance
  const refreshBalance = useCallback(async () => {
    if (address) {
      await fetchBalances(address)
    }
  }, [address, fetchBalances])

  // EIP-1193 Event Listeners and Auto-reconnect
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return

    const ethereum = (window as any).ethereum

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnect()
      } else {
        const newAddr = accounts[0]
        setAddress(newAddr)
        fetchBalances(newAddr)
      }
    }

    const handleChainChanged = (chainHex: string) => {
      const newChainId = parseInt(chainHex, 16)
      setChainId(newChainId)
      if (address) {
        fetchBalances(address)
      }
    }

    ethereum.on("accountsChanged", handleAccountsChanged)
    ethereum.on("chainChanged", handleChainChanged)

    // Check if previously connected
    const wasConnected = localStorage.getItem("kya_wallet_connected") === "true"
    if (wasConnected) {
      ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            const addr = accounts[0]
            setAddress(addr)
            ethereum.request({ method: "eth_chainId" }).then((chainHex: string) => {
              setChainId(parseInt(chainHex, 16))
            })
            fetchBalances(addr)
          } else {
            localStorage.removeItem("kya_wallet_connected")
          }
        })
        .catch(console.warn)
    }

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged)
        ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [address, disconnect, fetchBalances])

  const isConnected = !!address
  const isCoston2 = chainId === COSTON2_CHAIN_ID

  return {
    address,
    isConnected,
    isConnecting,
    isSwitchingChain,
    chainId,
    isCoston2,
    isInstalled,
    walletName,
    balance,
    usdcBalance,
    error,
    connect,
    disconnect,
    switchToCoston2,
    refreshBalance,
  }
}

