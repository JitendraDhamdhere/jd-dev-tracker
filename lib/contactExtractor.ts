/**
 * Deterministic Contact Extractor
 * Extracts Emails, Phone numbers, WhatsApp indicators, and URLs using regular expressions.
 */

export interface ExtractedContacts {
  emails: string[];
  phones: string[];
  primaryEmail: string | null;
  primaryPhone: string | null;
  whatsappNumber: string | null;
  isWhatsAppDetected: boolean;
  urls: string[];
}

// RFC 5322 compatible email pattern
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// Phone regex matching international & national formats (+91 98765 43210, +1 (555) 019-2834, 9876543210, etc.)
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}\b/g;

// WhatsApp intent detection keywords in job posts
const WHATSAPP_INTENT_PATTERNS = [
  /send\s+(?:your\s+)?(?:resume|cv|profile)\s+(?:on|to|via)\s+whatsapp/i,
  /whatsapp\s+(?:us|me|at|to|number)/i,
  /contact\s+(?:us\s+)?via\s+whatsapp/i,
  /whatsapp\s*[:\-]/i,
  /share\s+(?:cv|resume)\s+on\s+whatsapp/i,
  /apply\s+(?:via|on)\s+whatsapp/i,
  /ping\s+(?:on|via)\s+whatsapp/i,
  /\bwhatsapp\b/i,
];

// URL regex
const URL_REGEX = /https?:\/\/[^\s<>"'`)]+/gi;

/**
 * Normalizes phone numbers for WhatsApp wa.me links
 * e.g., "+91 98765 43210" -> "919876543210"
 * "+1 (212) 555-0199" -> "12125550199"
 * "9876543210" (10 digits) -> "919876543210" (common fallback when no country code specified)
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return "";
  // Strip all non-digit characters
  let digits = rawPhone.replace(/\D/g, "");

  // If 10 digits and starts with 6, 7, 8, or 9 (standard Indian mobile format without +91)
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    digits = "91" + digits;
  }

  return digits;
}

/**
 * Validates whether an extracted string is actually a plausible phone number
 * (Filters out dates like 2026-08-30, small IDs, years, etc.)
 */
function isValidPhone(candidate: string): boolean {
  const digitsOnly = candidate.replace(/\D/g, "");
  // Phone numbers usually have 10 to 15 digits
  if (digitsOnly.length < 10 || digitsOnly.length > 15) return false;

  // Filter out date-like strings e.g. 2026-08-30
  if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(candidate.trim())) return false;

  // Filter out repeated single digit (e.g. 0000000000, 9999999999)
  if (/^(\d)\1+$/.test(digitsOnly)) return false;

  return true;
}

/**
 * Extract all contact information deterministically from job text
 */
export function extractContactsFromText(text: string): ExtractedContacts {
  if (!text || typeof text !== "string") {
    return {
      emails: [],
      phones: [],
      primaryEmail: null,
      primaryPhone: null,
      whatsappNumber: null,
      isWhatsAppDetected: false,
      urls: [],
    };
  }

  // 1. Extract Emails
  const rawEmails = text.match(EMAIL_REGEX) || [];
  // Deduplicate and clean
  const emails = Array.from(new Set(rawEmails.map((e) => e.trim().toLowerCase())));

  // Prioritize recruiter / HR emails
  const hrEmail = emails.find((e) =>
    /(?:hr|career|careers|jobs|recruitment|talent|hiring)/i.test(e)
  );
  const primaryEmail = hrEmail || emails[0] || null;

  // 2. Extract Phone Numbers
  const rawPhones = text.match(PHONE_REGEX) || [];
  const validPhones: string[] = [];
  const seenDigits = new Set<string>();

  for (const raw of rawPhones) {
    const cleaned = raw.trim();
    const digits = cleaned.replace(/\D/g, "");
    if (isValidPhone(cleaned) && !seenDigits.has(digits)) {
      seenDigits.add(digits);
      validPhones.push(cleaned);
    }
  }

  const primaryPhone = validPhones[0] || null;

  // 3. WhatsApp Intent Detection
  const hasWhatsAppIntent = WHATSAPP_INTENT_PATTERNS.some((pattern) => pattern.test(text));

  let whatsappNumber: string | null = null;
  let isWhatsAppDetected = false;

  if (primaryPhone && hasWhatsAppIntent) {
    whatsappNumber = normalizePhoneNumber(primaryPhone);
    isWhatsAppDetected = true;
  }

  // 4. Extract URLs
  const rawUrls = text.match(URL_REGEX) || [];
  const urls = Array.from(new Set(rawUrls.map((u) => u.trim())));

  return {
    emails,
    phones: validPhones,
    primaryEmail,
    primaryPhone,
    whatsappNumber,
    isWhatsAppDetected,
    urls,
  };
}
