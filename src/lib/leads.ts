// Sends a website lead to /api/lead-form, which creates it in Pipedrive (see api/lead-form.cjs).
//
// If that can't happen (the endpoint is down, Pipedrive is failing, or it isn't configured
// yet), the same submission goes out the old way, as a Web3Forms email, so no lead is ever
// lost. Only a definite "this input is invalid" answer skips the backup.

import { submitToWeb3Forms } from '@/lib/web3forms';
import { getLeadContext } from '@/lib/visitorContext';

type LeadForm = 'contact' | 'estimate' | 'intro-deck' | 'partner-application';

export type LeadResult = { ok: true } | { ok: false; fieldErrors?: Record<string, string> };

export type LeadRequest = {
  form: LeadForm;
  fields: Record<string, unknown>;
  /** The Web3Forms payload for this form, sent only if Pipedrive can't take the lead. */
  fallback: Record<string, unknown>;
  /** True for forms that live inside another page (footer, partner overlay). */
  embedded?: boolean;
};

/** How long the form was open (measured in the browser) and the hidden honeypot's value. */
type SpamSignals = { elapsedMs: number; honeypot: string };

async function sendByEmail(payload: Record<string, unknown>): Promise<LeadResult> {
  try {
    const { response, result } = await submitToWeb3Forms(payload);
    if (response.ok && result.success !== false) {
      console.warn('Lead sent by the email backup (Pipedrive was unavailable).');
      return { ok: true };
    }
  } catch {
    // Both paths failed; the form shows its error message.
  }
  return { ok: false };
}

export async function submitLead(
  { form, fields, fallback, embedded = false }: LeadRequest,
  { elapsedMs, honeypot }: SpamSignals
): Promise<LeadResult> {
  try {
    const response = await fetch('/api/lead-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form,
        fields,
        context: getLeadContext({ embedded }),
        elapsedMs,
        honeypot,
      }),
    });
    const body = await response.json().catch(() => ({}));
    // Only an explicit { ok: true } counts as delivered.
    if (response.ok && body.ok === true) return { ok: true };
    if (response.status === 400) return { ok: false, fieldErrors: body.fieldErrors };
  } catch {
    // Network error: use the backup below.
  }
  return sendByEmail(fallback);
}

/** First validation message from the server, if any, for the form's status line. */
export function fieldErrorMessage(result: LeadResult): string | undefined {
  if (result.ok || !result.fieldErrors) return undefined;
  return Object.values(result.fieldErrors)[0];
}
