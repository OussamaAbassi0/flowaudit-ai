// app/api/generate-audit/route.ts
// Generates audit with OpenAI, upserts User (no webhook needed),
// saves Audit to DB, returns result.

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { db } from "@/lib/db";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_FREE_AUDITS = 3; // شحال من محاولة فابور بغينا نعطيو

const SYSTEM_PROMPT = `You are FlowAudit AI, a world-class n8n Automation Architect and Business Process Analyst.

Analyze the described manual business process and return ONLY valid JSON (no markdown, no explanation, just raw JSON).

Return this exact structure:
{
  "analysis": "A full markdown report with these sections: ## Process Overview, ## Bottlenecks Identified, ## Automation Opportunities, ## Time & Cost Savings Estimate, ## Recommended n8n Solution",
  "n8nWorkflow": {
    "name": "Workflow name here",
    "nodes": [
      {
        "id": "uuid-here",
        "name": "Node Display Name",
        "type": "n8n-nodes-base.nodeType",
        "typeVersion": 1,
        "position": [250, 300],
        "parameters": {}
      }
    ],
    "connections": {
      "Node Display Name": {
        "main": [[{ "node": "Next Node Name", "type": "main", "index": 0 }]]
      }
    },
    "active": false,
    "settings": { "executionOrder": "v1" }
  }
}

NODE TYPE MAPPING — use these exact type strings:
- Facebook Lead Ads trigger: n8n-nodes-base.facebookLeadAdsTrigger
- Gmail trigger: n8n-nodes-base.gmailTrigger
- Gmail send/read: n8n-nodes-base.gmail
- Google Sheets: n8n-nodes-base.googleSheets
- Google Drive: n8n-nodes-base.googleDrive
- Google Calendar: n8n-nodes-base.googleCalendar
- Slack send: n8n-nodes-base.slack
- Slack trigger: n8n-nodes-base.slackTrigger
- HubSpot: n8n-nodes-base.hubspot
- Salesforce: n8n-nodes-base.salesforce
- Notion: n8n-nodes-base.notion
- Airtable: n8n-nodes-base.airtable
- Trello: n8n-nodes-base.trello
- Jira: n8n-nodes-base.jira
- Asana: n8n-nodes-base.asana
- Typeform trigger: n8n-nodes-base.typeformTrigger
- Webhook: n8n-nodes-base.webhook
- Schedule trigger: n8n-nodes-base.scheduleTrigger
- HTTP Request: n8n-nodes-base.httpRequest
- If / condition: n8n-nodes-base.if
- Code (JS): n8n-nodes-base.code
- Set / transform: n8n-nodes-base.set
- Email SMTP: n8n-nodes-base.emailSend
- Shopify: n8n-nodes-base.shopify
- Stripe: n8n-nodes-base.stripe
- Twilio SMS: n8n-nodes-base.twilio

WORKFLOW CONSTRUCTION RULES:
1. ALWAYS start with exactly ONE trigger node at position [250, 300]
2. Place subsequent nodes at [500,300], [750,300], [1000,300], [1250,300]
3. Use node NAMES (not IDs) in the connections object keys and targets
4. The last node does NOT need a connections entry
5. End with a Slack or email notification node
6. Credentials: { "id": "REPLACE_WITH_CREDENTIAL_ID", "name": "My [Tool] Account" }
7. Generate a random UUID v4 string for each node id

ANALYSIS REPORT RULES:
- Write in professional B2B tone
- Be specific about the tools mentioned in the user's description
- Include concrete time estimates (hrs/week saved) and dollar value at $50/hr
- Keep each section focused and actionable`;

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check (Clerk v6 — must await) ──────────────────
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // ── 2. Validate input ──────────────────────────────────────
    const body = await req.json();
    const userInput = (body.input ?? "").trim();

    if (userInput.length < 50) {
      return NextResponse.json(
        { success: false, error: "Please describe your process in more detail (at least 50 characters)." },
        { status: 400 }
      );
    }
    if (userInput.length > 5000) {
      return NextResponse.json(
        { success: false, error: "Input too long. Please keep under 5,000 characters." },
        { status: 400 }
      );
    }

    // ── 3. Upsert user in DB ───────────────────────────────────
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${clerkId}@unknown.com`;

    const dbUser = await db.user.upsert({
      where: { clerkId },
      update: { email },
      create: { clerkId, email },
    });

    // ── 4. 🚨 BUSINESS LOGIC: CHECK FREE TIER vs PRO 🚨 ──────────
    // كنجيبو شحال من Audit ديجا صاوب هاد الكليان
    const userAuditsCount = await db.audit.count({
      where: { userId: dbUser.id }
    });

    // كنتأكدو واش عندو اشتراك Pro صالح (تاريخ النهاية باقي ماوصلش)
    const isPro = dbUser.stripePriceId && 
                  dbUser.stripeCurrentPeriodEnd && 
                  dbUser.stripeCurrentPeriodEnd.getTime() > Date.now();

    // يلا ماكانش Pro، وفات 3 دالمحاولات الفابور، كنحبسوه!
    if (!isPro && userAuditsCount >= MAX_FREE_AUDITS) {
      return NextResponse.json(
        { 
          success: false, 
          error: "You have reached your limit of free audits. Please upgrade to Pro to generate more.",
          requiresUpgrade: true // هادي غنستعملوها فالفرونتاند باش نطلعو ليه البوب-أب ديال الدفع
        },
        { status: 403 }
      );
    }

    // ── 5. Call OpenAI ─────────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: isPro ? "gpt-4o" : "gpt-4o-mini", // يلا كان برو نعطيوه الذكاء الواعر، يلا فابور نعطيوه الميني باش نقتصضو الفلوس
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this business process and return the JSON response:\n\n${userInput}`,
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) throw new Error("Empty response from OpenAI");

    let parsed: { analysis: string; n8nWorkflow: object };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      console.error("JSON parse error:", rawContent.slice(0, 300));
      throw new Error("Invalid JSON returned by AI");
    }

    if (!parsed.analysis || !parsed.n8nWorkflow) {
      throw new Error("AI response missing required fields");
    }

    // ── 6. Save audit to database ──────────────────────────────
    const audit = await db.audit.create({
      data: {
        userId:          dbUser.id,
        originalInput:   userInput,
        analysisReport:  parsed.analysis,
        n8nWorkflowJson: parsed.n8nWorkflow,
      },
    });

    console.log(`✅ Audit saved: ${audit.id} for user ${dbUser.email}. Total Audits: ${userAuditsCount + 1}`);

    // ── 7. Return result ───────────────────────────────────────
    return NextResponse.json({
      success: true,
      data: {
        analysis:    parsed.analysis,
        n8nWorkflow: parsed.n8nWorkflow,
        auditId:     audit.id,
      },
    });

  } catch (error) {
    console.error("=== Generate Audit Error ===", error);
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("rate_limit") || message.includes("429")) {
      return NextResponse.json({ success: false, error: "AI service is busy. Please try again in a moment." }, { status: 429 });
    }
    if (message.includes("insufficient_quota") || message.includes("billing")) {
      return NextResponse.json({ success: false, error: "OpenAI quota exceeded. Please check your API billing." }, { status: 402 });
    }
    if (message.includes("Incorrect API key")) {
      return NextResponse.json({ success: false, error: "Invalid OpenAI API key. Check your .env.local file." }, { status: 500 });
    }

    return NextResponse.json(
      { success: false, error: `Failed to generate audit: ${message}` },
      { status: 500 }
    );
  }
}