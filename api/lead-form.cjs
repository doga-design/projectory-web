/**
 * Vercel Serverless Function: Website Lead Form → Pipedrive
 *
 * Receives the website's lead forms (Contact, Estimate request, footer Intro
 * deck, Partners page Apply overlay) and records each one in Pipedrive:
 *   1. drops spam (hidden honeypot field filled, or filled in too fast)
 *   2. validates the form
 *   3. organization: reuses one with the exact company name, else creates it
 *   4. person: reuses one with the exact email, else creates them
 *   5. creates a lead in the Leads Inbox, with custom fields
 *   6. pins a note with the message and where the visitor came from
 *
 * If this function can't deliver (not configured, Pipedrive down, bad token),
 * the browser sends the old Web3Forms email instead (src/lib/leads.ts), so no
 * lead is lost.
 *
 * Environment Variables Required (Vercel project settings; never in code):
 * - PIPEDRIVE_COMPANY_DOMAIN: the "yourcompany" in yourcompany.pipedrive.com
 * - PIPEDRIVE_API_TOKEN: Pipedrive API token; new leads are owned by its user
 *
 * The custom fields in FIELDS must exist in the Pipedrive account: run
 * `npm run setup:pipedrive` (scripts/setup-pipedrive.cjs, which reads FIELDS
 * from this file) once per account.
 *
 * Routes:
 * POST /api/lead-form body { form, fields, context, elapsedMs, honeypot }
 *   → 200 { ok: true }
 *   → 400 { ok: false, code: "invalid", fieldErrors } | { code: "invalid_json" }
 *   → 405 { ok: false, code: "method_not_allowed" }
 *   → 503 { ok: false, code: "not_configured" }  (browser uses the email)
 *   → 502 { ok: false, code: "pipedrive_error" }  (browser uses the email)
 */

// ── Forms and custom fields ──────────────────────────────────────────────────

const FORM_LABELS = {
  contact: "Contact",
  estimate: "Estimate",
  "intro-deck": "Intro deck",
  "partner-application": "Partner application",
};

const PARTNER_PROGRAMS = ["Refer", "Resell", "Trade"];
const REGISTER_A_DEAL = "Register a Deal";

// Leads share Pipedrive's deal fields. Found by name at runtime, so any account
// works once scripts/setup-pipedrive.cjs has created them.
const FIELDS = [
  {
    id: "websiteForm",
    name: "Website form",
    type: "enum",
    options: Object.values(FORM_LABELS),
  },
  {
    id: "partnerProgram",
    name: "Partner program",
    type: "enum",
    options: [...PARTNER_PROGRAMS, REGISTER_A_DEAL],
  },
  { id: "eventDate", name: "Event date", type: "date" },
  // Address type to match the "Event location" field the team already uses.
  { id: "eventLocation", name: "Event location", type: "address" },
  { id: "products", name: "Products of interest", type: "text" },
  { id: "experienceType", name: "Experience type", type: "varchar" },
  { id: "objectives", name: "Objectives", type: "text" },
  { id: "seating", name: "Seating", type: "varchar" },
  { id: "utmSource", name: "UTM source", type: "varchar" },
  { id: "utmMedium", name: "UTM medium", type: "varchar" },
  { id: "utmCampaign", name: "UTM campaign", type: "varchar" },
  { id: "landingPage", name: "Landing page", type: "varchar" },
  { id: "referrer", name: "Referrer", type: "varchar" },
  { id: "sourcePage", name: "Source page", type: "varchar" },
];

// Where the visitor came from (sent by src/lib/visitorContext.ts). Every key is
// listed in the note; keys that match a FIELDS id also fill that field.
const CONTEXT = [
  { key: "utmSource", label: "UTM source" },
  { key: "utmMedium", label: "UTM medium" },
  { key: "utmCampaign", label: "UTM campaign" },
  { key: "utmTerm", label: "UTM term" },
  { key: "utmContent", label: "UTM content" },
  { key: "sourcePage", label: "Source page" },
  { key: "landingPage", label: "Landing page" },
  { key: "referrer", label: "Referrer" },
];

const MIN_FILL_MS = 1000;
const FIELD_CACHE_MS = 10 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ── Pipedrive API ────────────────────────────────────────────────────────────
// Auth is the x-api-token header, never a URL parameter. Persons, organizations
// and search use API v2; leads and notes use v1 (they have no v2 yet).

function getConfig() {
  const domain = (process.env.PIPEDRIVE_COMPANY_DOMAIN || "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\.pipedrive\.com.*$/, "");
  const token = (process.env.PIPEDRIVE_API_TOKEN || "").trim();
  return domain && token ? { domain, token } : null;
}

async function pipedrive(config, method, path, body) {
  const url = `https://${config.domain}.pipedrive.com/api${path}`;
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, {
      method,
      headers: {
        "x-api-token": config.token,
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    // Rate limited: wait briefly (capped, to stay well inside the function's
    // time limit) and retry once.
    if (response.status === 429 && attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      continue;
    }

    const json = await response.json().catch(() => null);
    if (!response.ok || !json || json.success === false) {
      const reason = [json && json.error, json && json.error_info]
        .filter(Boolean)
        .join(" — ");
      throw new Error(
        `${method} ${path.split("?")[0]} → HTTP ${response.status} ${reason}`
      );
    }
    return json;
  }
}

async function listDealFields(config) {
  const fields = [];
  let cursor;
  do {
    const page = await pipedrive(
      config,
      "GET",
      `/v2/dealFields?limit=500${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`
    );
    fields.push(...page.data);
    cursor = page.additional_data && page.additional_data.next_cursor;
  } while (cursor);
  return fields.filter((f) => f.is_custom_field);
}

// Field keys differ per account, so they're looked up by name and cached.
let fieldCache = null;

async function getFieldMap(config) {
  if (fieldCache && Date.now() - fieldCache.at < FIELD_CACHE_MS) {
    return fieldCache.map;
  }
  const byName = new Map(
    (await listDealFields(config)).map((f) => [
      f.field_name.trim().toLowerCase(),
      f,
    ])
  );
  const map = {};
  for (const spec of FIELDS) {
    const field = byName.get(spec.name.toLowerCase());
    if (!field || field.field_type !== spec.type) continue;
    map[spec.id] = {
      key: field.field_code,
      type: field.field_type,
      options: Object.fromEntries(
        (field.options || []).map((o) => [
          String(o.label).toLowerCase(),
          Number(o.id),
        ])
      ),
    };
  }
  fieldCache = { at: Date.now(), map };
  return map;
}

/** { fieldId: value } → { "<field key>": value }, skipping unknown ones. */
function buildCustomFields(map, values) {
  const payload = {};
  for (const [id, raw] of Object.entries(values)) {
    const field = map[id];
    const value = Array.isArray(raw) ? raw.join(", ") : raw;
    if (!field || !value) continue;
    if (field.type === "enum") {
      const optionId = field.options[String(value).toLowerCase()];
      if (optionId !== undefined) payload[field.key] = optionId;
    } else {
      const max = field.type === "text" ? 5000 : 255;
      payload[field.key] = String(value).slice(0, max);
    }
  }
  return payload;
}

async function findOrCreateOrganization(config, name) {
  const found = await pipedrive(
    config,
    "GET",
    `/v2/organizations/search?term=${encodeURIComponent(name)}&fields=name&exact_match=true&limit=1`
  );
  const match = found.data.items[0] && found.data.items[0].item;
  if (match) return { id: match.id, name: match.name };
  const created = await pipedrive(config, "POST", "/v2/organizations", {
    name,
  });
  return { id: created.data.id, name: created.data.name };
}

async function findOrCreatePerson(config, { name, email, phone }, orgId) {
  const found = await pipedrive(
    config,
    "GET",
    `/v2/persons/search?term=${encodeURIComponent(email)}&fields=email&exact_match=true&limit=1`
  );
  const match = found.data.items[0] && found.data.items[0].item;
  if (match) return { id: match.id };
  const created = await pipedrive(config, "POST", "/v2/persons", {
    name,
    emails: [{ value: email, primary: true, label: "work" }],
    ...(phone && { phones: [{ value: phone, primary: true, label: "work" }] }),
    ...(orgId && { org_id: orgId }),
  });
  return { id: created.data.id };
}

// ── Reading a submission ─────────────────────────────────────────────────────

const isRecord = (v) =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const strList = (v, maxItems) =>
  (Array.isArray(v) ? v : [])
    .map((item) => str(item, 100))
    .filter(Boolean)
    .slice(0, maxItems);

/** Returns why a submission looks automated, or null. */
function spamReason(body) {
  if (!isRecord(body)) return null;

  const trap =
    typeof body.honeypot === "string" ? body.honeypot.trim().toLowerCase() : "";
  if (trap) {
    // Autofill and password managers sometimes copy a value the person typed
    // (usually their email) into hidden inputs. Only a value that appears
    // nowhere else in the form counts as a bot.
    const typed = Object.values(isRecord(body.fields) ? body.fields : {})
      .filter((v) => typeof v === "string")
      .map((v) => v.trim().toLowerCase());
    if (!typed.includes(trap)) return "honeypot";
  }

  // Measured by the browser itself, so a wrong visitor clock can't matter.
  const elapsed = Number(body.elapsedMs);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return "too fast";
  return null;
}

/** Validates the form. Returns { submission } or { fieldErrors }. */
function readSubmission(body) {
  if (!isRecord(body) || !FORM_LABELS[body.form] || !isRecord(body.fields)) {
    return { fieldErrors: { form: "Unknown form." } };
  }
  const { form, fields } = body;
  const errors = {};

  const email = str(fields.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email.";
  // The footer intro-deck form only asks for an email; Pipedrive needs a name.
  const name = form === "intro-deck" ? email : str(fields.name, 120);
  if (!name) errors.name = "Please enter your name.";

  const message = str(fields.message, 5000);
  if (!message && (form === "contact" || form === "partner-application")) {
    errors.message = "Please enter a message.";
  }

  let program;
  if (form === "partner-application") {
    program = PARTNER_PROGRAMS.find((p) => p === fields.program);
    if (!program) errors.program = "Please pick a program.";
  } else if (form === "contact" && fields.source === "register-deal") {
    // The Partners page "Register a Deal" link adds ?source=register-deal.
    program = REGISTER_A_DEAL;
  }

  const eventDate = str(fields.eventDate, 10);
  if (
    eventDate &&
    (!DATE_RE.test(eventDate) || Number.isNaN(Date.parse(eventDate)))
  ) {
    errors.eventDate = "Please enter a valid date.";
  }

  if (Object.keys(errors).length) return { fieldErrors: errors };

  const finder = isRecord(fields.finder) ? fields.finder : {};
  const context = {};
  if (isRecord(body.context)) {
    for (const { key } of CONTEXT) {
      const value = str(body.context[key], 500);
      if (value) context[key] = value;
    }
  }

  return {
    submission: {
      form,
      person: { name, email, phone: str(fields.phone, 40) },
      company: str(fields.company, 120),
      program,
      message,
      eventDate,
      eventLocation: str(fields.eventLocation, 200),
      products: strList(fields.products, 30),
      experience: strList(finder.type, 10),
      objectives: strList(finder.objectives, 20),
      seating: strList(finder.seating, 10),
      context,
    },
  };
}

// ── What gets written to Pipedrive ───────────────────────────────────────────

function leadTitle(s, orgName) {
  const who = orgName || s.person.name;
  if (s.form === "estimate") {
    return `Estimate request — ${s.person.name} (${s.eventDate || "date TBD"})`;
  }
  if (s.form === "intro-deck") return `Intro deck request — ${s.person.email}`;
  if (s.form === "partner-application") {
    return `Partner application (${s.program}) — ${who}`;
  }
  if (s.program === REGISTER_A_DEAL) return `Deal registration — ${who}`;
  return `Contact form — ${who}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Note HTML. Every value is escaped; empty sections are left out. */
function noteHtml(s) {
  const intro = {
    contact:
      s.program === REGISTER_A_DEAL
        ? "Deal registration submitted through the website contact form."
        : "Contact form submitted on the website.",
    estimate: "Estimate request submitted on the website.",
    "intro-deck":
      "Requested the Projectory intro deck from the website footer.",
    "partner-application": "Partner application submitted on the website.",
  }[s.form];

  const sections = [
    { heading: "Message", body: s.message },
    {
      heading: "Details",
      items: [
        ["Partner program", s.program],
        ["Phone", s.person.phone],
        ["Company", s.company],
      ],
    },
    {
      heading: "Event",
      items: [
        ["Date", s.eventDate],
        ["Location", s.eventLocation],
      ],
    },
    {
      heading: "Products they picked",
      items: s.products.map((p) => ["Product", p]),
    },
    {
      heading: "Product Finder answers",
      items: [
        ["Experience", s.experience.join(", ")],
        ["Objectives", s.objectives.join(", ")],
        ["Seating", s.seating.join(", ")],
      ],
    },
    {
      heading: "Where they came from",
      items: CONTEXT.map(({ key, label }) => [label, s.context[key]]),
    },
  ];

  const html = [`<p>${escapeHtml(intro)}</p>`];
  for (const section of sections) {
    const items = (section.items || []).filter(([, value]) => value);
    if (!section.body && items.length === 0) continue;
    html.push(`<p><b>${escapeHtml(section.heading)}</b></p>`);
    if (section.body) {
      html.push(`<p>${escapeHtml(section.body).replace(/\n/g, "<br>")}</p>`);
    }
    if (items.length) {
      const list = items.map(
        ([k, v]) => `<li>${escapeHtml(k)}: ${escapeHtml(v)}</li>`
      );
      html.push(`<ul>${list.join("")}</ul>`);
    }
  }
  return html.join("");
}

/** Values for FIELDS, by id. */
function fieldValues(s) {
  return {
    ...s.context,
    websiteForm: FORM_LABELS[s.form],
    partnerProgram: s.program,
    eventDate: s.eventDate,
    eventLocation: s.eventLocation,
    products: s.products,
    experienceType: s.experience,
    objectives: s.objectives,
    seating: s.seating,
  };
}

// ── Handler ──────────────────────────────────────────────────────────────────

async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, code: "method_not_allowed" });
  }

  let body;
  try {
    // Vercel parses JSON onto req.body; reading it throws on malformed JSON.
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, code: "invalid_json" });
  }

  // Bots get a normal-looking success so they learn nothing.
  const spam = spamReason(body);
  if (spam) {
    console.warn(`[lead-form] dropped as spam (${spam})`);
    return res.status(200).json({ ok: true });
  }

  const { submission, fieldErrors } = readSubmission(body);
  if (fieldErrors) {
    return res.status(400).json({ ok: false, code: "invalid", fieldErrors });
  }

  const config = getConfig();
  if (!config) {
    // Env vars not set: the browser falls back to the Web3Forms email.
    return res.status(503).json({ ok: false, code: "not_configured" });
  }

  try {
    const organization = submission.company
      ? await findOrCreateOrganization(config, submission.company)
      : undefined;
    const person = await findOrCreatePerson(
      config,
      submission.person,
      organization && organization.id
    );

    // Missing custom fields must never block a lead; the note has it all.
    let customFields = {};
    try {
      customFields = buildCustomFields(
        await getFieldMap(config),
        fieldValues(submission)
      );
    } catch (error) {
      console.warn(`[lead-form] custom fields skipped: ${error.message}`);
    }

    const leadBody = {
      title: leadTitle(submission, organization && organization.name),
      person_id: person.id,
      ...(organization && { organization_id: organization.id }),
      origin_id: `projectory-web:${submission.form}`,
      ...(submission.context.utmCampaign && {
        channel_id: submission.context.utmCampaign,
      }),
    };
    let lead;
    try {
      lead = await pipedrive(config, "POST", "/v1/leads", {
        ...leadBody,
        ...customFields,
      });
    } catch (error) {
      // A custom field value Pipedrive won't accept must never cost the lead:
      // save it without the custom fields (the note still has everything).
      const rejected =
        error.message.includes("HTTP 400") && Object.keys(customFields).length;
      if (!rejected) throw error;
      console.warn(`[lead-form] custom fields rejected: ${error.message}`);
      lead = await pipedrive(config, "POST", "/v1/leads", leadBody);
    }
    await pipedrive(config, "POST", "/v1/notes", {
      content: noteHtml(submission),
      lead_id: lead.data.id,
      pinned_to_lead_flag: 1,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    // Endpoint and status only; never the submitted personal data.
    console.error(`[lead-form] ${submission.form} failed: ${error.message}`);
    return res.status(502).json({ ok: false, code: "pipedrive_error" });
  }
}

module.exports = handler;

// Used by scripts/setup-pipedrive.cjs, so the fields it creates always match
// the ones this function fills.
module.exports.FIELDS = FIELDS;
module.exports.getConfig = getConfig;
module.exports.pipedrive = pipedrive;
module.exports.listDealFields = listDealFields;
