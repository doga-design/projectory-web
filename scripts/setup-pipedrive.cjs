/**
 * Creates the Pipedrive custom fields the website lead form fills
 * (FIELDS in api/lead-form.cjs, read from there so the two always match).
 * Run once per Pipedrive account. Safe to re-run: fields and dropdown options
 * that already exist are matched by name and left alone.
 *
 *   npm run setup:pipedrive             preview what's missing (changes nothing)
 *   npm run setup:pipedrive -- --apply  create the missing fields / options
 *
 * Reads PIPEDRIVE_COMPANY_DOMAIN and PIPEDRIVE_API_TOKEN from .env.local
 * (gitignored). The token's user needs permission to add custom fields.
 */

const path = require("path");

if (typeof process.loadEnvFile !== "function") {
  console.error("\n  This script needs Node.js 20.12 or newer.\n");
  process.exit(1);
}
try {
  process.loadEnvFile(path.join(__dirname, "..", ".env.local"));
} catch {
  // No .env.local: fall through to the missing-variables message below.
}

const {
  FIELDS,
  getConfig,
  pipedrive,
  listDealFields,
} = require("../api/lead-form.cjs");

const apply = process.argv.includes("--apply");

async function main() {
  const config = getConfig();
  if (!config) {
    console.error(
      "\n  Add PIPEDRIVE_COMPANY_DOMAIN and PIPEDRIVE_API_TOKEN to .env.local (see .env.example).\n"
    );
    process.exit(1);
  }

  const me = (await pipedrive(config, "GET", "/v1/users/me")).data;
  console.log(
    `\nPipedrive: "${me.company_name}" (${config.domain}.pipedrive.com), token of ${me.name}`
  );
  console.log(
    apply
      ? "Mode: APPLY (changes will be made)\n"
      : "Mode: preview (nothing will change; add -- --apply to make changes)\n"
  );

  const existing = await listDealFields(config);
  let pending = 0;
  let mismatched = 0;

  for (const spec of FIELDS) {
    const label = spec.name.padEnd(22);
    const field = existing.find(
      (f) => f.field_name.trim().toLowerCase() === spec.name.toLowerCase()
    );

    if (field && field.field_type !== spec.type) {
      console.log(
        `  ! ${label} exists as "${field.field_type}", expected "${spec.type}"; the website skips it.`
      );
      mismatched++;
      continue;
    }

    if (!field) {
      pending++;
      if (!apply) {
        console.log(`  + ${label} will be created (${spec.type})`);
        continue;
      }
      await pipedrive(config, "POST", "/v2/dealFields", {
        field_name: spec.name,
        field_type: spec.type,
        ...(spec.options && {
          options: spec.options.map((option) => ({ label: option })),
        }),
      });
      console.log(`  ✓ ${label} created`);
      continue;
    }

    const have = new Set(
      (field.options || []).map((o) => String(o.label).toLowerCase())
    );
    const missing = (spec.options || []).filter(
      (option) => !have.has(option.toLowerCase())
    );
    if (missing.length === 0) {
      console.log(`  ✓ ${label} ok`);
      continue;
    }
    pending++;
    if (!apply) {
      console.log(`  + ${label} will get option(s): ${missing.join(", ")}`);
      continue;
    }
    await pipedrive(
      config,
      "POST",
      `/v2/dealFields/${field.field_code}/options`,
      missing.map((option) => ({ label: option }))
    );
    console.log(`  ✓ ${label} added ${missing.length} option(s)`);
  }

  if (mismatched > 0) {
    console.log(
      `\n${mismatched} field(s) have the wrong type: rename or delete them in Pipedrive (Settings → Data fields → Deal), then re-run.`
    );
  }
  if (!apply && pending > 0) {
    console.log(
      "\nRun `npm run setup:pipedrive -- --apply` to make these changes.\n"
    );
  } else if (mismatched === 0) {
    console.log("\nAll website fields are ready in Pipedrive.\n");
  }
}

main().catch((error) => {
  console.error(`\n  ✗ ${error.message}`);
  if (error.message.includes("HTTP 401")) {
    console.error("    The API token was rejected.");
  }
  if (error.message.includes("HTTP 403")) {
    console.error(
      "    This token's user may not be allowed to add custom fields; ask a Pipedrive admin."
    );
  }
  process.exit(1);
});
