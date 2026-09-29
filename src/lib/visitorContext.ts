// Where a visitor came from, captured once per browser session and sent with every lead:
// campaign tags (UTMs), the external referrer, the first page they landed on, and the page they
// were on before the current one — so a lead from the shared /get-started contact form still
// shows it came via /pricing, /partners, and so on. A new link with UTM tags (a fresh campaign
// click) replaces the stored campaign.

const STORAGE_KEY = 'projectory:visitor-context';

type VisitorState = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingPage?: string;
  currentPage?: string;
  previousPage?: string;
};

const UTM_PARAMS = {
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_term: 'utmTerm',
  utm_content: 'utmContent',
} as const;

let state: VisitorState = {};

const STATE_KEYS = [
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmTerm',
  'utmContent',
  'referrer',
  'landingPage',
  'currentPage',
  'previousPage',
] as const;

// Reads the stored state, keeping only known keys with string values (storage can be
// disabled, malformed, or hold something unexpected).
function readStored(): VisitorState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const stored: VisitorState = {};
    for (const key of STATE_KEYS) {
      const value = (parsed as Record<string, unknown>)[key];
      if (typeof value === 'string') stored[key] = value;
    }
    return stored;
  } catch {
    return null;
  }
}

function save() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage blocked (private mode, quota): tracking still works for this page view.
  }
}

/** Call once on startup, before the first render. */
export function initVisitorContext() {
  const stored = readStored();
  const params = new URLSearchParams(window.location.search);
  const campaign: VisitorState = {};
  const campaignParams = new URLSearchParams();
  for (const [param, key] of Object.entries(UTM_PARAMS)) {
    const value = params.get(param);
    if (value) {
      campaign[key] = value;
      campaignParams.set(param, value);
    }
  }

  if (stored && Object.keys(campaign).length === 0) {
    state = stored;
    return;
  }

  // Only the referring site and page: its query string can carry search terms or ids.
  let referrer: string | undefined;
  try {
    const ref = document.referrer && new URL(document.referrer);
    if (ref && ref.origin !== window.location.origin) referrer = ref.origin + ref.pathname;
  } catch {
    // Malformed referrer: ignore.
  }

  // Path plus campaign tags only: ad-click ids (gclid, fbclid) and other query data are
  // not sent to the CRM.
  const query = campaignParams.toString();

  state = {
    ...campaign,
    referrer,
    landingPage: window.location.pathname + (query ? `?${query}` : ''),
    currentPage: stored?.currentPage,
    previousPage: stored?.previousPage,
  };
  save();
}

/** Called on every route change (pathname only; hash scrolls don't count as a new page). */
export function recordPageView(pathname: string) {
  if (pathname === state.currentPage) return;
  state = { ...state, previousPage: state.currentPage, currentPage: pathname };
  save();
}

/**
 * The context sent with a lead. `sourcePage` is the page that led to it: for forms with a page
 * of their own (/get-started, /get-estimate) the page before it; for forms embedded in a page
 * (footer, partner overlay) the page they were submitted on.
 */
export function getLeadContext({ embedded }: { embedded: boolean }) {
  const { currentPage, previousPage, ...rest } = state;
  return {
    ...rest,
    sourcePage: embedded ? (currentPage ?? window.location.pathname) : previousPage,
  };
}
