"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function MainExperienceContent() {
  const searchParams = useSearchParams();
  const experienceId = searchParams.get("experienceId");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Main Experience Page loaded");
    setLoading(false);
  }, []);

  const handleStartTraining = async () => {
    try {
      // Check if user already has a license key
      const existingKey = localStorage.getItem("x_license_key");
      
      if (existingKey) {
        // User has a key, go directly to trainer
        window.location.href = "/trainer";
        return;
      }

      // User doesn't have a key, generate one
      const response = await fetch("/api/license", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.licenseKey) {
          // Store the license key and redirect to trainer
          localStorage.setItem("x_license_key", result.licenseKey);
          console.log("License key stored, redirecting to trainer");
          // Add a small delay to ensure localStorage is updated
          setTimeout(() => {
            window.location.href = "/trainer";
          }, 100);
        } else {
          console.error("Failed to generate license key");
          alert("Failed to start training. Please try again.");
        }
      } else {
        console.error("License generation failed:", response.status);
        alert("Failed to start training. Please try again.");
      }
    } catch (error) {
      console.error("Error starting training:", error);
      alert("Failed to start training. Please try again.");
    }
  };

  const handleStartChatting = async () => {
    try {
      // Check if user already has a license key
      const existingKey = localStorage.getItem("x_license_key");
      
      if (existingKey) {
        // User has a key, go directly to chat
        window.location.href = "/bot/chat";
        return;
      }

      // User doesn't have a key, generate one
      const response = await fetch("/api/license", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.licenseKey) {
          // Store the license key and redirect to chat
          localStorage.setItem("x_license_key", result.licenseKey);
          console.log("License key stored, redirecting to chat");
          // Add a small delay to ensure localStorage is updated
          setTimeout(() => {
            window.location.href = "/bot/chat";
          }, 100);
        } else {
          console.error("Failed to generate license key");
          alert("Failed to start chatting. Please try again.");
        }
      } else {
        console.error("License generation failed:", response.status);
        alert("Failed to start chatting. Please try again.");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chatting. Please try again.");
    }
  };

  const handleViewDashboard = async () => {
    try {
      // Check if user already has a license key
      const existingKey = localStorage.getItem("x_license_key");
      
      if (existingKey) {
        // User has a key, go directly to dashboard
        window.location.href = "/dashboard";
        return;
      }

      // User doesn't have a key, generate one
      const response = await fetch("/api/license", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.licenseKey) {
          // Store the license key and redirect to dashboard
          localStorage.setItem("x_license_key", result.licenseKey);
          console.log("License key stored, redirecting to dashboard");
          // Add a small delay to ensure localStorage is updated
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 100);
        } else {
          console.error("Failed to generate license key");
          alert("Failed to access dashboard. Please try again.");
        }
      } else {
        console.error("License generation failed:", response.status);
        alert("Failed to access dashboard. Please try again.");
      }
    } catch (error) {
      console.error("Error accessing dashboard:", error);
      alert("Failed to access dashboard. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '16px',
        color: '#666',
        backgroundColor: '#1a1a1a'
      }}>
        Loading ECA Assistant...
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '1px solid #333333'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 8px 0'
        }}>
          ECA Personal Assistant
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#cccccc',
          margin: '0'
        }}>
          Your AI coaching assistant powered by Elite Coaching Academy
        </p>
        {experienceId && (
          <p style={{
            fontSize: '14px',
            color: '#999999',
            margin: '8px 0 0 0'
          }}>
            Experience ID: {experienceId}
          </p>
        )}
      </div>

      {/* Welcome Message */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #444444',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#ffffff',
          margin: '0 0 12px 0'
        }}>
          🎉 Welcome to ECA!
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#cccccc',
          margin: '0',
          lineHeight: '1.5'
        }}>
          Your personal AI assistant is ready to learn your unique coaching voice and help you deliver exceptional client experiences.
        </p>
      </div>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* AI Trainer */}
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #333333',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}>
          <div style={{
            fontSize: '32px',
            marginBottom: '16px'
          }}>
            🎤
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#ffffff',
            margin: '0 0 12px 0'
          }}>
            AI Trainer
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#cccccc',
            margin: '0 0 20px 0',
            lineHeight: '1.5'
          }}>
            Train your AI assistant with your unique coaching voice, frameworks, and methodology.
          </p>
          <button 
            onClick={handleStartTraining}
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#3b82f6'}
          >
            Start Training
          </button>
        </div>

        {/* AI Chat */}
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #333333',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}>
          <div style={{
            fontSize: '32px',
            marginBottom: '16px'
          }}>
            💬
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#ffffff',
            margin: '0 0 12px 0'
          }}>
            AI Chat
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#cccccc',
            margin: '0 0 20px 0',
            lineHeight: '1.5'
          }}>
            Chat with your personalized AI assistant that speaks in your coaching voice.
          </p>
          <button 
            onClick={handleStartChatting}
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#3b82f6'}
          >
            Start Chatting
          </button>
        </div>

        {/* Dashboard */}
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #333333',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}>
          <div style={{
            fontSize: '32px',
            marginBottom: '16px'
          }}>
            📊
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#ffffff',
            margin: '0 0 12px 0'
          }}>
            Dashboard
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#cccccc',
            margin: '0 0 20px 0',
            lineHeight: '1.5'
          }}>
            View your projects, analytics, and track your AI training progress.
          </p>
          <button 
            onClick={handleViewDashboard}
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#3b82f6'}
          >
            View Dashboard
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        paddingTop: '20px',
        borderTop: '1px solid #333333',
        color: '#999999',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0' }}>
          Powered by Elite Coaching Academy • Integrated with Whop
        </p>
      </div>
    </div>
  );
}

export default function MainExperiencePage() {
  return (
    <Suspense fallback={
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
    }>
      <MainExperienceContent />
    </Suspense>
  );
}
