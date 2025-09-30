"use client";

import { useEffect, useRef, useState } from "react";

const MIN_LEN = 300;
const STRONG_TARGET = 24;

type StatusMap = "q-ok"|"q-short"|"q-empty";

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
    </div>
  );
}
