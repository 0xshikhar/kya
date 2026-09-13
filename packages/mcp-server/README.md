# KYA Network — Model Context Protocol (MCP) Server

Official Model Context Protocol (MCP) server for KYA Network — autonomous AI agent authorization and settlement protocol on Flare.

## Available Tools

1. **`kya_get_node`**: Inspect onchain mandate node status, idle balance, child allocations, and mathematical conservation.
2. **`kya_verify_agent`**: Verify an autonomous agent against onchain CredentialRegistry (ERC-8004 & ERC-5192 soulbound NFT).
3. **`kya_create_job`**: Fund an ERC-8183 conditional escrow job under an active mandate.
4. **`kya_claim_job`**: Submit deliverable hash and trigger evaluator settlement to claim escrowed payout.
5. **`kya_revoke`**: Execute emergency 1-transaction kill-switch to isolate an agent and sweep unspent capital to parent.

## Claude Desktop Configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kya-network": {
      "command": "bun",
      "args": ["run", "/path/to/kya-network/packages/mcp-server/src/index.ts"],
      "env": {
        "FLARE_RPC_URL": "https://coston2-api.flare.network/ext/C/rpc"
      }
    }
  }
}
```
