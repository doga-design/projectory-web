/**
 * Fails when a CSS Module has a rule whose selector starts with an element or
 * `*` (e.g. `p { … }`, `h3 { … }`, `button { … }`).
 *
 * CSS Modules only hash class names, so such a rule is GLOBAL. Pages are
 * lazy-loaded, so it switches on the first time its chunk loads and then stays
 * for the rest of the session: the same page looks different depending on
 * which routes were visited before it. (FinalCTA's bare `p` once pushed Home's
 * scroll copy under the navbar, but only after a product page had been opened.)
 *
 * Start selectors with a class instead (`.wrapper p`). For a deliberately
 * global rule, use `:global(…)` or src/styles/global.css.
 *
 *   npm run lint:css
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");

// Known leaks that predate this check. Fixing them changes how other pages
// look, so each needs its own audit — remove entries as they are scoped.
const ALLOWED = {
  "src/pages/Home/Home.module.css": ["h1", "h2", "h5", "iframe"],
  "src/pages/GetEstimatePage/GetEstimatePage.module.css": ["*"],
};

// At-rules whose blocks hold style rules; anything else (@keyframes,
// @font-face) holds non-selector preludes like `from` or `50%`.
const CONTAINER_AT_RULES = /^@(media|supports|container|layer)\b/;

const SCOPED_START = /^(\.|#|:global\(|:root\b)/;

function findModules(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return findModules(full);
    return entry.name.endsWith(".module.css") ? [full] : [];
  });
}

/** Comma-split that ignores commas inside parentheses, e.g. `:is(a, b)`. */
function splitSelectors(prelude) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of prelude) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current.trim());
  return parts.filter(Boolean);
}

function check(file) {
  // Blank out comments but keep their newlines so line numbers stay right.
  const css = fs
    .readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  const allowed = new Set(ALLOWED[rel] || []);
  const problems = [];

  // Each open block is "container" (style rules may follow) or "other".
  const stack = [];
  let prelude = "";
  let preludeLine = 1;
  let line = 1;

  for (const ch of css) {
    if (ch === "{") {
      const text = prelude.trim().replace(/\s+/g, " ");
      const inContainer = stack.every((b) => b === "container");
      if (text.startsWith("@")) {
        stack.push(CONTAINER_AT_RULES.test(text) && inContainer ? "container" : "other");
      } else {
        if (inContainer) {
          for (const selector of splitSelectors(text)) {
            if (!SCOPED_START.test(selector) && !allowed.has(selector)) {
              problems.push(`${rel}:${preludeLine}  ${selector}`);
            }
          }
        }
        stack.push("other");
      }
      prelude = "";
    } else if (ch === "}") {
      stack.pop();
      prelude = "";
    } else if (ch === ";") {
      prelude = "";
    } else {
      if (!prelude.trim() && ch.trim()) preludeLine = line;
      prelude += ch;
    }
    if (ch === "\n") line++;
  }
  return problems;
}

const problems = findModules(SRC).flatMap(check);

if (problems.length) {
  console.error(
    "\n  These CSS Module selectors start with an element or `*`, so they apply to the\n" +
      "  whole site once their page loads. Start them with a class (`.wrapper p`).\n"
  );
  for (const p of problems) console.error(`  ${p}`);
  console.error("");
  process.exit(1);
}
