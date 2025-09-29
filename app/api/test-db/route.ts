import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    
    // Create a test user if none exists
    const testUser = await prisma.user.upsert({
      where: { licenseKey: "dev-key-123" },
      update: {},
      create: { licenseKey: "dev-key-123" }
    });

    return NextResponse.json({ 
      success: true, 
      userCount, 
      testUser: { id: testUser.id, licenseKey: testUser.licenseKey },
      message: "Database connection successful"
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
