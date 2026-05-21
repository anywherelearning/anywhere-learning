import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

const users = await sql`
  SELECT u.email, u.created_at AS user_created, u.starter_pack_purchased_at,
         s.id AS sub_id, s.status, s.created_at AS sub_created, s.current_period_end
  FROM users u
  LEFT JOIN subscriptions s ON s.user_id = u.id
  ORDER BY u.created_at
`;

for (const u of users) {
  console.log(`${u.email}`);
  console.log(`  user_created:           ${u.user_created}`);
  console.log(`  sub_created:            ${u.sub_created || '—'}`);
  console.log(`  sub status:             ${u.status || '—'}`);
  console.log(`  current_period_end:     ${u.current_period_end || '—'}`);
  console.log(`  starter_pack_purchased: ${u.starter_pack_purchased_at || '—'}`);
  console.log();
}
