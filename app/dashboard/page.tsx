// app/dashboard/page.tsx — Server Component

import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { db } from "@/lib/db";
import { SubscriptionButton } from "./subscription-button";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  const user = await currentUser();

  let auditCount = 0;
  let recentAudits: { id: string; originalInput: string; createdAt: Date }[] = [];
  let isPro = false;

  if (clerkId) {
    const dbUser = await db.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        stripeCurrentPeriodEnd: true,
        _count: { select: { audits: true } },
      },
    });

    if (dbUser) {
      auditCount = dbUser._count.audits;

      // Pro = has an active subscription that hasn't expired
      isPro =
        !!dbUser.stripeCurrentPeriodEnd &&
        dbUser.stripeCurrentPeriodEnd.getTime() > Date.now();

      recentAudits = await db.audit.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, originalInput: true, createdAt: true },
      });
    }
  }

  const hoursSaved = auditCount * 3;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
      <style>{`
        .cta-card {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; background: rgba(0,195,255,0.07);
          border: 1px solid rgba(0,195,255,0.2); border-radius: 14px;
          text-decoration: none; transition: background .2s, border-color .2s;
        }
        .cta-card:hover { background: rgba(0,195,255,0.13); border-color: rgba(0,195,255,0.35); }
        .recent-card {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 18px; background: #0d0f17;
          border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;
          margin-bottom: 8px; transition: border-color .15s;
        }
        .recent-card:hover { border-color: rgba(255,255,255,0.14); }
      `}</style>

      {/* Greeting */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
        </h1>
        <p style={{ fontSize: "14px", color: "#8a90a0", marginTop: "4px" }}>
          Ready to automate more workflows?
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Audits",        value: String(auditCount), color: "#00c3ff" },
          { label: "Hours Saved (est.)",  value: `${hoursSaved}h`,   color: "#22c97a" },
          { label: "Workflows Generated", value: String(auditCount), color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#0d0f17", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{value}</div>
            <div style={{ fontSize: "12.5px", color: "#5a6070" }}>{label}</div>
            <div style={{ height: "2px", background: color, borderRadius: "2px", marginTop: "12px", opacity: 0.4, width: "40px" }} />
          </div>
        ))}
      </div>

      {/* Pro banner — shows different UI depending on subscription status */}
      {isPro ? (
        // ── ACTIVE PRO ──
        <div style={{
          marginBottom: "32px", padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(34,201,122,0.08), rgba(0,195,255,0.06))",
          border: "1px solid rgba(34,201,122,0.25)", borderRadius: "14px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", background: "rgba(34,201,122,0.15)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              ✦
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>
                FlowAudit Pro — Active
              </div>
              <div style={{ fontSize: "12.5px", color: "#22c97a" }}>
                Unlimited audits · Full n8n workflow export
              </div>
            </div>
          </div>
          <div style={{ fontSize: "11.5px", color: "#5a6070", textAlign: "right", flexShrink: 0 }}>
            ✓ Subscribed
          </div>
        </div>
      ) : (
        // ── FREE TIER / UPGRADE PROMPT ──
        <div style={{
          marginBottom: "32px", padding: "24px",
          background: "linear-gradient(145deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))",
          border: "1px solid rgba(168,85,247,0.25)", borderRadius: "14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "16px",
        }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
              Unlock Unlimited Audits
            </h2>
            <p style={{ fontSize: "13px", color: "#a5a8b5" }}>
              Upgrade to FlowAudit Pro to generate unlimited AI-powered workflows.
            </p>
          </div>
          <div style={{ minWidth: "160px" }}>
            <SubscriptionButton isPro={false} />
          </div>
        </div>
      )}

      {/* CTA */}
      <Link href="/dashboard/audit" className="cta-card" style={{ marginBottom: "32px", display: "flex" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "42px", height: "42px", background: "rgba(0,195,255,0.15)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>⚡</div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Generate a New Audit</div>
            <div style={{ fontSize: "12.5px", color: "rgba(0,195,255,0.8)", marginTop: "2px" }}>
              Describe your process → Get an n8n workflow in seconds
            </div>
          </div>
        </div>
        <div style={{ fontSize: "18px", color: "rgba(0,195,255,0.6)" }}>→</div>
      </Link>

      {/* Recent audits */}
      {recentAudits.length > 0 && (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a6070", marginBottom: "12px" }}>
            Recent Audits
          </div>
          {recentAudits.map((audit) => (
            <div key={audit.id} className="recent-card">
              <div style={{ width: "32px", height: "32px", background: "rgba(0,195,255,0.08)", border: "1px solid rgba(0,195,255,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>📋</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", color: "#e8eaf0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {audit.originalInput.slice(0, 90)}{audit.originalInput.length > 90 ? "…" : ""}
                </div>
                <div style={{ fontSize: "11.5px", color: "#5a6070", marginTop: "3px" }}>
                  {new Date(audit.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
