"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function WhopExperiencePage() {
  const searchParams = useSearchParams();
  const experienceId = searchParams.get("experienceId");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Whop Experience ID:", experienceId);
    setLoading(false);
  }, [experienceId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading EVA Assistant...
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 8px 0'
        }}>
          EVA Personal Assistant
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: '0'
        }}>
          Your AI coaching assistant powered by Elite Coaching Academy
        </p>
        {experienceId && (
          <p style={{
            fontSize: '14px',
            color: '#9ca3af',
            margin: '8px 0 0 0'
          }}>
            Experience ID: {experienceId}
          </p>
        )}
      </div>

      {/* Welcome Message */}
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#0c4a6e',
          margin: '0 0 12px 0'
        }}>
          🎉 Welcome to EVA!
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#0c4a6e',
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
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
            color: '#1f2937',
            margin: '0 0 12px 0'
          }}>
            AI Trainer
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 20px 0',
            lineHeight: '1.5'
          }}>
            Train your AI assistant with your unique coaching voice, frameworks, and methodology.
          </p>
          <a 
            href="/trainer" 
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Start Training
          </a>
        </div>

        {/* AI Chat */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
            color: '#1f2937',
            margin: '0 0 12px 0'
          }}>
            AI Chat
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 20px 0',
            lineHeight: '1.5'
          }}>
            Chat with your personalized AI assistant that speaks in your coaching voice.
          </p>
          <a 
            href="/bot/chat" 
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Start Chatting
          </a>
        </div>

        {/* Dashboard */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
            color: '#1f2937',
            margin: '0 0 12px 0'
          }}>
            Dashboard
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 20px 0',
            lineHeight: '1.5'
          }}>
            View your projects, analytics, and track your AI training progress.
          </p>
          <a 
            href="/dashboard" 
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            View Dashboard
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        color: '#9ca3af',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0' }}>
          Powered by Elite Coaching Academy • Integrated with Whop
        </p>
      </div>
    </div>
  );
}
