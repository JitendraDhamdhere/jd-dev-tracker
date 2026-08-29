import { NextRequest, NextResponse } from "next/server";
import { calculateResumeJobMatch } from "@/lib/geminiService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobTitle, requiredSkills, candidateSkills, candidateRole, experienceRequired } = body;

    const result = await calculateResumeJobMatch({
      jobTitle: jobTitle || "Software Engineer",
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      candidateSkills: Array.isArray(candidateSkills) ? candidateSkills : [],
      candidateRole: candidateRole || "Software Developer",
      experienceRequired: experienceRequired || null,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
