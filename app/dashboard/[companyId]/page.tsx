"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function WhopDashboardPage() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<any>(null);

  useEffect(() => {
    // Fetch company data from Whop API
    const fetchCompanyData = async () => {
      try {
        // This would be a real Whop API call
        console.log("Company ID:", companyId);
        setCompanyData({ id: companyId, name: "Sample Company" });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching company data:", error);
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="wrap">
        <div className="loading">Loading company dashboard...</div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="whop-dashboard">
        <div className="logo-container">
          <img src="/logo.svg" alt="ECA Logo" className="logo" />
          <h1>Company Dashboard</h1>
          <p>Company ID: {companyId}</p>
        </div>

        <div className="dashboard-content">
          <h2>Welcome to EVA for Companies</h2>
          <p>This is the company-specific dashboard for Whop integration.</p>
          
          <div className="company-stats">
            <div className="stat-card">
              <h3>Active Users</h3>
              <p>0</p>
            </div>
            <div className="stat-card">
              <h3>AI Sessions</h3>
              <p>0</p>
            </div>
            <div className="stat-card">
              <h3>Training Data</h3>
              <p>0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
