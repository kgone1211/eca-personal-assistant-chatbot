// License key validation and generation
const VALID_LICENSE_PREFIX = "eva-";
const LICENSE_KEY_LENGTH = 12;

export function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = VALID_LICENSE_PREFIX;
  for (let i = 0; i < LICENSE_KEY_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isValidLicenseFormat(licenseKey?: string): boolean {
  if (!licenseKey) return false;
  return licenseKey.startsWith(VALID_LICENSE_PREFIX) && 
         licenseKey.length === VALID_LICENSE_PREFIX.length + LICENSE_KEY_LENGTH;
}

export async function verifyLicense(licenseKey?: string): Promise<boolean> {
  if (!licenseKey) return false;
  
  // Check if it's a valid format
  if (!isValidLicenseFormat(licenseKey)) {
    return false;
  }
  
  // For development, accept any valid format
  if (process.env.WHOP_DEV_ALLOW_ANY === "1") {
    return true;
  }
  
  // In production, you could add additional validation here
  // For example, check against a database of valid keys
  return true;
}

export interface WhopUser {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
}

export async function fetchWhopUser(whopToken: string): Promise<WhopUser | null> {
  try {
    const response = await fetch('https://api.whop.com/api/v2/me', {
      headers: {
        'Authorization': `Bearer ${whopToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Whop API error:', response.status, response.statusText);
      return null;
    }

    const userData = await response.json();
    
    return {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      profile_picture: userData.profile_picture,
    };
  } catch (error) {
    console.error('Error fetching Whop user:', error);
    return null;
  }
}

export async function validateWhopToken(whopToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.whop.com/api/v2/me', {
      headers: {
        'Authorization': `Bearer ${whopToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error validating Whop token:', error);
    return false;
  }
}
