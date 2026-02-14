"use client";
// app/dashboard/sidebar.tsx

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard",         label: "Overview",  emoji: "📊" },
  { href: "/dashboard/audit",   label: "New Audit", emoji: "⚡" },
  { href: "/dashboard/history", label: "History",   emoji: "📋" },
];

interface Props {
  firstName: string;
  lastName: string;
  email: string;
}

export function DashboardSidebar({ firstName, lastName, email }: Props) {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "220px",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(13,15,23,0.8)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      height: "100vh",
    }}>
      <style>{`
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px; border-radius: 8px;
          font-size: 13.5px; color: #8a90a0;
          text-decoration: none; margin-bottom: 2px;
          transition: all .15s; border: 1px solid transparent;
        }
        .nav-item:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .nav-item.active {
          color: #fff; background: rgba(0,195,255,0.1);
          border-color: rgba(0,195,255,0.15);
        }

        /* Make the Clerk UserButton avatar larger and visible */
        .cl-userButtonAvatarBox {
          width: 34px !important;
          height: 34px !important;
        }
        .cl-userButtonTrigger {
          width: 34px !important;
          height: 34px !important;
        }

        /* User section hover */
        .user-section {
          padding: 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background .15s;
          cursor: pointer;
          position: relative;
        }
        .user-section:hover {
          background: rgba(255,255,255,0.04);
        }

        /* Sign out hint */
        .user-hint {
          font-size: 10px;
          color: #5a6070;
          margin-top: 1px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:"9px",padding:"18px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{width:"28px",height:"28px",background:"#00c3ff",borderRadius:"7px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 14px rgba(0,195,255,0.3)",flexShrink:0}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span style={{fontSize:"13.5px",fontWeight:600,color:"#fff",letterSpacing:"-0.01em"}}>FlowAudit AI</span>
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:"12px"}}>
        {NAV_ITEMS.map(({ href, label, emoji }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} className={`nav-item${isActive ? " active" : ""}`}>
              <span>{emoji}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section — clicking the avatar opens Clerk's menu with sign out */}
      <div className="user-section">
        {/* UserButton with afterSignOutUrl and account management */}
        <UserButton
          afterSignOutUrl="/"
          showName={false}
          appearance={{
            elements: {
              avatarBox: {
                width: "34px",
                height: "34px",
              },
            },
          }}
          userProfileMode="navigation"
          userProfileUrl="/dashboard/account"
        />

        <div style={{minWidth:0,flex:1}}>
          <div style={{fontSize:"12px",fontWeight:500,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {firstName || "My Account"} {lastName}
          </div>
          <div className="user-hint">
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"120px"}}>
              {email}
            </span>
          </div>
        </div>

        {/* Chevron hint */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5a6070" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>

      {/* Separate visible sign-out button below */}
      <SignOutButton />

    </aside>
  );
}

// Standalone sign-out button using Clerk's useClerk hook
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <button
      onClick={() => signOut(() => router.push("/"))}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        padding: "12px 16px",
        background: "transparent",
        border: "none",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        color: "#5a6070",
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all .15s",
        fontFamily: "inherit",
        textAlign: "left",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = "#ef4444";
        e.currentTarget.style.background = "rgba(239,68,68,0.06)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = "#5a6070";
        e.currentTarget.style.background = "transparent";
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Sign out
    </button>
  );
}
