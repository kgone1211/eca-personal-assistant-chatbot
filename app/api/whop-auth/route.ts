import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchWhopUser, validateWhopToken, generateLicenseKey } from "@/lib/whop";

export async function POST(req: NextRequest) {
  try {
    const { whopToken } = await req.json();
    
    if (!whopToken) {
      return NextResponse.json({ 
        success: false, 
        error: "Whop token required" 
      }, { status: 400 });
    }

    // Validate the Whop token
    const isValidToken = await validateWhopToken(whopToken);
    if (!isValidToken) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid Whop token" 
      }, { status: 401 });
    }

    // Fetch user information from Whop
    const whopUser = await fetchWhopUser(whopToken);
    if (!whopUser) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to fetch Whop user data" 
      }, { status: 500 });
    }

    // Check if user already exists by Whop ID
    let user = await prisma.user.findUnique({
      where: { whopId: whopUser.id }
    });

    if (user) {
      // Update existing user with latest Whop data
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          whopUsername: whopUser.username,
          whopEmail: whopUser.email,
          whopFirstName: whopUser.first_name,
          whopLastName: whopUser.last_name,
          whopProfilePic: whopUser.profile_picture,
        }
      });
    } else {
      // Create new user with Whop data
      const licenseKey = generateLicenseKey();
      user = await prisma.user.create({
        data: {
          licenseKey,
          whopId: whopUser.id,
          whopUsername: whopUser.username,
          whopEmail: whopUser.email,
          whopFirstName: whopUser.first_name,
          whopLastName: whopUser.last_name,
          whopProfilePic: whopUser.profile_picture,
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
      message: "Whop account linked successfully"
    });

  } catch (error) {
    console.error("Error linking Whop account:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to link Whop account" 
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

    const user = await prisma.user.findUnique({
      where: { licenseKey },
      select: {
        id: true,
        licenseKey: true,
        whopId: true,
        whopUsername: true,
        whopEmail: true,
        whopFirstName: true,
        whopLastName: true,
        whopProfilePic: true,
        createdAt: true,
        lastTrainedAt: true,
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
        whopId: user.whopId,
        username: user.whopUsername,
        email: user.whopEmail,
        firstName: user.whopFirstName,
        lastName: user.whopLastName,
        profilePic: user.whopProfilePic,
        createdAt: user.createdAt,
        lastTrainedAt: user.lastTrainedAt,
      }
    });

  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch user info" 
    }, { status: 500 });
  }
}
