"use client";

import { useState, useTransition, useRef } from "react";

// ── Types ──
type N8nNode = { id?: string; name: string; type: string; position?: [number,number]; parameters?: Record<string,unknown>; };
type N8nWorkflow = { name: string; nodes: N8nNode[]; connections: Record<string,unknown>; };
type AuditResult = { analysis: string; n8nWorkflow: N8nWorkflow; auditId: string; };

// ── Download helper ──
function downloadWorkflow(workflow: N8nWorkflow, auditId: string) {
  const json = JSON.stringify({ ...workflow, meta: { generatedBy:"FlowAudit AI", auditId, exportedAt: new Date().toISOString() }}, null, 2);
  const blob = new Blob([json], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `flowaudit-workflow-${auditId.slice(0,8)}.json`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ── Markdown renderer (simple) ──
function SimpleMarkdown({ content }: { content: string }) {
  const html = content
    .replace(/^## (.+)$/gm, '<h2 style="font-size:15px;font-weight:600;color:#fff;margin:20px 0 8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.07)">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13.5px;font-weight:600;color:#e8eaf0;margin:14px 0 6px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;font-weight:600">$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,195,255,0.1);color:#00c3ff;padding:1px 6px;border-radius:4px;font-size:12px;font-family:monospace">$1</code>')
    .replace(/^- (.+)$/gm, '<li style="color:#8a90a0;margin:3px 0;padding-left:4px">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="list-style:disc;padding-left:20px;margin:8px 0">$&</ul>')
    .replace(/\n\n/g, '</p><p style="color:#8a90a0;line-height:1.7;margin:8px 0">')
    .replace(/^(?!<[h|u|l])(.+)$/gm, (m) => m.startsWith('<') ? m : `<p style="color:#8a90a0;line-height:1.7;margin:8px 0">${m}</p>`);
  return <div style={{fontSize:"13.5px"}} dangerouslySetInnerHTML={{__html: html}} />;
}

const EXAMPLES = [
  { label:"🎯 Lead Qualification", text:"Every day our sales team checks new Typeform submissions, copies lead info into Google Sheets, looks up the company in HubSpot, and sends a welcome email via Gmail + posts to #sales-leads Slack channel. Takes 2-3 hours daily across 3 people." },
  { label:"📄 Invoice Processing", text:"Our finance team receives PDF invoices by email, manually extracts vendor name, amount, and due date, enters it into our Google Sheet, creates an Asana task for approval, and sends a confirmation email back to the vendor. We process ~50 invoices per week." },
  { label:"🚀 Customer Onboarding", text:"When a new customer signs up in Stripe, we manually create their account in Salesforce, send 3 onboarding emails over 7 days, create a Trello board for their project, and schedule a kickoff call in Google Calendar. Takes 45 minutes per customer." },
];

export default function AuditPage() {
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const charCount = input.length;
  const tooShort = charCount > 0 && charCount < 50;
  const tooLong = charCount > 5000;
  const canSubmit = !isPending && !tooShort && !tooLong && input.trim().length > 0;

  async function handleGenerate() {
    if (!canSubmit) return;
    setError(null); setResult(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/generate-audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Generation failed. Please try again.");
          return;
        }
        setResult(data.data);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 100);
      } catch {
        setError("Network error. Please check your connection and try again.");
      }
    });
  }

  const S = {
    page: { maxWidth:"860px", margin:"0 auto", padding:"36px 24px" },
    card: { background:"#0d0f17", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", overflow:"hidden" as const },
    cardHeader: { display:"flex", alignItems:"center", gap:"10px", padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" },
    cardBody: { padding:"20px" },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{marginBottom:"28px"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"11.5px",fontWeight:500,color:"#00c3ff",marginBottom:"10px"}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          AI-Powered Analysis
        </div>
        <h1 style={{fontSize:"22px",fontWeight:700,color:"#fff",letterSpacing:"-0.02em",marginBottom:"6px"}}>Generate Automation Audit</h1>
        <p style={{fontSize:"13.5px",color:"#8a90a0",lineHeight:1.6}}>Describe any manual process in plain English. Get a full audit report + ready-to-import n8n workflow JSON.</p>
      </div>

      {/* Example prompts */}
      {!result && (
        <div style={{marginBottom:"24px"}}>
          <div style={{fontSize:"11px",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#5a6070",marginBottom:"10px"}}>Try an example</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
            {EXAMPLES.map(ex => (
              <button key={ex.label} onClick={()=>{setInput(ex.text);setError(null);setResult(null);}}
                style={{padding:"6px 14px",background:"#0d0f17",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",fontSize:"12.5px",color:"#8a90a0",cursor:"pointer",transition:"all .15s",fontFamily:"inherit"}}
                onMouseEnter={e=>{e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="rgba(255,255,255,0.16)"}}
                onMouseLeave={e=>{e.currentTarget.style.color="#8a90a0";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}}>
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{marginBottom:"20px"}}>
        <label style={{display:"block",fontSize:"13.5px",fontWeight:500,color:"#e8eaf0",marginBottom:"10px"}}>Describe your business process</label>
        <div style={{position:"relative"}}>
          <textarea
            value={input} onChange={e=>setInput(e.target.value)}
            disabled={isPending}
            placeholder={"Example: 'Each Monday, our ops team exports a CSV from Shopify with last week's orders, manually removes cancelled items in Excel, pastes into a Google Sheet, and emails a weekly summary to leadership. This takes about 3 hours every week...'"}
            rows={7}
            style={{width:"100%",background:"#0d0f17",border:`1px solid ${tooLong?"#ef4444":tooShort?"#f59e0b":"rgba(255,255,255,0.08)"}`,borderRadius:"12px",padding:"14px 14px 36px",fontSize:"13.5px",color:"#e8eaf0",resize:"none",outline:"none",lineHeight:"1.6",fontFamily:"inherit",transition:"border-color .15s",opacity:isPending?0.6:1}}
            onFocus={e=>{if(!tooLong&&!tooShort)e.target.style.borderColor="rgba(0,195,255,0.4)"}}
            onBlur={e=>{if(!tooLong&&!tooShort)e.target.style.borderColor="rgba(255,255,255,0.08)"}}
          />
          <div style={{position:"absolute",bottom:"12px",right:"12px",fontSize:"11.5px",color:tooLong?"#ef4444":charCount>4000?"#f59e0b":"#5a6070",fontVariantNumeric:"tabular-nums"}}>
            {charCount.toLocaleString()} / 5,000
          </div>
        </div>
        {tooShort && <p style={{fontSize:"12px",color:"#f59e0b",marginTop:"6px",display:"flex",alignItems:"center",gap:"5px"}}>⚠ Add more detail for an accurate audit (50 chars min).</p>}
        {tooLong && <p style={{fontSize:"12px",color:"#ef4444",marginTop:"6px",display:"flex",alignItems:"center",gap:"5px"}}>✕ Too long — please trim to under 5,000 characters.</p>}
      </div>

      {/* Submit */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"28px"}}>
        <span style={{fontSize:"12px",color:"#5a6070"}}>Results are saved to your audit history automatically.</span>
        <button onClick={handleGenerate} disabled={!canSubmit}
          style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",background:canSubmit?"#00c3ff":"rgba(255,255,255,0.06)",color:canSubmit?"#000":"#5a6070",fontSize:"13.5px",fontWeight:600,border:"none",borderRadius:"10px",cursor:canSubmit?"pointer":"not-allowed",transition:"all .2s",fontFamily:"inherit",boxShadow:canSubmit?"0 0 20px rgba(0,195,255,0.25)":"none",minWidth:"200px",justifyContent:"center"}}>
          {isPending ? (
            <><div style={{width:"14px",height:"14px",border:"2px solid rgba(0,0,0,0.3)",borderTopColor:"#000",borderRadius:"50%",animation:"spin .7s linear infinite"}} />Analyzing process…</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Generate Automation Audit</>
          )}
        </button>
      </div>

      {/* Status */}
      {isPending && (
        <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"12px 16px",background:"rgba(0,195,255,0.07)",border:"1px solid rgba(0,195,255,0.2)",borderRadius:"10px",marginBottom:"24px",fontSize:"13.5px",color:"#00c3ff"}}>
          <div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#00c3ff",boxShadow:"0 0 8px #00c3ff",animation:"pulseDot 1.5s infinite"}} />
          Analyzing your process and generating automation blueprint…
        </div>
      )}

      {/* Loading skeleton */}
      {isPending && (
        <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          {[1,2].map(i=>(
            <div key={i} style={{background:"#0d0f17",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"20px"}}>
              <div style={{display:"flex",gap:"10px",alignItems:"center",marginBottom:"16px"}}>
                <div style={{width:"32px",height:"32px",borderRadius:"8px",background:"rgba(255,255,255,0.05)"}} />
                <div style={{height:"14px",width:"140px",borderRadius:"6px",background:"rgba(255,255,255,0.05)"}} />
              </div>
              {[85,70,90,60,75].map((w,j)=>(
                <div key={j} style={{height:"8px",borderRadius:"4px",background:"rgba(255,255,255,0.04)",marginBottom:"10px",width:`${w}%`,animation:"shimmer 1.5s ease-in-out infinite"}} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isPending && (
        <div style={{display:"flex",alignItems:"flex-start",gap:"10px",padding:"14px 16px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:"10px",marginBottom:"20px"}}>
          <span style={{fontSize:"16px",marginTop:"1px"}}>✕</span>
          <div><div style={{fontSize:"13.5px",fontWeight:500,color:"#fca5a5"}}>Generation failed</div><div style={{fontSize:"13px",color:"rgba(252,165,165,0.8)",marginTop:"3px"}}>{error}</div></div>
        </div>
      )}

      {/* Results */}
      {result && !isPending && (
        <div ref={resultsRef} style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"4px"}}>
            <h2 style={{fontSize:"15px",fontWeight:600,color:"#fff",display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{color:"#22c97a"}}>✓</span> Audit Results
            </h2>
            <button onClick={()=>{setResult(null);setInput("");window.scrollTo({top:0,behavior:"smooth"});}}
              style={{fontSize:"12px",color:"#5a6070",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",transition:"color .15s"}}
              onMouseEnter={e=>e.currentTarget.style.color="#e8eaf0"} onMouseLeave={e=>e.currentTarget.style.color="#5a6070"}>
              ← New audit
            </button>
          </div>

          {/* Analysis */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div style={{width:"32px",height:"32px",borderRadius:"8px",background:"rgba(0,195,255,0.1)",border:"1px solid rgba(0,195,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px"}}>📋</div>
              <div>
                <div style={{fontSize:"13.5px",fontWeight:600,color:"#fff"}}>Process Audit Report</div>
                <div style={{fontSize:"11.5px",color:"#5a6070"}}>AI-generated analysis & recommendations</div>
              </div>
            </div>
            <div style={S.cardBody}><SimpleMarkdown content={result.analysis} /></div>
          </div>

          {/* Workflow */}
          <div style={S.card}>
            <div style={{...S.cardHeader,justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{width:"32px",height:"32px",borderRadius:"8px",background:"rgba(34,201,122,0.1)",border:"1px solid rgba(34,201,122,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px"}}>⚡</div>
                <div>
                  <div style={{fontSize:"13.5px",fontWeight:600,color:"#fff"}}>n8n Workflow Blueprint</div>
                  <div style={{fontSize:"11.5px",color:"#5a6070"}}>{result.n8nWorkflow.nodes?.length ?? 0} nodes · {result.n8nWorkflow.name}</div>
                </div>
              </div>
              <button onClick={()=>downloadWorkflow(result.n8nWorkflow, result.auditId)}
                style={{display:"flex",alignItems:"center",gap:"7px",padding:"8px 16px",background:"#22c97a",color:"#000",fontSize:"12.5px",fontWeight:600,border:"none",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 0 16px rgba(34,201,122,0.2)",transition:"all .2s"}}
                onMouseEnter={e=>e.currentTarget.style.background="#34d68a"} onMouseLeave={e=>e.currentTarget.style.background="#22c97a"}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download .json
              </button>
            </div>
            <div style={S.cardBody}>
              <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"16px"}}>
                {result.n8nWorkflow.nodes?.map((node,i)=>{
                  const isTrigger = node.type?.toLowerCase().includes("trigger") || node.type?.toLowerCase().includes("webhook");
                  const isLast = i === (result.n8nWorkflow.nodes.length - 1);
                  return (
                    <div key={node.id ?? i} style={{display:"flex",alignItems:"flex-start",gap:"10px"}}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                        <div style={{width:"26px",height:"26px",borderRadius:"7px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,flexShrink:0,background:isTrigger?"rgba(245,158,11,0.15)":isLast?"rgba(34,201,122,0.12)":"rgba(255,255,255,0.06)",border:isTrigger?"1px solid rgba(245,158,11,0.3)":isLast?"1px solid rgba(34,201,122,0.25)":"1px solid rgba(255,255,255,0.08)",color:isTrigger?"#f59e0b":isLast?"#22c97a":"#8a90a0"}}>{i+1}</div>
                        {!isLast && <div style={{width:"1px",height:"14px",background:"rgba(255,255,255,0.07)",margin:"3px 0"}} />}
                      </div>
                      <div style={{flex:1,paddingTop:"2px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                          <span style={{fontSize:"13px",fontWeight:500,color:"#fff"}}>{node.name}</span>
                          {isTrigger && <span style={{fontSize:"9.5px",fontWeight:700,padding:"1px 7px",borderRadius:"100px",background:"rgba(245,158,11,0.12)",color:"#f59e0b",border:"1px solid rgba(245,158,11,0.25)",letterSpacing:"0.05em"}}>TRIGGER</span>}
                        </div>
                        <div style={{fontSize:"11.5px",color:"#5a6070",fontFamily:"monospace",marginTop:"1px"}}>{node.type}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.07)",fontSize:"12px",color:"#8a90a0",lineHeight:1.6}}>
                <strong style={{color:"#fff"}}>How to import:</strong> Download the JSON → Open n8n → New Workflow → ⋯ Menu → Import from JSON → Paste file → Add credentials for each node.
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes shimmer{0%,100%{opacity:.4}50%{opacity:.7}}
      `}</style>
    </div>
  );
}
