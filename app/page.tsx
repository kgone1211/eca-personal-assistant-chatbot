"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we're in a Whop context (has experienceId or companyId)
    const urlParams = new URLSearchParams(window.location.search);
    const experienceId = urlParams.get("experienceId");
    const companyId = urlParams.get("companyId");
    
    if (experienceId || companyId) {
      // We're in Whop context, automatically create/get user and go to dashboard
      handleWhopUser(experienceId, companyId);
    } else {
      // Not in Whop context, check for existing license key
      const licenseKey = localStorage.getItem("x_license_key");
      
      if (licenseKey) {
        // Verify the license key is still valid
        fetch(`/api/license?license_key=${encodeURIComponent(licenseKey)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              router.push("/experiences/main");
            } else {
              localStorage.removeItem("x_license_key");
              router.push("/experiences/main"); // Go to front page anyway
            }
          })
          .catch(() => {
            localStorage.removeItem("x_license_key");
            router.push("/experiences/main"); // Go to front page anyway
          });
      } else {
        // No license key, go directly to front page
        router.push("/experiences/main");
      }
    }
  }, [router]);

  const handleWhopUser = async (experienceId: string | null, companyId: string | null) => {
    try {
      // Automatically create or get user based on Whop context
      const response = await fetch("/api/whop/auto-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          experienceId, 
          companyId,
          // In a real Whop integration, you'd get user data from Whop's context
          whopUserData: {
            id: `whop_${experienceId || companyId}`,
            username: `user_${experienceId || companyId}`,
            email: `user@whop.com`
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Store the license key and redirect to front page
        localStorage.setItem("x_license_key", result.licenseKey);
        router.push("/experiences/main");
      } else {
        // Fallback: go to front page anyway
        router.push("/experiences/main");
      }
    } catch (error) {
      console.error("Auto-auth error:", error);
      // Fallback: go to front page anyway
      router.push("/experiences/main");
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>ECA Personal Assistant</h2>
        <p style={{ margin: '0', color: '#cccccc' }}>Loading...</p>
      </div>
    </div>
  );
}
