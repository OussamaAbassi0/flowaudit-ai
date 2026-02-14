// app/api/download-workflow/route.ts
// Accepts base64-encoded workflow JSON via POST form,
// returns it as a downloadable .json file.

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const encoded  = formData.get("workflowJson") as string;
  const auditId  = formData.get("auditId") as string;

  if (!encoded) {
    return NextResponse.json({ error: "Missing workflow data" }, { status: 400 });
  }

  const json = Buffer.from(encoded, "base64").toString("utf-8");
  const filename = `flowaudit-workflow-${auditId.slice(-8)}.json`;

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
