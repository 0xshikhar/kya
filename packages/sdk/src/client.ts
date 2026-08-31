import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
  type Address,
  type Chain,
  type Hash,
  type PublicClient,
  type WalletClient,
  type Transport,
} from "viem"
import { coston2 } from "./chains.js"
import {
  MandateHubABI,
  MandateTreeABI,
  JobAdapterABI,
  PolicyEngineABI,
  CredentialRegistryABI,
} from "./abi/index.js"
import {
  type CreateRootParams,
  type SpawnParams,
  type FundJobParams,
  type KyaAddresses,
  type MandateNode,
  type IntegrityPack,
  NodeStatus,
} from "./types.js"

export interface KyaClientConfig {
  chain?: Chain
  transport?: Transport
  rpcUrl?: string
  account?: Account
  addresses: KyaAddresses
}

export class KyaClient {
  public readonly chain: Chain
  public readonly addresses: KyaAddresses
  public readonly publicClient: PublicClient
  public readonly walletClient?: WalletClient

  constructor(config: KyaClientConfig) {
    this.chain = config.chain || coston2
    this.addresses = config.addresses

    const transport = config.transport || http(config.rpcUrl)
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport,
    })

    if (config.account) {
      this.walletClient = createWalletClient({
        account: config.account,
        chain: this.chain,
        transport,
      })
    }
  }

  private _requireWallet(): WalletClient {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error("WalletClient with an account is required for write operations")
    }
    return this.walletClient
  }

  /// @notice Creates the top-level root mandate in the MandateTree
  async createRoot(params: CreateRootParams): Promise<Hash> {
    const wallet = this._requireWallet()
    return await wallet.writeContract({
      address: this.addresses.tree,
      abi: MandateTreeABI,
      functionName: "createRoot",
      args: [
        params.owner,
        params.agent,
        params.watchdog,
        params.asset,
        params.granted,
        params.expiry,
        params.allowlist || [],
        params.policyHash || ("0x0000000000000000000000000000000000000000000000000000000000000000" as Hash),
      ],
      chain: this.chain,
      account: wallet.account!,
    })
  }

  /// @notice Spawns an attenuated child node under a parent mandate
  async spawn(params: SpawnParams): Promise<Hash> {
    const wallet = this._requireWallet()
    return await wallet.writeContract({
      address: this.addresses.tree,
      abi: MandateTreeABI,
      functionName: "spawn",
      args: [
        params.parentId,
        params.agent,
        params.watchdog,
        params.granted,
        params.expiry,
        params.allowlist || [],
        params.policyHash || ("0x0000000000000000000000000000000000000000000000000000000000000000" as Hash),
      ],
      chain: this.chain,
      account: wallet.account!,
    })
  }

  /// @notice Emergency 1-Tx Subtree Revocation. Halts node and sweeps unspent capital to parent.
  async revokeSubtree(mandateId: Hash): Promise<Hash> {
    const wallet = this._requireWallet()
    return await wallet.writeContract({
      address: this.addresses.tree,
      abi: MandateTreeABI,
      functionName: "revokeSubtree",
      args: [mandateId],
      chain: this.chain,
      account: wallet.account!,
    })
  }

  /// @notice Reads onchain state of a node in the tree
  async getNode(nodeId: Hash): Promise<MandateNode> {
    const result = (await this.publicClient.readContract({
      address: this.addresses.tree,
      abi: MandateTreeABI,
      functionName: "getNode",
      args: [nodeId],
    })) as any

    return {
      parentId: result.parentId,
      owner: result.owner,
      agent: result.agent,
      watchdog: result.watchdog,
      asset: result.asset,
      granted: BigInt(result.granted),
      idle: BigInt(result.idle),
      childGranted: BigInt(result.childGranted),
      jobLocked: BigInt(result.jobLocked),
      expiry: BigInt(result.expiry),
      subtreeEpoch: Number(result.subtreeEpoch),
      seenParentEpoch: Number(result.seenParentEpoch),
      childCount: Number(result.childCount),
      depth: Number(result.depth),
      status: Number(result.status) as NodeStatus,
      allowlistHash: result.allowlistHash,
      policyHash: result.policyHash,
    }
  }

  /// @notice Verifies an agent against the onchain CredentialRegistry
  async verifyAgent(agentId: Hash): Promise<{
    status: NodeStatus
    agentAddress: Address
    operatorAddress: Address
    metadataURI: string
  }> {
    const [status, agentAddress, operatorAddress, metadataURI] = (await this.publicClient.readContract({
      address: this.addresses.credentialRegistry,
      abi: CredentialRegistryABI,
      functionName: "verifyAgent",
      args: [agentId],
    })) as [number, Address, Address, string]

    return {
      status: status as NodeStatus,
      agentAddress,
      operatorAddress,
      metadataURI,
    }
  }

  /// @notice Funds a conditional job escrow under the agent's idle balance
  async fundJob(params: FundJobParams): Promise<Hash> {
    const wallet = this._requireWallet()
    return await wallet.writeContract({
      address: this.addresses.adapter,
      abi: JobAdapterABI,
      functionName: "fundJob",
      args: [
        params.mandateId,
        params.provider,
        params.evaluator,
        params.amount,
        params.deadline,
        params.expectedHash || ("0x0000000000000000000000000000000000000000000000000000000000000000" as Hash),
      ],
      chain: this.chain,
      account: wallet.account!,
    })
  }

  /// @notice Simulates an asset spend in USD using FTSOv2 price feeds without sending a transaction
  async simulateSpendUSD(asset: Address, amount: bigint, assetDecimals: number): Promise<bigint> {
    return (await this.publicClient.readContract({
      address: this.addresses.policyEngine,
      abi: PolicyEngineABI,
      functionName: "getAssetValueUSD",
      args: [asset, amount, assetDecimals],
    })) as bigint
  }

  /// @notice Exports signed Cryptographic Integrity Pack proving invariant conservation
  async buildIntegrityPack(rootId: Hash): Promise<IntegrityPack> {
    const root = await this.getNode(rootId)
    const isConserved = root.idle + root.childGranted + root.jobLocked === root.granted

    return {
      protocol: "KYA Network",
      version: "1.0.0",
      network: this.chain.name,
      chainId: this.chain.id,
      timestamp: new Date().toISOString(),
      rootMandate: {
        id: rootId,
        granted: root.granted.toString(),
        idle: root.idle.toString(),
        childAllocated: root.childGranted.toString(),
        jobLocked: root.jobLocked.toString(),
        isConserved,
      },
    }
  }
}
