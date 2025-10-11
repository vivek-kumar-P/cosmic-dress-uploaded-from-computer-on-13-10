import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Basic health check
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Health check failed" }, { status: 500 })
  }
}
