import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const experienceId = searchParams.get("experienceId");
    const companyId = searchParams.get("companyId");
    
    // This is the proper Whop app integration
    // Your app gets embedded in Whop's platform
    // Users access it through Whop's interface
    
    return NextResponse.json({
      success: true,
      message: "Whop app integration working",
      experienceId,
      companyId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Whop app error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Whop app error" 
    }, { status: 500 });
  }
}
