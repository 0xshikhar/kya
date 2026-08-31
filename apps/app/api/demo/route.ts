import { NextResponse } from "next/server"
import {
  fetchCurrentState,
  executePath1_Happy,
  executePath2_LimitBreach,
  executePath3_RevokeAndSibling,
  executePath4_FdcXrplPayment,
  executePath5_FdcDeadlineRefund,
  revokeSpecificNode,
  resetDemoState,
} from "@/lib/demo-paths"

function serializeJson(data: any) {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  )
}

export async function GET() {
  try {
    const graphState = fetchCurrentState()
    return NextResponse.json(
      serializeJson({
        success: true,
        graph: graphState,
        events: graphState.events,
      })
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch demo state" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, nodeId } = body

    if (action === "path1") {
      const result = executePath1_Happy()
      return NextResponse.json(serializeJson({ success: true, result, graph: fetchCurrentState() }))
    }

    if (action === "path2") {
      const result = executePath2_LimitBreach()
      return NextResponse.json(serializeJson({ success: true, result, graph: fetchCurrentState() }))
    }

    if (action === "path3") {
      const result = executePath3_RevokeAndSibling()
      return NextResponse.json(serializeJson({ success: true, result, graph: fetchCurrentState() }))
    }

    if (action === "path4") {
      const result = executePath4_FdcXrplPayment()
      return NextResponse.json(serializeJson({ success: true, result, graph: fetchCurrentState() }))
    }

    if (action === "path5") {
      const result = executePath5_FdcDeadlineRefund()
      return NextResponse.json(serializeJson({ success: true, result, graph: fetchCurrentState() }))
    }

    if (action === "reset") {
      const result = resetDemoState()
      return NextResponse.json(serializeJson({ success: true, result, graph: fetchCurrentState() }))
    }

    if (action === "revokeNode") {
      if (!nodeId) {
        return NextResponse.json({ success: false, error: "nodeId is required" }, { status: 400 })
      }
      const result = revokeSpecificNode(nodeId)
      return NextResponse.json(serializeJson({ success: true, result, graph: fetchCurrentState() }))
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute demo action" },
      { status: 500 }
    )
  }
}
