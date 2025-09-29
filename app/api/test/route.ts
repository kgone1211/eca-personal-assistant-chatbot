import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: "Server is running",
    timestamp: new Date().toISOString(),
    message: "EVA Personal Assistant is working correctly"
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({ 
    received: body,
    status: "POST endpoint working",
    timestamp: new Date().toISOString()
  });
}
