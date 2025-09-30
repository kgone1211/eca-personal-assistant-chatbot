"use client";

import { useEffect, useRef, useState } from "react";

const MIN_LEN = 300;
const STRONG_TARGET = 24;

type StatusMap = "q-ok"|"q-short"|"q-empty";

interface TrainingSession {
  id: number;
  version: number;
  createdAt: string;
  questionCount: number;
  preview: string;
  totalCharacters: number;
}

interface OtterUpload {
  id: number;
  createdAt: string;
  characterCount: number;
  preview: string;
  voiceVersion: number;
}

export default function TrainerClient(){
  const [questions, setQuestions] = useState<string[]>([]);
  const [statusText, setStatusText] = useState("Loading…");
  const [progress, setProgress] = useState("0 / 30");
  const [lastTrained, setLastTrained] = useState<string>("–");
  const [q, setQ] = useState(1);
  const [answer, setAnswer] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const [snips, setSnips] = useState<string[]>([]);
  const [classes, setClasses] = useState<Record<number, StatusMap>>({});
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [otterUploads, setOtterUploads] = useState<OtterUpload[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const licenseKeyRef = useRef<string | null>(null);

  function licenseKey(){
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

  const hJSON = ()=> ({ "X-License-Key": licenseKey(), "Content-Type":"application/json" });
  const hForm = ()=> ({ "X-License-Key": licenseKey() });

  async function fetchQuestions(){
    const r = await fetch("/api/trainer/questions", { headers: hJSON() });
    const j = await r.json();
    setQuestions(j.questions || []);
  }

  async function fetchTrainingHistory(){
    try {
      const r = await fetch("/api/trainer/history", { headers: hJSON() });
      const j = await r.json();
      setTrainingSessions(j.trainingSessions || []);
      setOtterUploads(j.otterUploads || []);
    } catch (error) {
      console.error("Failed to fetch training history:", error);
    }
  }

  async function refreshStatus(localAns?: Record<number,string>){
    const r = await fetch("/api/trainer/status", { headers: hJSON() });
    const j = await r.json();
    const map: Record<number, StatusMap> = {};
    const cache = localAns || {};
    for (let i=1;i<=30;i++){
      // Use local answer if provided, otherwise use current answer for current question, otherwise empty
      const txt = cache[i] || (i===q ? answer : "") || "";
      let cls: StatusMap = "q-empty";
      if (txt.trim().length >= MIN_LEN) cls = "q-ok";
      else if (txt.trim().length > 0) cls = "q-short";
      map[i] = cls;
    }
    const okCount = Object.values(map).filter(x=> x==="q-ok").length;
    const anyCount = Object.values(map).filter(x=> x!=="q-empty").length;
    setProgress(`${okCount} solid / 30  (${anyCount} total started)`);
    setLastTrained(j.last_trained_at ? new Date(j.last_trained_at).toLocaleString() : "–");
    setStatusText(okCount >= STRONG_TARGET ? "Ready to commit" : `Add ${STRONG_TARGET - okCount} more solid answers to hit target`);
    setClasses(map);
  }

  async function loadQ(i: number){
    setQ(i);
    setSavedAt("");
    const r = await fetch(`/api/trainer/answer/${i}`, { headers: hJSON() });
    const j = await r.json();
    setAnswer(j.answer || "");
    paintGuard(j.answer || "");
    loadSnips(i);
  }

  function paintGuard(txt: string){
    const g = document.getElementById("guard");
    if (!g) return;
    const n = txt.trim().length;
    if (!n) g.textContent = `Empty. Aim for ≥ ${MIN_LEN} characters with detailed stories, coaching frameworks, and your unique voice.`;
    else if (n < MIN_LEN) g.textContent = `Short by ${MIN_LEN - n} chars. Add detailed client examples, protocol specifics, or your coaching philosophy.`;
    else g.textContent = "Looks solid.";
  }

  async function save(){
    const r = await fetch(`/api/trainer/answer/${q}`, { method:"POST", headers: hJSON(), body: JSON.stringify({ answer }) });
    if (r.ok) {
      setSavedAt("Saved " + new Date().toLocaleTimeString());
      paintGuard(answer);
      // Update progress immediately with current answer
      await refreshStatus({ [q]: answer });
      // Also refresh from server to ensure consistency
      setTimeout(() => refreshStatus(), 100);
    } else setSavedAt("Save failed");
  }

  async function commitNow(){
    await save();
    const okCount = Object.values(classes).filter(v=> v==="q-ok").length;
    if (okCount < STRONG_TARGET) {
      if (!confirm(`You have ${okCount}/30 solid answers. Recommended ≥ ${STRONG_TARGET}. Commit anyway?`)) return;
    }
    const r = await fetch("/api/trainer/commit", { method:"POST", headers: hJSON() });
    if (r.ok) {
      const j = await r.json();
      setStatusText(`Committed. Voice version ${j.voice_version || "updated"}`);
      await refreshStatus();
      await fetchTrainingHistory(); // Refresh training history to show new version
      alert("Committed. Your bot will now use the latest voice version.");
    } else alert("Commit failed");
  }

  async function loadSnips(i:number){
    // optional: use /api/trainer/snippets route if you add it later
    setSnips([]); // placeholder; you can extend with a snippets endpoint like in the Python version
  }

  // mic to text
  function setupMic(){
    const btn = document.getElementById("micBtn") as HTMLButtonElement;
    const status = document.getElementById("micStatus")!;
    if (!btn) {
      console.error("Microphone button not found");
      return;
    }
    let mediaRecorder: MediaRecorder | null = null;
    let chunks: BlobPart[] = [];

    async function start(){
      try {
        console.log("Starting microphone recording...");
        status.textContent = "Requesting microphone access...";
        const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
        console.log("Microphone access granted");
        
        // Try to use a more compatible audio format
        const options = { mimeType: 'audio/webm;codecs=opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.warn("WebM not supported, falling back to default");
        }
        
        mediaRecorder = new MediaRecorder(stream, options);
        chunks = [];
        mediaRecorder.ondataavailable = e => { 
          if (e.data.size>0) {
            chunks.push(e.data);
            console.log("Audio data received:", e.data.size, "bytes");
          }
        };
        mediaRecorder.onstop = async () => {
          console.log("Recording stopped, processing audio...");
          const blob = new Blob(chunks, { type: "audio/webm;codecs=opus" });
          console.log("Audio blob created:", blob.size, "bytes, type:", blob.type);
          
          // Check if we have any audio data
          if (blob.size === 0) {
            status.textContent = "No audio recorded - try again";
            setTimeout(() => status.textContent = "", 3000);
            return;
          }
          
          const fd = new FormData();
          fd.append("file", blob, "recording.webm");
          status.textContent = "Transcribing…";
          
          try {
            const r = await fetch("/api/trainer/whisper", { method:"POST", headers: hForm(), body: fd });
            const j = await r.json();
            
            if (r.ok && j.text) {
              const transcribedText = j.text.trim();
              if (transcribedText.length > 0) {
                const merged = (answer ? answer + " " : "") + transcribedText;
                setAnswer(merged);
                paintGuard(merged);
                await save();
                status.textContent = "✓ Transcribed and saved";
                setTimeout(() => status.textContent = "", 2000);
              } else {
                status.textContent = "No speech detected - try speaking louder";
                setTimeout(() => status.textContent = "", 3000);
              }
            } else {
              console.error("Transcription failed:", r.status, r.statusText, j);
              // Use the error message from the API if available
              const errorText = j.text || "[Transcription failed - please type your answer manually]";
              const merged = (answer ? answer + " " : "") + errorText;
              setAnswer(merged);
              paintGuard(merged);
              await save();
              status.textContent = "Transcription failed - please type manually";
              setTimeout(() => status.textContent = "", 5000);
            }
          } catch (error) {
            console.error("Transcription error:", error);
            const errorText = "[Transcription error - please use manual input]";
            const merged = (answer ? answer + " " : "") + errorText;
            setAnswer(merged);
            paintGuard(merged);
            await save();
            status.textContent = "Transcription error - use manual input";
            setTimeout(() => status.textContent = "", 3000);
          }
        };
        mediaRecorder.start();
        status.textContent = "Recording… release to stop";
        console.log("Recording started");
      } catch (error) { 
        console.error("Microphone error:", error);
        status.textContent = "Mic permission denied or error occurred";
      }
    }
    function stop(){ 
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        console.log("Stopping recording...");
        mediaRecorder.stop();
      }
    }
    
    // Add event listeners with better error handling
    btn.onmousedown = start; 
    btn.onmouseup = stop; 
    btn.onmouseleave = stop;
    btn.ontouchstart = e=>{ e.preventDefault(); start(); }; 
    btn.ontouchend = e=>{ e.preventDefault(); stop(); };
    
    console.log("Microphone setup complete");
  }

  async function prefillFile(f: File){
    const fd = new FormData();
    fd.append("file", f, f.name);
    const r = await fetch("/api/trainer/prefill", { method:"POST", headers: hForm(), body: fd });
    if (r.ok) {
      const j = await r.json();
      alert(`Pre-filled ${j.filled} answers from file. Opening Q1 to review.`);
      await loadQ(1); await refreshStatus();
    } else alert("Pre-fill failed");
  }
  async function prefillLatest(){
    const r = await fetch("/api/trainer/prefill?use_latest=true", { method:"POST", headers: hForm() });
    if (r.ok) {
      const j = await r.json();
      alert(`Pre-filled ${j.filled} answers from latest upload. Opening Q1 to review.`);
      await loadQ(1); await refreshStatus();
    } else alert("No latest transcript found or pre-fill failed.");
  }

  useEffect(()=>{ (async ()=>{
    await fetchQuestions();
    await refreshStatus();
    await loadQ(1);
    await fetchTrainingHistory();
    setupMic();
  })(); },[]);

  const ok = (classes[q] || "q-empty");

  return (
    <div className="wrap">
      <header>
        <div className="logo-container">
          <img src="/logo.svg" alt="ECA Logo" className="logo" />
          <h2>ECA Personal Assistant</h2>
        </div>
        <div><button className="btn" onClick={commitNow} title="Lock in answers for this week">Commit</button></div>
      </header>

      <div className="card meta">
        <div><b>Status:</b> {statusText}</div>
        <div><b>Progress:</b> {progress}</div>
        <div><b>Last trained:</b> {lastTrained}</div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="toolbar">
            <button className="btn" id="micBtn" style={{ userSelect: "none" }}>🎤 Hold to record</button>
            <span id="micStatus" className="small"></span>


            <label className="btn" htmlFor="prefillFile">Pre-fill from file</label>
            <input id="prefillFile" type="file" accept=".txt,.docx" onChange={(e)=> e.target.files && e.target.files[0] && prefillFile(e.target.files[0])} />

            <button className="btn" onClick={prefillLatest} title="Use your most recent Otter upload">Pre-fill from latest upload</button>
          </div>

          <div className="qnav">
            <button className="btn" onClick={()=> loadQ(Math.max(1,q-1))}>Prev</button>
            <select className={ok} value={q} onChange={(e)=> loadQ(parseInt(e.target.value))}>
              {Array.from({ length: 30 }, (_,i)=> i+1).map(i=> (
                <option key={i} value={i} className={classes[i] || "q-empty"}>Q{i}</option>
              ))}
            </select>
            <button className="btn" onClick={()=> loadQ(Math.min(30,q+1))}>Next</button>
          </div>

          <div id="qText">{questions[q-1] || "…"}</div>
          <textarea value={answer} onChange={(e)=> setAnswer(e.target.value)} placeholder="Answer in your natural coaching tone…"/>
          <div className="actions">
            <button className="btn" onClick={save}>Save</button>
            <span className="small">{savedAt}</span>
          </div>
          <div id="guard" className="small" style={{ marginTop: "16px" }}></div>
        </div>

        <aside className="side">
          <h4>Examples / ideas</h4>
          <div className="snips">
            {snips.length ? snips.map((s,i)=>(
              <div key={i} className="snip" onClick={async ()=>{
                const merged = (answer ? answer + " " : "") + s;
                setAnswer(merged); await save();
              }}>{s}</div>
            )) : <em>Upload an Otter transcript to enable ideas.</em>}
          </div>
        </aside>
      </div>

      {/* Training History Section */}
      <div className="card" style={{ marginTop: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0 }}>Training History</h3>
          <button 
            className="btn" 
            onClick={() => setShowHistory(!showHistory)}
            style={{ fontSize: "12px", padding: "6px 12px" }}
          >
            {showHistory ? "Hide" : "Show"} History ({trainingSessions.length} sessions)
          </button>
        </div>

        {showHistory && (
          <div>
            {trainingSessions.length === 0 ? (
              <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
                No training sessions yet. Complete and commit your first training to see it here.
              </p>
            ) : (
              <>
                <h4 style={{ marginTop: "20px", marginBottom: "12px" }}>Q&A Training Sessions</h4>
                <div style={{ display: "grid", gap: "12px" }}>
                  {trainingSessions.map((session, index) => (
                    <div 
                      key={session.id} 
                      className="card"
                      style={{ 
                        backgroundColor: index === 0 ? "var(--success-light)" : "var(--bg)",
                        border: index === 0 ? "2px solid var(--success)" : "1px solid var(--border)",
                        padding: "16px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                        <div>
                          <h4 style={{ margin: "0 0 4px 0", color: "var(--text)" }}>
                            Voice Version {session.version}
                            {index === 0 && <span style={{ marginLeft: "8px", fontSize: "12px", color: "var(--success)" }}>✓ Current</span>}
                          </h4>
                          <p style={{ margin: 0, fontSize: "14px", color: "var(--muted)" }}>
                            {new Date(session.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                            {session.questionCount} questions
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                            {(session.totalCharacters / 1000).toFixed(1)}k chars
                          </div>
                        </div>
                      </div>
                      {session.preview && (
                        <p style={{ 
                          margin: "8px 0 0 0", 
                          fontSize: "13px", 
                          color: "var(--muted)",
                          fontStyle: "italic",
                          lineHeight: "1.4"
                        }}>
                          "{session.preview}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {otterUploads.length > 0 && (
                  <>
                    <h4 style={{ marginTop: "24px", marginBottom: "12px" }}>Otter.ai Uploads</h4>
                    <div style={{ display: "grid", gap: "12px" }}>
                      {otterUploads.map((upload) => (
                        <div 
                          key={upload.id} 
                          className="card"
                          style={{ 
                            backgroundColor: "var(--bg)",
                            border: "1px solid var(--border)",
                            padding: "12px"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--text)" }}>
                                {new Date(upload.createdAt).toLocaleDateString()}
                              </p>
                              <p style={{ 
                                margin: 0, 
                                fontSize: "12px", 
                                color: "var(--muted)",
                                fontStyle: "italic"
                              }}>
                                {upload.preview}
                              </p>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--muted)", marginLeft: "12px" }}>
                              {(upload.characterCount / 1000).toFixed(1)}k chars
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ 
                  marginTop: "20px", 
                  padding: "12px", 
                  backgroundColor: "var(--info-light)",
                  border: "1px solid var(--info)",
                  borderRadius: "8px"
                }}>
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
                    <strong>💡 How it works:</strong> Each time you commit your training, a new voice version is created. 
                    Your AI chatbot always uses the <strong>latest version</strong> to ensure it speaks with your most up-to-date coaching voice and methodology.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
