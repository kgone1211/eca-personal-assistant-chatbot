"use client";

import { useEffect, useState } from "react";
import TrendAnalysisPanel from "../components/TrendAnalysisPanel";

interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  clientName?: string;
  clientEmail?: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
  transcripts: Transcript[];
  insights: Insight[];
  _count: {
    milestones: number;
    transcripts: number;
    insights: number;
  };
}

interface Milestone {
  id: number;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  completedAt?: string;
}

interface Transcript {
  id: number;
  title: string;
  callDate: string;
  duration?: number;
  participants?: string;
  analysis?: TranscriptAnalysis;
}

interface TranscriptAnalysis {
  id: number;
  summary: string;
  keyPoints: string;
  painPoints: string;
  opportunities: string;
  actionItems: string;
  sentiment: string;
  confidence: number;
}

interface Insight {
  id: number;
  type: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
}

interface DashboardData {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalMilestones: number;
    completedMilestones: number;
    completionRate: number;
    totalTranscripts: number;
    totalInsights: number;
    criticalInsights: number;
  };
  projects: Project[];
  recentActivity: {
    transcripts: Transcript[];
    insights: Insight[];
  };
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTranscript, setShowNewTranscript] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const licenseKeyRef = { current: null as string | null };

  function licenseKey() {
    if (!licenseKeyRef.current) {
      const stored = localStorage.getItem("x_license_key");
      if (stored) {
        licenseKeyRef.current = stored;
      } else {
        // No license key, redirect to main experience page
        console.log("No license key found, redirecting to main page");
        window.location.href = "/experiences/main";
        return "";
      }
    }
    return licenseKeyRef.current!;
  }

  const headers = () => ({ "X-License-Key": licenseKey(), "Content-Type": "application/json" });

  async function fetchUserInfo() {
    try {
      const response = await fetch(`/api/whop-auth?license_key=${encodeURIComponent(licenseKey())}`, {
        headers: headers()
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserInfo(result.user);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  }

  async function fetchDashboard() {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard", { headers: headers() });
      if (!response.ok) throw new Error("Failed to fetch dashboard");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function createProject(formData: FormData) {
    try {
      const projectData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        clientName: formData.get("clientName") as string,
        clientEmail: formData.get("clientEmail") as string,
        milestones: []
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(projectData)
      });

      if (!response.ok) throw new Error("Failed to create project");
      
      setShowNewProject(false);
      await fetchDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  }

  async function uploadTranscript(formData: FormData) {
    try {
      const response = await fetch("/api/transcripts", {
        method: "POST",
        headers: { "X-License-Key": licenseKey() },
        body: formData
      });

      if (!response.ok) throw new Error("Failed to upload transcript");
      
      setShowNewTranscript(false);
      await fetchDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload transcript");
    }
  }

  useEffect(() => {
    fetchDashboard();
    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="wrap">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrap">
        <div className="error">{error}</div>
        <button className="btn" onClick={fetchDashboard}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="wrap">
      <header>
        <div className="logo-container">
          <img src="/logo.svg" alt="ECA Logo" className="logo" />
          <div>
            <h1>Client Dashboard</h1>
            <p className="user-welcome">
              Welcome back, {userInfo?.firstName || userInfo?.username || 'User'}!
            </p>
          </div>
        </div>
               <div>
                 <button className="btn btn-primary" onClick={() => setShowNewProject(true)}>
                   + New Project
                 </button>
                 <button className="btn" onClick={() => setShowNewTranscript(true)}>
                   + Upload Transcript
                 </button>
               </div>
      </header>

      {/* Overview Metrics */}
      <div className="metrics">
        <div className="metric">
          <div className="metric-value">{data.overview.totalProjects}</div>
          <div className="metric-label">Total Projects</div>
        </div>
        <div className="metric">
          <div className="metric-value">{data.overview.activeProjects}</div>
          <div className="metric-label">Active Projects</div>
        </div>
        <div className="metric">
          <div className="metric-value">{Math.round(data.overview.completionRate)}%</div>
          <div className="metric-label">Completion Rate</div>
        </div>
        <div className="metric">
          <div className="metric-value">{data.overview.totalTranscripts}</div>
          <div className="metric-label">Call Transcripts</div>
        </div>
        <div className="metric">
          <div className="metric-value">{data.overview.totalInsights}</div>
          <div className="metric-label">AI Insights</div>
        </div>
        <div className="metric">
          <div className="metric-value">{data.overview.criticalInsights}</div>
          <div className="metric-label">Critical Issues</div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Projects */}
        <div className="card">
          <h2>Projects</h2>
          <div className="projects-grid">
            {data.projects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <span className={`project-status status-${project.status}`}>
                    {project.status}
                  </span>
                </div>
                {project.clientName && (
                  <p style={{ color: "var(--muted)", fontSize: "14px", margin: "0 0 8px 0" }}>
                    Client: {project.clientName}
                  </p>
                )}
                <div className="project-metrics">
                  <div className="project-metric">
                    <div className="project-metric-value">{project._count.milestones}</div>
                    <div className="project-metric-label">Milestones</div>
                  </div>
                  <div className="project-metric">
                    <div className="project-metric-value">{project._count.transcripts}</div>
                    <div className="project-metric-label">Calls</div>
                  </div>
                  <div className="project-metric">
                    <div className="project-metric-value">{project._count.insights}</div>
                    <div className="project-metric-label">Insights</div>
                  </div>
                  <div className="project-metric">
                    <div className="project-metric-value">
                      {project.insights.filter(i => i.severity === "critical").length}
                    </div>
                    <div className="project-metric-label">Critical</div>
                  </div>
                </div>
                <button 
                  className="btn" 
                  onClick={() => setSelectedProject(project.id)}
                  style={{ width: "100%", marginTop: "8px" }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {data.recentActivity.transcripts.slice(0, 3).map(transcript => (
              <div key={transcript.id} className="activity-item">
                <div className="activity-icon" style={{ background: "var(--acc)" }}>
                  📞
                </div>
                <div className="activity-content">
                  <div className="activity-title">{transcript.title}</div>
                  <div className="activity-description">
                    {transcript.analysis?.summary || "Call transcript uploaded"}
                  </div>
                  <div className="activity-time">
                    {new Date(transcript.callDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {data.recentActivity.insights.slice(0, 2).map(insight => (
              <div key={insight.id} className="activity-item">
                <div className="activity-icon" style={{ 
                  background: insight.type === "bottleneck" ? "var(--danger)" : "var(--success)" 
                }}>
                  {insight.type === "bottleneck" ? "⚠️" : "💡"}
                </div>
                <div className="activity-content">
                  <div className="activity-title">{insight.title}</div>
                  <div className="activity-description">{insight.description}</div>
                  <div className="activity-time">
                    {new Date(insight.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Analysis Panel */}
      <div style={{ marginTop: "24px" }}>
        <TrendAnalysisPanel />
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="modal-close" onClick={() => setShowNewProject(false)}>
                ×
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createProject(new FormData(e.currentTarget)); }}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input className="form-input" name="name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" name="description" />
              </div>
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input className="form-input" name="clientName" />
              </div>
              <div className="form-group">
                <label className="form-label">Client Email</label>
                <input className="form-input" name="clientEmail" type="email" />
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button type="button" className="btn" onClick={() => setShowNewProject(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Transcript Modal */}
      {showNewTranscript && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Upload Success Team Call</h2>
              <button className="modal-close" onClick={() => setShowNewTranscript(false)}>
                ×
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); uploadTranscript(new FormData(e.currentTarget)); }}>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select className="form-select" name="project_id" required>
                  <option value="">Select a project</option>
                  {data.projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Call Title</label>
                <input className="form-input" name="title" required />
              </div>
              <div className="form-group">
                <label className="form-label">Call Date</label>
                <input className="form-input" name="call_date" type="date" />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input className="form-input" name="duration" type="number" />
              </div>
              <div className="form-group">
                <label className="form-label">Participants</label>
                <input className="form-input" name="participants" placeholder="e.g., John, Sarah, Mike" />
              </div>
              <div className="form-group">
                <label className="form-label">Transcript Content</label>
                <textarea 
                  className="form-textarea" 
                  name="content" 
                  required 
                  placeholder="Paste the full transcript here..."
                  style={{ minHeight: "200px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button type="button" className="btn" onClick={() => setShowNewTranscript(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload & Analyze
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
