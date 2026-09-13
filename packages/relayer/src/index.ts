export * from "./types.js"
export * from "./relayer.js"

import { FdcRelayer } from "./relayer.js"

async function main() {
  const rpcUrl = process.env.FLARE_RPC_URL || "https://coston2-api.flare.network/ext/C/rpc"
  const adapterAddress = (process.env.JOB_ADAPTER_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`
  const evaluatorAddress = (process.env.FDC_EVALUATOR_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`

  console.log("==================================================")
  console.log("   KYA Network — FDC Settlement Relayer Daemon    ")
  console.log("==================================================")
  console.log(`RPC: ${rpcUrl}`)
  console.log(`JobAdapter: ${adapterAddress}`)
  console.log(`Evaluator: ${evaluatorAddress}`)

  const relayer = new FdcRelayer({
    rpcUrl,
    adapterAddress,
    evaluatorAddress,
    dryRun: true,
  })

  relayer.start()

  process.on("SIGINT", () => {
    relayer.stop()
    process.exit(0)
  })

  process.on("SIGTERM", () => {
    relayer.stop()
    process.exit(0)
  })
}

if (import.meta.main) {
  main().catch(console.error)
}
