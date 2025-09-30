"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has a license key stored
    const licenseKey = localStorage.getItem("x_license_key");
    
    if (licenseKey) {
      // Verify the license key is still valid
      fetch(`/api/license?license_key=${encodeURIComponent(licenseKey)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Valid license key, go to dashboard
            router.push("/dashboard");
          } else {
            // Invalid license key, clear it and go to onboarding
            localStorage.removeItem("x_license_key");
            router.push("/onboarding");
          }
        })
        .catch(() => {
          // Error verifying, go to onboarding
          localStorage.removeItem("x_license_key");
          router.push("/onboarding");
        });
    } else {
      // No license key, go to onboarding
      router.push("/onboarding");
    }
  }, [router]);

  return (
    <div className="wrap">
      <div className="loading">Loading...</div>
    </div>
  );
}
