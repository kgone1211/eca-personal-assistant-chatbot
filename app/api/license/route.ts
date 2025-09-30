import { NextRequest, NextResponse } from "next/server";
import { generateLicenseKey, verifyLicense } from "@/lib/whop";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Generate a new license key
    const licenseKey = generateLicenseKey();
    
    // Create user with the new license key
    const user = await prisma.user.create({
      data: { licenseKey }
    });
    
    return NextResponse.json({ 
      success: true, 
      licenseKey,
      userId: user.id,
      message: "New user account created successfully"
    });
  } catch (error) {
    console.error("Error creating license key:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create license key" 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const licenseKey = url.searchParams.get("license_key");
    
    if (!licenseKey) {
      return NextResponse.json({ 
        success: false, 
        error: "License key required" 
      }, { status: 400 });
    }
    
    // Verify the license key
    const isValid = await verifyLicense(licenseKey);
    if (!isValid) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid license key" 
      }, { status: 401 });
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { licenseKey },
      include: {
        _count: {
          select: {
            trainingBlobs: true,
            projects: true,
            answers: true
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        licenseKey: user.licenseKey,
        email: user.email,
        createdAt: user.createdAt,
        lastTrainedAt: user.lastTrainedAt,
        stats: user._count
      }
    });
  } catch (error) {
    console.error("Error verifying license key:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to verify license key" 
    }, { status: 500 });
  }
}
