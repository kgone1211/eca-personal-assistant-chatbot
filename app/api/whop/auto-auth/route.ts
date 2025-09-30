import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateLicenseKey } from "@/lib/whop";

export async function POST(req: NextRequest) {
  try {
    const { experienceId, companyId, whopUserData } = await req.json();
    
    if (!experienceId && !companyId) {
      return NextResponse.json({ 
        success: false, 
        error: "Experience ID or Company ID required" 
      }, { status: 400 });
    }

    // Create a unique identifier for this Whop context
    const whopContextId = experienceId || companyId;
    const whopId = `whop_${whopContextId}`;
    
    // Check if user already exists by Whop ID
    let user = await prisma.user.findUnique({
      where: { whopId }
    });

    if (user) {
      // Update existing user with latest data
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          whopUsername: whopUserData?.username || `user_${whopContextId}`,
          whopEmail: whopUserData?.email || `user@whop.com`,
          whopFirstName: whopUserData?.first_name,
          whopLastName: whopUserData?.last_name,
          whopProfilePic: whopUserData?.profile_picture,
        }
      });
    } else {
      // Create new user automatically
      const licenseKey = generateLicenseKey();
      user = await prisma.user.create({
        data: {
          licenseKey,
          whopId,
          whopUsername: whopUserData?.username || `user_${whopContextId}`,
          whopEmail: whopUserData?.email || `user@whop.com`,
          whopFirstName: whopUserData?.first_name,
          whopLastName: whopUserData?.last_name,
          whopProfilePic: whopUserData?.profile_picture,
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      licenseKey: user.licenseKey,
      user: {
        id: user.id,
        whopId: user.whopId,
        username: user.whopUsername,
        email: user.whopEmail,
        firstName: user.whopFirstName,
        lastName: user.whopLastName,
        profilePic: user.whopProfilePic,
        createdAt: user.createdAt,
      },
      message: "User automatically authenticated"
    });

  } catch (error) {
    console.error("Auto-auth error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to auto-authenticate user" 
    }, { status: 500 });
  }
}
