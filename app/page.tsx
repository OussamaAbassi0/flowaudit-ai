"use client";
// app/page.tsx
// DROP THIS FILE INTO: C:\Users\HP\Downloads\FILES\flowaudit-ai\app\page.tsx
// Zero external imports — DemoMockup is fully inlined below.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const DEMO_TEXT =
  "Every Monday our team exports orders from Shopify, removes cancelled ones in Excel, pastes results into a Google Sheet, and emails a summary to leadership. Takes 3 hrs/week across 2 people.";

const NODES = [
  { emoji: "🛒", label: "Shopify Trigger", accent: true },
  { emoji: "⚙️", label: "Filter",          accent: false },
  { emoji: "📊", label: "Google Sheets",   accent: false },
  { emoji: "💬", label: "Slack",           accent: false },
];

function DemoMockup() {
  const [typed,      setTyped]      = useState("");
  const [phase,      setPhase]      = useState<"idle"|"typing"|"processing"|"done">("idle");
  const [nodesOn,    setNodesOn]    = useState([false,false,false,false]);
  const [arrowsOn,   setArrowsOn]   = useState([false,false,false]);
  const [analysisOn, setAnalysisOn] = useState(false);
  const [downloadOn, setDownloadOn] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function after(ms: number, fn: () => void) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }

  function runSequence() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyped(""); setPhase("typing");
    setAnalysisOn(false); setDownloadOn(false);
    setNodesOn([false,false,false,false]);
    setArrowsOn([false,false,false]);

    for (let i = 0; i < DEMO_TEXT.length; i++) {
      const idx = i;
      after(idx * 26, () => setTyped(DEMO_TEXT.slice(0, idx + 1)));
    }
    const end = DEMO_TEXT.length * 26;
    after(end + 300,  () => setPhase("processing"));
    after(end + 2200, () => { setPhase("done"); setAnalysisOn(true); });
    NODES.forEach((_, ni) => {
      after(end + 2800 + ni * 180, () =>
        setNodesOn(p => { const n=[...p]; n[ni]=true; return n; })
      );
      if (ni < 3) after(end + 2900 + ni * 180, () =>
        setArrowsOn(p => { const a=[...p]; a[ni]=true; return a; })
      );
    });
    after(end + 4200, () => setDownloadOn(true));
    after(end + 7200, () => runSequence());
  }

  useEffect(() => {
    const t = setTimeout(runSequence, 900);
    return () => { clearTimeout(t); timers.current.forEach(clearTimeout); };
  }, []);

  return (
    <div style={{position:"relative",width:"100%",maxWidth:"860px",margin:"0 auto"}}>
      <div style={{position:"absolute",inset:"-1px",borderRadius:"17px",background:"linear-gradient(135deg,rgba(0,195,255,0.2),rgba(60,80,255,0.08) 60%,transparent)",zIndex:0,pointerEvents:"none"}} />
      <div style={{position:"relative",zIndex:1,background:"#111420",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",overflow:"hidden",boxShadow:"0 40px 80px rgba(0,0,0,0.6),0 0 60px rgba(0,195,255,0.04)"}}>
        {/* Chrome */}
        <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.015)"}}>
          <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#ff5f57"}} />
          <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#febc2e"}} />
          <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#28c840"}} />
          <div style={{flex:1,margin:"0 12px",height:"22px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"5px",display:"flex",alignItems:"center",padding:"0 10px",fontSize:"11px",color:"#5a6070",fontFamily:"monospace"}}>
            flowaudit.ai/dashboard/audit
          </div>
        </div>
        {/* Body */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:"360px"}}>
          {/* Left */}
          <div style={{padding:"20px",borderRight:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{fontSize:"10px",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#5a6070",marginBottom:"10px"}}>Describe your process</div>
            <div style={{width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"8px",padding:"12px",fontSize:"12.5px",color:"#8a90a0",lineHeight:"1.6",height:"180px",marginBottom:"12px",overflow:"hidden"}}>
              {typed}
              {phase==="typing" && <span style={{display:"inline-block",width:"2px",height:"13px",background:"#00c3ff",borderRadius:"1px",verticalAlign:"middle",marginLeft:"1px",animation:"blink 1s step-end infinite"}} />}
            </div>
            <div style={{width:"100%",padding:"10px",background:"#00c3ff",color:"#000",fontWeight:600,fontSize:"13px",border:"none",borderRadius:"8px",cursor:"default",display:"flex",alignItems:"center",justifyContent:"center",gap:"7px",fontFamily:"inherit",boxShadow:"0 0 18px rgba(0,195,255,0.25)"}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Generate Automation Audit
            </div>
          </div>
          {/* Right */}
          <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:"12px"}}>
            <div style={{fontSize:"10px",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#5a6070"}}>AI Analysis</div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"11.5px",color:"#8a90a0",padding:"4px 0",transition:"opacity .3s",opacity:phase==="processing"?1:0}}>
              <div style={{width:"12px",height:"12px",border:"1.5px solid rgba(255,255,255,0.15)",borderTopColor:"#00c3ff",borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0}} />
              Analyzing & mapping n8n nodes…
            </div>
            <div style={{flex:1,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"8px",padding:"12px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"10px",fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",color:"#00c3ff",marginBottom:"8px"}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Process Audit Report
              </div>
              {!analysisOn ? (
                <div>{["90%","75%","82%","60%"].map((w,i)=><div key={i} style={{height:"7px",borderRadius:"4px",background:"rgba(255,255,255,0.07)",marginBottom:"6px",width:w}} />)}</div>
              ) : (
                <div style={{fontSize:"11.5px",color:"#8a90a0",lineHeight:"1.6"}}>
                  <strong style={{color:"#fff"}}>Bottleneck:</strong> Manual export + email routing costs ~3.5 hrs/week.<br/><br/>
                  <strong style={{color:"#fff"}}>Savings:</strong> Automating saves <strong style={{color:"#00c3ff"}}>182 hrs/yr</strong> (~$9,100 value).<br/><br/>
                  <strong style={{color:"#fff"}}>Solution:</strong> Shopify → Filter → Sheets → Slack alert.
                </div>
              )}
            </div>
            <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"8px",padding:"12px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"10px",fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",color:"#00c3ff",marginBottom:"8px"}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                n8n Workflow
              </div>
              <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:"2px"}}>
                {NODES.map((node,i)=>(
                  <span key={i} style={{display:"flex",alignItems:"center"}}>
                    <span style={{display:"flex",alignItems:"center",gap:"5px",padding:"4px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:500,whiteSpace:"nowrap",transition:"all .3s ease",opacity:nodesOn[i]?1:0,transform:nodesOn[i]?"translateY(0)":"translateY(4px)",border:nodesOn[i]?(node.accent?"1px solid rgba(0,195,255,0.3)":"1px solid rgba(255,255,255,0.08)"):"1px solid transparent",background:nodesOn[i]?(node.accent?"rgba(0,195,255,0.1)":"rgba(255,255,255,0.03)"):"transparent",color:nodesOn[i]?(node.accent?"#00c3ff":"#8a90a0"):"transparent"}}>
                      <span>{node.emoji}</span>{node.label}
                    </span>
                    {i<3 && <span style={{fontSize:"10px",color:"#5a6070",padding:"0 3px",opacity:arrowsOn[i]?1:0,transition:"opacity .3s"}}>→</span>}
                  </span>
                ))}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"rgba(0,195,255,0.05)",border:"1px solid rgba(0,195,255,0.15)",borderRadius:"8px",transition:"opacity .4s",opacity:downloadOn?1:0}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"11.5px",color:"#fff",fontWeight:500}}>
                <div style={{width:"22px",height:"22px",background:"rgba(0,195,255,0.1)",borderRadius:"5px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00c3ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                flowaudit-workflow.json <span style={{fontSize:"10.5px",color:"#5a6070"}}>4.2 KB</span>
              </div>
              <button style={{fontSize:"11px",fontWeight:600,color:"#00c3ff",background:"rgba(0,195,255,0.1)",border:"1px solid rgba(0,195,255,0.2)",borderRadius:"5px",padding:"3px 10px",cursor:"default",fontFamily:"inherit"}}>↓ Download</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div style={{minHeight:"100vh",background:"#08090d",color:"#e8eaf0",fontFamily:"'DM Sans',ui-sans-serif,system-ui,sans-serif",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box} a{text-decoration:none;color:inherit}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:.35}}
        .fa1{animation:fadeUp .6s ease both}.fa2{animation:fadeUp .6s .1s ease both}.fa3{animation:fadeUp .6s .2s ease both}
        .fa4{animation:fadeUp .6s .3s ease both}.fa5{animation:fadeUp .6s .35s ease both}.fa6{animation:fadeUp .7s .42s ease both}
        .pdot{animation:pulseDot 2s infinite}
        .grid-bg{background-image:linear-gradient(rgba(0,195,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,195,255,.03) 1px,transparent 1px);background-size:40px 40px;mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,black 30%,transparent 100%);-webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,black 30%,transparent 100%);}
        .b-blue{background:#00c3ff;color:#000;box-shadow:0 0 20px rgba(0,195,255,.25);transition:all .2s;border:none}
        .b-blue:hover{background:#33ccff;box-shadow:0 0 30px rgba(0,195,255,.4);transform:translateY(-1px)}
        .b-ghost{background:transparent;color:#8a90a0;border:1px solid rgba(255,255,255,.08);transition:all .15s}
        .b-ghost:hover{color:#e8eaf0;border-color:rgba(255,255,255,.2)}
        .fc{background:#0d0f17;transition:background .2s;position:relative}.fc:hover{background:#111420}
        .fc .cg{position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,195,255,.06),transparent 60%);opacity:0;transition:opacity .3s;pointer-events:none;border-radius:inherit}
        .fc:hover .cg{opacity:1}
        .tp{background:#08090d;border:1px solid rgba(255,255,255,.06);transition:all .15s;cursor:default}
        .tp:hover{border-color:rgba(0,195,255,.22);color:#e8eaf0;background:rgba(0,195,255,.07)}
        .sc{background:#0d0f17;border:1px solid rgba(255,255,255,.06);transition:border-color .2s}.sc:hover{border-color:rgba(0,195,255,.22)}
        .nl{color:#8a90a0;font-size:13.5px;font-weight:500;padding:6px 12px;transition:color .15s}.nl:hover{color:#e8eaf0}
        .bglow{text-shadow:0 0 40px rgba(0,195,255,.3)}
        @media(max-width:768px){
          h1{font-size:34px!important} .hsm{display:none!important}
          .fg{grid-template-columns:1fr!important} .sg{grid-template-columns:1fr!important} .tg{grid-template-columns:repeat(4,1fr)!important}
          .wc{flex-direction:column!important} .wcv{border-left:none!important;border-top:1px solid rgba(255,255,255,.06)!important}
          nav{padding:0 16px!important} .ctas{flex-direction:column!important;width:100%} .ctas a{width:100%!important;justify-content:center!important}
          .demo-body{grid-template-columns:1fr!important} .demo-left{border-right:none!important;border-bottom:1px solid rgba(255,255,255,.06)!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px",height:"60px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(8,9,13,0.9)",backdropFilter:"blur(20px)"}}>
        <Link href="/" style={{display:"flex",alignItems:"center",gap:"9px"}}>
          <div style={{width:"30px",height:"30px",background:"#00c3ff",borderRadius:"7px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 16px rgba(0,195,255,0.35)",flexShrink:0}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span style={{fontSize:"14px",fontWeight:600,color:"#fff",letterSpacing:"-0.01em"}}>FlowAudit AI</span>
        </Link>
        <div style={{display:"flex",alignItems:"center",gap:"2px"}}>
          <Link href="#features" className="nl hsm">Features</Link>
          <Link href="#how" className="nl hsm">How it works</Link>
          <Link href="/sign-in" className="nl" style={{marginRight:"4px"}}>Sign in</Link>
          <Link href="/sign-up" className="b-blue" style={{display:"flex",alignItems:"center",gap:"6px",padding:"7px 16px",borderRadius:"8px",fontSize:"13px",fontWeight:600,cursor:"pointer"}}>
            Get started
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"100px 24px 60px",overflow:"hidden"}}>
        <div className="grid-bg" style={{position:"absolute",inset:0,pointerEvents:"none"}} />
        <div style={{position:"absolute",width:"600px",height:"400px",borderRadius:"50%",background:"rgba(0,195,255,0.06)",filter:"blur(80px)",top:"-80px",left:"50%",transform:"translateX(-50%)",pointerEvents:"none"}} />
        <div style={{position:"absolute",width:"280px",height:"280px",borderRadius:"50%",background:"rgba(60,80,255,0.05)",filter:"blur(80px)",bottom:"100px",right:"-60px",pointerEvents:"none"}} />
        <div className="fa1" style={{display:"inline-flex",alignItems:"center",gap:"7px",padding:"5px 12px 5px 8px",background:"rgba(0,195,255,0.09)",border:"1px solid rgba(0,195,255,0.2)",borderRadius:"100px",fontSize:"12px",fontWeight:500,color:"#00c3ff",marginBottom:"28px"}}>
          <span className="pdot" style={{display:"inline-block",width:"6px",height:"6px",borderRadius:"50%",background:"#00c3ff",boxShadow:"0 0 6px #00c3ff"}} />
          GPT-4o × n8n Automation Engine
        </div>
        <h1 className="fa2" style={{fontSize:"clamp(36px,5.5vw,68px)",fontWeight:700,lineHeight:1.1,letterSpacing:"-0.03em",color:"#fff",maxWidth:"780px",marginBottom:"20px"}}>
          Your manual process,<br />
          <span className="bglow" style={{color:"#00c3ff"}}>automated in seconds</span>
        </h1>
        <p className="fa3" style={{fontSize:"16px",color:"#8a90a0",maxWidth:"500px",lineHeight:1.7,marginBottom:"36px"}}>
          Describe any workflow in plain English. FlowAudit AI maps every bottleneck, calculates your time savings, and delivers a ready-to-import n8n workflow JSON.
        </p>
        <div className="fa4 ctas" style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"center",gap:"12px",marginBottom:"32px"}}>
          <Link href="/sign-up" className="b-blue" style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 28px",borderRadius:"12px",fontSize:"14.5px",fontWeight:600,cursor:"pointer"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Generate free audit
          </Link>
          <Link href="/sign-in" className="b-ghost" style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 28px",borderRadius:"12px",fontSize:"13.5px",fontWeight:500,cursor:"pointer"}}>
            Sign in to dashboard
          </Link>
        </div>
        <div className="fa5" style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"center",gap:"20px",fontSize:"12.5px",color:"#5a6070",marginBottom:"64px"}}>
          {["No credit card required","Results in <30 seconds","Direct n8n import"].map((t,i)=>(
            <span key={t} style={{display:"flex",alignItems:"center",gap:"6px"}}>
              {i>0 && <span className="hsm" style={{width:"1px",height:"14px",background:"rgba(255,255,255,0.07)",margin:"0 8px 0 0",display:"inline-block"}} />}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c97a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {t}
            </span>
          ))}
        </div>
        <div className="fa6" style={{width:"100%",maxWidth:"860px"}}><DemoMockup /></div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{maxWidth:"1100px",margin:"0 auto",padding:"80px 24px"}}>
        <p style={{fontSize:"11.5px",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:"#00c3ff",marginBottom:"14px",display:"flex",alignItems:"center",gap:"8px"}}>
          <span style={{display:"inline-block",width:"20px",height:"1px",background:"#00c3ff"}} />Features
        </p>
        <h2 style={{fontSize:"clamp(26px,3vw,40px)",fontWeight:700,letterSpacing:"-0.02em",color:"#fff",maxWidth:"480px",lineHeight:1.15,marginBottom:"48px"}}>Everything you need to automate faster</h2>
        <div className="fg" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",overflow:"hidden"}}>
          {[{i:"🔍",t:"Deep Process Analysis",d:"AI maps every manual touchpoint, redundant handoff, and error-prone step with surgical specificity."},{i:"⏱️",t:"Time & Cost Quantification",d:"Concrete numbers: hours saved per week, FTE reclaimed, and annual dollar value at market rate."},{i:"📦",t:"Instant n8n JSON Export",d:"Download a workflow that imports directly into n8n — nodes, connections, and credential placeholders fully mapped."}].map(({i,t,d})=>(
            <div key={t} className="fc" style={{padding:"32px 28px"}}>
              <div className="cg" />
              <div style={{width:"40px",height:"40px",borderRadius:"10px",background:"rgba(0,195,255,0.09)",border:"1px solid rgba(0,195,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",marginBottom:"18px",position:"relative",zIndex:1}}>{i}</div>
              <div style={{fontSize:"15px",fontWeight:600,color:"#fff",marginBottom:"8px",position:"relative",zIndex:1}}>{t}</div>
              <div style={{fontSize:"13.5px",color:"#8a90a0",lineHeight:1.65,position:"relative",zIndex:1}}>{d}</div>
            </div>
          ))}
          <div className="fc" style={{gridColumn:"1 / -1"}}>
            <div className="cg" />
            <div className="wc" style={{display:"flex"}}>
              <div style={{flex:1,padding:"32px 28px",position:"relative",zIndex:1}}>
                <div style={{width:"40px",height:"40px",borderRadius:"10px",background:"rgba(0,195,255,0.09)",border:"1px solid rgba(0,195,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",marginBottom:"18px"}}>🗺️</div>
                <div style={{fontSize:"15px",fontWeight:600,color:"#fff",marginBottom:"8px"}}>Knows your entire tool stack</div>
                <div style={{fontSize:"13.5px",color:"#8a90a0",lineHeight:1.65,maxWidth:"360px"}}>FlowAudit AI maps 30+ business tools to their exact n8n node types — Gmail, HubSpot, Salesforce, Shopify, Notion, Airtable and more. Just describe your process, and the right nodes appear automatically.</div>
              </div>
              <div className="wcv" style={{flex:1.2,padding:"24px",borderLeft:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1}}>
                <div className="tg" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"8px",width:"100%"}}>
                  {[["📧","Gmail"],["📊","Sheets"],["💬","Slack"],["🔶","HubSpot"],["☁️","Salesforce"],["📝","Notion"],["📋","Airtable"],["🛒","Shopify"],["🔷","Jira"],["📅","Calendar"],["💳","Stripe"],["📱","Twilio"],["🗃️","Drive"],["✅","Asana"],["➕","30 more"]].map(([e,l])=>(
                    <div key={l} className="tp" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"5px",padding:"10px 6px",borderRadius:"8px",fontSize:"10.5px",fontWeight:500,color:"#8a90a0",textAlign:"center"}}>
                      <span style={{fontSize:"18px"}}>{e}</span>{l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{maxWidth:"1100px",margin:"0 auto",padding:"0 24px 80px"}}>
        <p style={{fontSize:"11.5px",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:"#00c3ff",marginBottom:"14px",display:"flex",alignItems:"center",gap:"8px"}}>
          <span style={{display:"inline-block",width:"20px",height:"1px",background:"#00c3ff"}} />How it works
        </p>
        <h2 style={{fontSize:"clamp(26px,3vw,40px)",fontWeight:700,letterSpacing:"-0.02em",color:"#fff",maxWidth:"500px",lineHeight:1.15,marginBottom:"48px"}}>From description<br/>to automation in 3 steps</h2>
        <div className="sg" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"24px"}}>
          {[{s:"01",t:"Describe your process",d:"Write your manual workflow in plain English. No technical knowledge needed — just mention what you do and which tools you use."},{s:"02",t:"AI audits & maps nodes",d:"GPT-4o identifies every bottleneck and maps each step to the correct n8n node from a library of 30+ integrations."},{s:"03",t:"Download & import",d:"Get your audit report + a JSON file. Import into n8n, add credentials, activate — your automation is live."}].map(({s,t,d},i)=>(
            <div key={s} className="sc" style={{position:"relative",padding:"28px 24px",borderRadius:"14px"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:"11px",fontWeight:500,color:"#00c3ff",background:"rgba(0,195,255,0.09)",border:"1px solid rgba(0,195,255,0.18)",borderRadius:"100px",padding:"3px 10px",display:"inline-block",marginBottom:"16px",letterSpacing:"0.05em"}}>Step {s}</div>
              <div style={{fontSize:"15px",fontWeight:600,color:"#fff",marginBottom:"8px"}}>{t}</div>
              <div style={{fontSize:"13.5px",color:"#8a90a0",lineHeight:1.65}}>{d}</div>
              {i<2 && <div className="hsm" style={{position:"absolute",top:"40px",right:"-14px",zIndex:10,width:"28px",height:"28px",background:"#08090d",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",color:"#5a6070"}}>→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{position:"relative",textAlign:"center",padding:"80px 24px 100px"}}>
        <div style={{position:"absolute",width:"500px",height:"300px",borderRadius:"50%",background:"rgba(0,195,255,0.05)",filter:"blur(80px)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}} />
        <div style={{position:"relative",zIndex:1,maxWidth:"540px",margin:"0 auto"}}>
          <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:700,letterSpacing:"-0.025em",color:"#fff",marginBottom:"16px",lineHeight:1.15}}>Stop doing manually<br/>what AI can automate</h2>
          <p style={{fontSize:"15px",color:"#8a90a0",marginBottom:"32px",lineHeight:1.65}}>Join teams using FlowAudit AI to reclaim hours every week.<br/>Your first audit is free — no card required.</p>
          <Link href="/sign-up" className="b-blue" style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"13px 32px",borderRadius:"12px",fontSize:"14.5px",fontWeight:600,cursor:"pointer"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Generate your first audit — free
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"24px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:"12.5px",color:"#5a6070"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <div style={{width:"22px",height:"22px",background:"#00c3ff",borderRadius:"5px",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          FlowAudit AI
        </div>
        <span>© 2026 FlowAudit AI. Built for modern ops teams.</span>
      </footer>
    </div>
  );
}
