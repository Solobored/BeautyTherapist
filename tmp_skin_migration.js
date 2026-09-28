const { Client } = require('pg');

const sql = `
  ALTER TABLE public.skin_analyses DROP CONSTRAINT IF EXISTS skin_analyses_source_check;
  ALTER TABLE public.skin_analyses
    ADD CONSTRAINT skin_analyses_source_check CHECK (
      source IN ('form', 'professional_report', 'ai_photo', 'ai_text')
    );
  ALTER TABLE public.skin_analyses
    ADD COLUMN IF NOT EXISTS ai_observations TEXT;
`;

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    await client.connect();
    await client.query(sql);
    const result = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'skin_analyses'
        AND column_name IN ('ai_observations', 'source')
      ORDER BY column_name;
    `);
    console.log('MIGRATION_OK');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('MIGRATION_ERROR');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
