"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function WhopExperiencePage() {
  const searchParams = useSearchParams();
  const experienceId = searchParams.get("experienceId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This is how Whop apps work - they're embedded in Whop's platform
    // The experienceId tells us which Whop experience this is for
    console.log("Whop Experience ID:", experienceId);
    setLoading(false);
  }, [experienceId]);

  if (loading) {
    return (
      <div className="wrap">
        <div className="loading">Loading Whop experience...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrap">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="whop-app-container">
        <div className="logo-container">
          <img src="/logo.svg" alt="ECA Logo" className="logo" />
          <h1>EVA Personal Assistant</h1>
          <p>Powered by Whop Integration</p>
        </div>

        <div className="whop-info">
          <h2>🎉 Whop Integration Active!</h2>
          <p>Experience ID: {experienceId}</p>
          <p>This app is now properly integrated with Whop's platform.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>🎤 AI Trainer</h3>
            <p>Train your AI assistant with your unique coaching voice</p>
            <a href="/trainer" className="btn btn-primary">Start Training</a>
          </div>
          
          <div className="feature-card">
            <h3>💬 AI Chat</h3>
            <p>Chat with your personalized AI assistant</p>
            <a href="/bot/chat" className="btn btn-primary">Start Chatting</a>
          </div>
          
          <div className="feature-card">
            <h3>📊 Dashboard</h3>
            <p>View your projects and analytics</p>
            <a href="/dashboard" className="btn btn-primary">View Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}
