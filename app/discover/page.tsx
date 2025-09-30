"use client";

export default function WhopDiscoverPage() {
  return (
    <div className="wrap">
      <div className="whop-discover">
        <div className="logo-container">
          <img src="/logo.svg" alt="ECA Logo" className="logo" />
          <h1>Discover EVA</h1>
          <p>Find and explore AI coaching experiences</p>
        </div>

        <div className="discover-content">
          <h2>Available Experiences</h2>
          <p>Browse and discover AI coaching experiences powered by EVA.</p>
          
          <div className="experiences-grid">
            <div className="experience-card">
              <h3>Personal Coaching AI</h3>
              <p>Your personal AI assistant trained in your coaching voice</p>
              <a href="/experiences/personal-coaching" className="btn btn-primary">
                Try Experience
              </a>
            </div>
            
            <div className="experience-card">
              <h3>Team Training AI</h3>
              <p>AI assistant for team coaching and development</p>
              <a href="/experiences/team-training" className="btn btn-primary">
                Try Experience
              </a>
            </div>
            
            <div className="experience-card">
              <h3>Client Consultation AI</h3>
              <p>AI assistant for client consultations and follow-ups</p>
              <a href="/experiences/client-consultation" className="btn btn-primary">
                Try Experience
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
