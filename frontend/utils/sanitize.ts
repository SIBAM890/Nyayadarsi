/**
 * Input sanitization utility.
 * Strips potentially dangerous HTML/script content from user input
 * before sending to the API.
 */

const DANGEROUS_TAGS = /<\s*\/?\s*(script|iframe|object|embed|form|link|style|meta|base)\b[^>]*>/gi;
const EVENT_HANDLERS = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_URLS = /javascript\s*:/gi;
const DATA_URLS = /data\s*:\s*text\/html/gi;

/**
 * Sanitize user-provided text input by stripping dangerous HTML patterns.
 * Does NOT perform full HTML sanitization — this is a defensive layer
 * for text inputs that should not contain HTML at all.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(DANGEROUS_TAGS, '')
    .replace(EVENT_HANDLERS, '')
    .replace(JAVASCRIPT_URLS, '')
    .replace(DATA_URLS, '')
    .trim();
}
