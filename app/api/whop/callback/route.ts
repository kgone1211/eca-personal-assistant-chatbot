import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchWhopUser, generateLicenseKey } from "@/lib/whop";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    
    if (!code) {
      return NextResponse.json({ 
        success: false, 
        error: "Authorization code required" 
      }, { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.whop.com/api/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.WHOP_CLIENT_ID || '',
        client_secret: process.env.WHOP_CLIENT_SECRET || '',
        code: code,
        redirect_uri: process.env.WHOP_REDIRECT_URI || '',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user information from Whop
    const whopUser = await fetchWhopUser(accessToken);
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

    // Redirect to dashboard with license key
    const redirectUrl = new URL('/dashboard', process.env.APP_BASE_URL || 'https://eca-personal-assistant-chatbot.vercel.app');
    redirectUrl.searchParams.set('license_key', user.licenseKey);
    redirectUrl.searchParams.set('whop_auth', 'success');

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("Whop callback error:", error);
    
    // Redirect to onboarding with error
    const redirectUrl = new URL('/onboarding', process.env.APP_BASE_URL || 'https://eca-personal-assistant-chatbot.vercel.app');
    redirectUrl.searchParams.set('error', 'whop_auth_failed');
    
    return NextResponse.redirect(redirectUrl);
  }
}

export async function POST(req: NextRequest) {
  // Handle POST requests if needed
  return GET(req);
}
