import { NextRequest, NextResponse } from "next/server";
import { generatePersonalizedMessage } from "@/lib/geminiService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      jobTitle,
      companyName,
      requiredSkills,
      candidateName,
      candidateRole,
      candidateSkills,
      candidateExperience,
      recruiterName,
      platform,
    } = body;

    if (!jobTitle || !companyName || !candidateName) {
      return NextResponse.json(
        { error: "Missing required fields: jobTitle, companyName, and candidateName are required." },
        { status: 400 }
      );
    }

    const result = await generatePersonalizedMessage({
      jobTitle,
      companyName,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      candidateName,
      candidateRole: candidateRole || "Software Developer",
      candidateSkills: Array.isArray(candidateSkills) ? candidateSkills : [],
      candidateExperience: candidateExperience || undefined,
      recruiterName: recruiterName || null,
      platform: platform === "whatsapp" ? "whatsapp" : "email",
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes("AI quota has been reached")) {
      return NextResponse.json(
        { error: "AI quota has been reached. Please try again later." },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
