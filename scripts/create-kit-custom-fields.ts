/**
 * Creates the Kit custom fields the app writes to.
 *
 * The app creates these lazily on first signup anyway, but that's a
 * chicken-and-egg problem when writing the emails: you can't reference
 * {{ subscriber.last_guide }} in Kit's editor until the field exists. Run this
 * once so the field shows up in Kit straight away.
 *
 * Idempotent, additive, and read-only with respect to subscribers: it creates
 * fields and touches nothing else.
 *
 *   npx tsx scripts/create-kit-custom-fields.ts
 */

import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

const KIT_API_BASE = 'https://api.kit.com/v4';

const FIELDS: { label: string; key: string; usedFor: string }[] = [
  {
    label: 'Last guide',
    key: 'last_guide',
    usedFor: 'Names the free guide someone actually took, for the welcome sequence.',
  },
  {
    label: 'Last guide cover',
    key: 'last_guide_cover',
    usedFor: 'Absolute cover-image URL for that guide, so email 1 shows the right one.',
  },
  {
    label: 'Last guide download',
    key: 'last_guide_download',
    usedFor: "Direct PDF link for that guide, so email 1's button hands over the right file.",
  },
];

async function main() {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  if (!apiKey) {
    console.error('CONVERTKIT_API_KEY is required. Set it in .env.local');
    process.exit(1);
  }

  const headers = {
    'X-Kit-Api-Key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // Existing fields first, so a re-run reports rather than duplicates.
  const listRes = await fetch(`${KIT_API_BASE}/custom_fields`, { headers });
  if (!listRes.ok) {
    console.error(`Could not list custom fields: ${listRes.status} ${await listRes.text()}`);
    process.exit(1);
  }
  const existing = (await listRes.json()) as {
    custom_fields: { key: string; label: string }[];
  };
  const have = new Set(existing.custom_fields.map((f) => f.key));

  for (const field of FIELDS) {
    if (have.has(field.key)) {
      console.log(`already there: ${field.key}`);
      continue;
    }
    const res = await fetch(`${KIT_API_BASE}/custom_fields`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ label: field.label }),
    });
    if (!res.ok && res.status !== 422) {
      console.error(`create failed for "${field.label}": ${res.status} ${await res.text()}`);
      process.exit(1);
    }
    console.log(`created: ${field.label}  ->  {{ subscriber.${field.key} }}`);
    console.log(`   ${field.usedFor}`);
  }

  const after = (await (
    await fetch(`${KIT_API_BASE}/custom_fields`, { headers })
  ).json()) as { custom_fields: { key: string; label: string }[] };
  console.log(
    `\nKit now has ${after.custom_fields.length} custom field(s): ` +
      after.custom_fields.map((f) => f.key).join(', '),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
