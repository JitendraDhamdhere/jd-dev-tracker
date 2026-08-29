import { NextRequest, NextResponse } from "next/server";
import { extractContactsFromText } from "@/lib/contactExtractor";
import { analyzeJobPostWithGemini } from "@/lib/geminiService";
import { StructuredJobData } from "@/lib/jobApplicationTypes";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let jobText = "";
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const textFromForm = formData.get("text") as string | null;

      if (file && file.size > 0) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "File size exceeds the 10 MB limit. Please upload a smaller file." },
            { status: 400 }
          );
        }

        const mime = file.type || "";
        const ext = file.name.split(".").pop()?.toLowerCase();

        const isPdf = mime === "application/pdf" || ext === "pdf";
        const isImage =
          ALLOWED_MIME_TYPES.includes(mime) ||
          ["png", "jpg", "jpeg", "webp"].includes(ext || "");

        if (!isPdf && !isImage) {
          return NextResponse.json(
            { error: "Unsupported file type. Please upload PNG, JPG, WEBP or PDF." },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (isPdf) {
          try {
            // Local server-side PDF text extraction
            const pdfModule = await import("pdf-parse");
            const PDFClass = pdfModule.PDFParse || (pdfModule as unknown as { default: unknown }).default || pdfModule;

            let extracted = "";
            if (typeof PDFClass === "function") {
              try {
                const parser = new (PDFClass as any)({ data: buffer });
                if (typeof parser.getText === "function") {
                  const textRes = await parser.getText();
                  extracted = typeof textRes === "string" ? textRes : (textRes?.text || "");
                }
                if (typeof parser.destroy === "function") {
                  await parser.destroy();
                }
              } catch (classErr) {
                if (typeof pdfModule === "function") {
                  const legacyRes = await (pdfModule as any)(buffer);
                  extracted = legacyRes?.text || "";
                }
              }
            } else if (typeof pdfModule === "function") {
              const legacyRes = await (pdfModule as any)(buffer);
              extracted = legacyRes?.text || "";
            }

            jobText = extracted;
            if (!jobText.trim()) {
              return NextResponse.json(
                {
                  error:
                    "Could not extract readable text from this PDF (it may be a scanned document). Please paste the job text directly.",
                },
                { status: 422 }
              );
            }
          } catch (pdfErr) {
            console.error("PDF parse error:", pdfErr);
            return NextResponse.json(
              {
                error:
                  "Failed to read this PDF file. Please ensure it is not password-protected or try pasting the text.",
              },
              { status: 422 }
            );
          }
        } else if (isImage) {
          imageBase64 = buffer.toString("base64");
          imageMimeType = mime.startsWith("image/") ? mime : `image/${ext === "jpg" ? "jpeg" : ext}`;
        }
      } else if (textFromForm && textFromForm.trim()) {
        jobText = textFromForm.trim();
      }
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      jobText = body.text ? String(body.text).trim() : "";
      if (body.imageBase64 && body.imageMimeType) {
        imageBase64 = body.imageBase64;
        imageMimeType = body.imageMimeType;
      }
    }

    if (!jobText && !imageBase64) {
      return NextResponse.json(
        { error: "Please paste a job description or upload a job post file." },
        { status: 400 }
      );
    }

    // Step 1: Extract contacts deterministically if text is available
    const deterministicContacts = jobText
      ? extractContactsFromText(jobText)
      : {
          emails: [],
          phones: [],
          primaryEmail: null,
          primaryPhone: null,
          whatsappNumber: null,
          isWhatsAppDetected: false,
          urls: [],
        };

    // Step 2: Use Gemini 2.5 Flash for semantic analysis
    let analyzedData: StructuredJobData;
    try {
      analyzedData = await analyzeJobPostWithGemini({
        text: jobText,
        imageBase64,
        imageMimeType,
      });
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

    // Step 3: Merge deterministic contacts with Gemini structured data
    // Deterministic parsing takes precedence for emails & verified phone numbers
    const finalEmail = deterministicContacts.primaryEmail || analyzedData.email || null;
    const finalPhone = deterministicContacts.primaryPhone || analyzedData.phone || null;
    const finalWhatsApp = deterministicContacts.whatsappNumber || analyzedData.whatsapp || null;

    const result: StructuredJobData = {
      ...analyzedData,
      email: finalEmail,
      phone: finalPhone,
      whatsapp: finalWhatsApp,
      source_url: deterministicContacts.urls[0] || analyzedData.source_url || null,
    };

    return NextResponse.json({
      success: true,
      data: result,
      contacts: deterministicContacts,
      rawText: jobText || undefined,
    });
  } catch (error) {
    console.error("Analysis API exception:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing the job post." },
      { status: 500 }
    );
  }
}
