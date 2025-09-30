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
