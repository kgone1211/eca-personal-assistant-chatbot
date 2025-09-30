"use client";

import { useState, useEffect } from "react";

interface TrendingTopic {
  topic: string;
  frequency: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  trendDirection: 'up' | 'down' | 'stable';
  confidence: number;
}

interface CoachingPattern {
  pattern: string;
  effectiveness: number;
  frequency: number;
  description: string;
}

interface ClientInsight {
  insight: string;
  category: 'pain_point' | 'opportunity' | 'success_pattern' | 'risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

interface Recommendation {
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  impact: string;
  action: string;
}

interface TrendAnalysis {
  trendingTopics: TrendingTopic[];
  coachingPatterns: CoachingPattern[];
  clientInsights: ClientInsight[];
  recommendations: Recommendation[];
}

interface TrendAnalysisData {
  trends: TrendAnalysis;
  metadata: {
    transcriptsAnalyzed: number;
    trainingDataPoints: number;
    insightsProcessed: number;
    analysisDate: string;
  };
}

export default function TrendAnalysisPanel() {
  const [data, setData] = useState<TrendAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'topics' | 'patterns' | 'insights' | 'recommendations'>('topics');

  const licenseKeyRef = { current: null as string | null };

  function licenseKey() {
    if (!licenseKeyRef.current) {
      const stored = localStorage.getItem("x_license_key");
      if (stored) {
        licenseKeyRef.current = stored;
      } else {
        // No license key, redirect to main experience page
        window.location.href = "/experiences/main";
        return "";
      }
    }
    return licenseKeyRef.current!;
  }

  const headers = () => ({ "X-License-Key": licenseKey(), "Content-Type": "application/json" });

  async function fetchTrendAnalysis() {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching trend analysis with license key:", licenseKey());
      
      const response = await fetch("/api/trends", { headers: headers() });
      console.log("Trend analysis response:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Trend analysis error:", errorText);
        throw new Error(`Failed to fetch trend analysis: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Trend analysis result:", result);
      setData(result);
    } catch (err) {
      console.error("Trend analysis fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrendAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <h2>📈 Trend Analysis</h2>
        <div className="loading">Analyzing trends...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>📈 Trend Analysis</h2>
        <div className="error">{error}</div>
        <button className="btn" onClick={fetchTrendAnalysis}>Retry Analysis</button>
      </div>
    );
  }

  if (!data) return null;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'var(--success)';
      case 'negative': return 'var(--danger)';
      default: return 'var(--muted)';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'var(--danger)';
      case 'high': return 'var(--warning)';
      case 'medium': return 'var(--acc)';
      default: return 'var(--muted)';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      default: return 'var(--muted)';
    }
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2>📈 Trend Analysis</h2>
        <div style={{ fontSize: "12px", color: "var(--muted)" }}>
          Last updated: {new Date(data.metadata.analysisDate).toLocaleString()}
        </div>
      </div>

      {/* Analysis Summary */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
        gap: "12px", 
        marginBottom: "20px",
        padding: "12px",
        background: "var(--card)",
        borderRadius: "8px",
        border: "1px solid var(--border)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "var(--acc)" }}>
            {data.metadata.transcriptsAnalyzed}
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)" }}>Transcripts</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "var(--success)" }}>
            {data.metadata.trainingDataPoints}
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)" }}>Training Data</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "var(--warning)" }}>
            {data.metadata.insightsProcessed}
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)" }}>Insights</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: "flex", 
        gap: "8px", 
        marginBottom: "20px",
        borderBottom: "1px solid var(--border)"
      }}>
        {[
          { key: 'topics', label: 'Trending Topics', icon: '🔥' },
          { key: 'patterns', label: 'Coaching Patterns', icon: '🎯' },
          { key: 'insights', label: 'Client Insights', icon: '💡' },
          { key: 'recommendations', label: 'Recommendations', icon: '⚡' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "8px 16px",
              border: "none",
              background: activeTab === tab.key ? "var(--acc)" : "transparent",
              color: activeTab === tab.key ? "white" : "var(--muted)",
              borderRadius: "6px 6px 0 0",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: "300px" }}>
        {activeTab === 'topics' && (
          <div>
            <h3 style={{ marginBottom: "16px", color: "var(--ink)" }}>🔥 Trending Topics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.trends.trendingTopics.map((topic, index) => (
                <div key={index} style={{
                  padding: "16px",
                  background: "var(--card)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, color: "var(--ink)" }}>{topic.topic}</h4>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: getSentimentColor(topic.sentiment),
                        color: "white"
                      }}>
                        {topic.sentiment}
                      </span>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: topic.trendDirection === 'up' ? 'var(--success)' : 
                                   topic.trendDirection === 'down' ? 'var(--danger)' : 'var(--muted)',
                        color: "white"
                      }}>
                        {topic.trendDirection === 'up' ? '↗️' : topic.trendDirection === 'down' ? '↘️' : '→'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "14px", color: "var(--muted)" }}>
                      Frequency: {topic.frequency}% | Confidence: {Math.round(topic.confidence * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div>
            <h3 style={{ marginBottom: "16px", color: "var(--ink)" }}>🎯 Coaching Patterns</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.trends.coachingPatterns.map((pattern, index) => (
                <div key={index} style={{
                  padding: "16px",
                  background: "var(--card)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, color: "var(--ink)" }}>{pattern.pattern}</h4>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--success)" }}>
                      {Math.round(pattern.effectiveness * 100)}% effective
                    </div>
                  </div>
                  <p style={{ margin: "8px 0", color: "var(--muted)", fontSize: "14px" }}>
                    {pattern.description}
                  </p>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                    Used {pattern.frequency} times
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            <h3 style={{ marginBottom: "16px", color: "var(--ink)" }}>💡 Client Insights</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.trends.clientInsights.map((insight, index) => (
                <div key={index} style={{
                  padding: "16px",
                  background: "var(--card)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, color: "var(--ink)" }}>{insight.insight}</h4>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: getSeverityColor(insight.severity),
                        color: "white"
                      }}>
                        {insight.severity}
                      </span>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: "var(--acc)",
                        color: "white"
                      }}>
                        {insight.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                    Confidence: {Math.round(insight.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            <h3 style={{ marginBottom: "16px", color: "var(--ink)" }}>⚡ Recommendations</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.trends.recommendations.map((rec, index) => (
                <div key={index} style={{
                  padding: "16px",
                  background: "var(--card)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, color: "var(--ink)" }}>{rec.recommendation}</h4>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      background: getPriorityColor(rec.priority),
                      color: "white"
                    }}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <p style={{ margin: "8px 0", color: "var(--muted)", fontSize: "14px" }}>
                    <strong>Impact:</strong> {rec.impact}
                  </p>
                  <p style={{ margin: "8px 0", color: "var(--ink)", fontSize: "14px" }}>
                    <strong>Action:</strong> {rec.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button 
          className="btn btn-primary" 
          onClick={fetchTrendAnalysis}
          style={{ fontSize: "14px" }}
        >
          🔄 Refresh Analysis
        </button>
      </div>
    </div>
  );
}
