import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { KyaMcpTools } from "./tools.js"

const server = new Server(
  {
    name: "kya-network",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

const tools = new KyaMcpTools()

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "kya_get_node",
        description: "Inspect onchain mandate node status, idle balance, child allocations, and mathematical conservation",
        inputSchema: {
          type: "object",
          properties: {
            nodeId: {
              type: "string",
              description: "Mandate bytes32 node ID",
            },
          },
          required: ["nodeId"],
        },
      },
      {
        name: "kya_verify_agent",
        description: "Verify an autonomous agent against the onchain CredentialRegistry (ERC-8004 & ERC-5192)",
        inputSchema: {
          type: "object",
          properties: {
            agentId: {
              type: "string",
              description: "Unique agent identifier hash (bytes32)",
            },
          },
          required: ["agentId"],
        },
      },
      {
        name: "kya_create_job",
        description: "Fund an ERC-8183 conditional escrow job under an active mandate",
        inputSchema: {
          type: "object",
          properties: {
            mandateId: { type: "string", description: "Parent mandate ID" },
            provider: { type: "string", description: "Provider address" },
            evaluator: { type: "string", description: "Evaluator contract address" },
            amount: { type: "string", description: "Amount of asset in wei" },
            deadline: { type: "number", description: "Unix timestamp deadline" },
            expectedHash: { type: "string", description: "Optional deliverable hash" },
          },
          required: ["mandateId", "provider", "evaluator", "amount", "deadline"],
        },
      },
      {
        name: "kya_claim_job",
        description: "Submit deliverable hash and trigger evaluator settlement to claim escrowed payout",
        inputSchema: {
          type: "object",
          properties: {
            jobId: { type: "string", description: "Job ID to claim" },
            deliverableHash: { type: "string", description: "Cryptographic hash of deliverable" },
            proofData: { type: "string", description: "Optional FDC attestation proof" },
          },
          required: ["jobId", "deliverableHash"],
        },
      },
      {
        name: "kya_revoke",
        description: "Execute emergency 1-transaction kill-switch to isolate an agent and sweep unspent capital to parent",
        inputSchema: {
          type: "object",
          properties: {
            mandateId: { type: "string", description: "Mandate ID to revoke" },
          },
          required: ["mandateId"],
        },
      },
    ],
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case "kya_get_node":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await tools.getNode(args as any), null, 2),
            },
          ],
        }

      case "kya_verify_agent":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await tools.verifyAgent(args as any), null, 2),
            },
          ],
        }

      case "kya_create_job":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await tools.createJob(args as any), null, 2),
            },
          ],
        }

      case "kya_claim_job":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await tools.claimJob(args as any), null, 2),
            },
          ],
        }

      case "kya_revoke":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await tools.revoke(args as any), null, 2),
            },
          ],
        }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: error.message || String(error),
        },
      ],
    }
  }
})

async function run() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("KYA Network MCP Server running on stdio")
}

if (import.meta.main) {
  run().catch(console.error)
}
