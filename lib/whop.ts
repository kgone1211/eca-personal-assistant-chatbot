export async function verifyLicense(licenseKey?: string): Promise<boolean> {
  if (!licenseKey) return false;
  
  // For development, allow any non-empty key
  if (process.env.WHOP_DEV_ALLOW_ANY === "1") {
    return licenseKey.length > 0;
  }
  
  try {
    // Real Whop API verification
    const response = await fetch(`https://api.whop.com/api/v2/licenses/${licenseKey}/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Whop API error:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    return data.valid === true && data.status === 'active';
  } catch (error) {
    console.error('Error verifying Whop license:', error);
    return false;
  }
}

export async function getWhopUserInfo(licenseKey: string) {
  try {
    const response = await fetch(`https://api.whop.com/api/v2/licenses/${licenseKey}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Whop API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      userId: data.user_id,
      email: data.user?.email,
      planId: data.plan_id,
      status: data.status,
      expiresAt: data.expires_at,
    };
  } catch (error) {
    console.error('Error fetching Whop user info:', error);
    return null;
  }
}
