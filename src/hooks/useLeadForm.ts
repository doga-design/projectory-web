import { useState } from 'react';
import { submitLead, type LeadRequest, type LeadResult } from '@/lib/leads';

/**
 * Shared by the lead forms: sends through /api/lead-form (email backup) and holds the
 * honeypot's value. Render `<HoneypotField {...honeypotProps} />` inside the form.
 */
export function useLeadForm() {
  // When the form first rendered; the time it was open is sent so the server can drop
  // submissions faster than a person could type. performance.now() is steady, unlike the
  // wall clock, which can jump if the computer's time is adjusted.
  const [openedAt] = useState(() => performance.now());
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);

  async function send(request: LeadRequest): Promise<LeadResult> {
    setSending(true);
    try {
      return await submitLead(request, {
        elapsedMs: Math.round(performance.now() - openedAt),
        honeypot,
      });
    } finally {
      setSending(false);
    }
  }

  const honeypotProps = { value: honeypot, onChange: setHoneypot };

  return { send, sending, honeypotProps };
}
