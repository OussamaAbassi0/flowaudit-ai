// app/dashboard/history/page.tsx — Server Component
// Shows all past audits from DB with analysis preview + download button.

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function HistoryPage() {
  const { userId: clerkId } = await auth();

  let audits: {
    id: string;
    originalInput: string;
    analysisReport: string;
    n8nWorkflowJson: unknown;
    createdAt: Date;
  }[] = [];

  if (clerkId) {
    const dbUser = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (dbUser) {
      audits = await db.audit.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          originalInput: true,
          analysisReport: true,
          n8nWorkflowJson: true,
          createdAt: true,
        },
      });
    }
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px" }}>
      <style>{`
        .audit-row {
          background: #0d0f17;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 20px 22px;
          margin-bottom: 12px;
          transition: border-color .15s;
        }
        .audit-row:hover { border-color: rgba(255,255,255,0.14); }
        .dl-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; background: rgba(34,201,122,0.1);
          border: 1px solid rgba(34,201,122,0.25); border-radius: 8px;
          color: #22c97a; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all .15s;
        }
        .dl-btn:hover { background: rgba(34,201,122,0.18); }
        .node-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px; background: rgba(0,195,255,0.08);
          border: 1px solid rgba(0,195,255,0.15); border-radius: 5px;
          font-size: 10.5px; color: #00c3ff; margin-right: 5px; margin-bottom: 4px;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: "6px" }}>
          Audit History
        </h1>
        <p style={{ fontSize: "13.5px", color: "#8a90a0" }}>
          {audits.length} audit{audits.length !== 1 ? "s" : ""} generated
        </p>
      </div>

      {/* Empty state */}
      {audits.length === 0 && (
        <div style={{ padding: "48px 40px", background: "#0d0f17", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📋</div>
          <div style={{ fontSize: "14px", fontWeight: 500, color: "#e8eaf0", marginBottom: "6px" }}>No audits yet</div>
          <div style={{ fontSize: "13px", color: "#5a6070", marginBottom: "20px" }}>Generate your first automation audit to see it here.</div>
          <Link href="/dashboard/audit" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 20px", background: "#00c3ff", color: "#000", fontSize: "13px", fontWeight: 600, borderRadius: "9px", textDecoration: "none", boxShadow: "0 0 16px rgba(0,195,255,0.2)" }}>
            ⚡ Generate New Audit
          </Link>
        </div>
      )}

      {/* Audit list */}
      {audits.map((audit) => {
        const workflow = audit.n8nWorkflowJson as {
          name?: string;
          nodes?: { name: string; type: string }[];
        };
        const nodeCount = workflow?.nodes?.length ?? 0;
        const workflowName = workflow?.name ?? "Untitled Workflow";
        const nodes = (workflow?.nodes ?? []).slice(0, 4);

        return (
          <div key={audit.id} className="audit-row">
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", color: "#e8eaf0", lineHeight: 1.5, marginBottom: "4px" }}>
                  {audit.originalInput.slice(0, 120)}{audit.originalInput.length > 120 ? "…" : ""}
                </div>
                <div style={{ fontSize: "11.5px", color: "#5a6070" }}>
                  {new Date(audit.createdAt).toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              </div>

              {/* Download button — client-side, handled via form action trick */}
              <DownloadButton workflow={audit.n8nWorkflowJson} auditId={audit.id} />
            </div>

            {/* Workflow name + node count */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#fff" }}>{workflowName}</div>
              <div style={{ fontSize: "11px", color: "#5a6070" }}>{nodeCount} nodes</div>
            </div>

            {/* Node tags */}
            <div>
              {nodes.map((node, i) => (
                <span key={i} className="node-tag">
                  {node.name}
                </span>
              ))}
              {nodeCount > 4 && (
                <span className="node-tag">+{nodeCount - 4} more</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Download button (must be client component for onClick) ──
// Inlined here as a simple server-rendered form that triggers a
// client script — avoids needing a separate file.
function DownloadButton({ workflow, auditId }: { workflow: unknown; auditId: string }) {
  const json = JSON.stringify(workflow, null, 2);
  const encoded = Buffer.from(json).toString("base64");

  return (
    <form
      action={`/api/download-workflow`}
      method="POST"
      style={{ flexShrink: 0 }}
    >
      <input type="hidden" name="workflowJson" value={encoded} />
      <input type="hidden" name="auditId" value={auditId} />
      <button type="submit" className="dl-btn">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download .json
      </button>
    </form>
  );
}
