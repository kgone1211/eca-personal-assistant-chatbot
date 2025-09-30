"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./onboarding.css";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [whopToken, setWhopToken] = useState("");
  const router = useRouter();

  const handleWhopAuth = async () => {
    if (!whopToken.trim()) {
      setError("Please enter your Whop token");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/whop-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whopToken: whopToken.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        // Store the license key
        localStorage.setItem("x_license_key", result.licenseKey);
        setLicenseKey(result.licenseKey);
        setUserInfo(result.user);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError(result.error || "Failed to authenticate with Whop");
      }
    } catch (err) {
      setError("Failed to authenticate with Whop. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (result.success) {
        // Store the license key
        localStorage.setItem("x_license_key", result.licenseKey);
        setLicenseKey(result.licenseKey);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError(result.error || "Failed to create account");
      }
    } catch (err) {
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (licenseKey) {
    return (
      <div className="wrap">
        <div className="onboarding-container">
          <div className="logo-container">
            <img src="/logo.svg" alt="ECA Logo" className="logo" />
            <h1>Welcome to EVA!</h1>
          </div>
          
          <div className="success-card">
            <h2>🎉 Account Created Successfully!</h2>
            <p>Your personal AI assistant is ready to be trained in your unique coaching voice.</p>
            
            {userInfo && (
              <div className="user-info">
                <h3>Welcome, {userInfo.firstName || userInfo.username}!</h3>
                <p>Your Whop account has been linked successfully.</p>
              </div>
            )}
            
            <div className="license-info">
              <h3>Your License Key:</h3>
              <div className="license-key">
                <code>{licenseKey}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(licenseKey)}
                  className="btn btn-small"
                >
                  Copy
                </button>
              </div>
              <p className="license-note">
                <strong>Save this key!</strong> You'll need it to access your account from other devices.
              </p>
            </div>
            
            <div className="redirecting">
              <p>Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="onboarding-container">
        <div className="logo-container">
          <img src="/logo.svg" alt="ECA Logo" className="logo" />
          <h1>EVA Personal Assistant</h1>
          <p>Your AI coaching assistant trained in your unique voice</p>
        </div>

        <div className="onboarding-card">
          <h2>Get Started</h2>
          <p className="onboarding-description">
            Create your personal AI assistant that learns your coaching style, 
            frameworks, and methodology from your training data and Otter.ai transcripts.
          </p>

          <div className="features-list">
            <div className="feature">
              <span className="feature-icon">🎤</span>
              <div>
                <h4>Voice Training</h4>
                <p>Train your AI using microphone recording and Otter.ai transcripts</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🤖</span>
              <div>
                <h4>Personalized Chat</h4>
                <p>Chat with an AI that speaks in your unique coaching voice</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <div>
                <h4>Trend Analysis</h4>
                <p>Get insights from your coaching patterns and client interactions</p>
              </div>
            </div>
          </div>

          {/* Whop Authentication */}
          <div className="whop-auth-section">
            <h3>🔗 Link Your Whop Account</h3>
            <p>Connect your Whop account to personalize your experience with your name and profile.</p>
            
            <div className="form-group">
              <label htmlFor="whopToken" className="form-label">Whop Access Token</label>
              <input
                id="whopToken"
                type="text"
                value={whopToken}
                onChange={(e) => setWhopToken(e.target.value)}
                placeholder="Enter your Whop access token"
                className="form-input"
                disabled={loading}
              />
              <small className="form-help">
                Get your access token from your Whop account settings
              </small>
            </div>

            <button
              onClick={handleWhopAuth}
              disabled={loading || !whopToken.trim()}
              className="btn btn-secondary btn-large"
              style={{ width: "100%", marginBottom: "1rem" }}
            >
              {loading ? "Linking Account..." : "Link Whop Account"}
            </button>

            <div className="oauth-section">
              <p>Or use Whop OAuth:</p>
              <a
                href={`https://whop.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_WHOP_CLIENT_ID}&redirect_uri=${encodeURIComponent('https://eca-personal-assistant-chatbot.vercel.app/api/whop/callback')}&response_type=code&scope=read:user`}
                className="btn btn-primary btn-large"
                style={{ width: "100%", marginBottom: "1rem", textDecoration: "none" }}
              >
                🔗 Connect with Whop
              </a>
            </div>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            onClick={handleGetStarted}
            disabled={loading}
            className="btn btn-primary btn-large"
            style={{ width: "100%" }}
          >
            {loading ? "Creating Your Account..." : "Create Anonymous Account"}
          </button>

          <div className="privacy-note">
            <p>
              <strong>Your data is private.</strong> Each user gets their own isolated account 
              with a unique license key. Your training data and conversations are completely private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
