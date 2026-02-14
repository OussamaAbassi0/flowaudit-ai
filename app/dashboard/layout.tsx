// app/dashboard/layout.tsx — Server Component
// Fetches user server-side, passes data to the client sidebar.

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "./sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <div style={{display:"flex",height:"100vh",background:"#08090d",color:"#e8eaf0",fontFamily:"ui-sans-serif,system-ui,sans-serif"}}>
      <DashboardSidebar
        firstName={user.firstName ?? ""}
        lastName={user.lastName ?? ""}
        email={user.emailAddresses[0]?.emailAddress ?? ""}
      />
      <main style={{flex:1,overflowY:"auto"}}>{children}</main>
    </div>
  );
}
