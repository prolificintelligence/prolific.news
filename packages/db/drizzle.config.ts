import { defineConfig } from 'drizzle-kit';
import * as fs from 'fs';

let connectionString = process.env.DATABASE_URL || '';
if (!connectionString && fs.existsSync('D:/Projects/secrets/Prolific-Neon-DatabaseURL.md')) {
  connectionString = fs.readFileSync('D:/Projects/secrets/Prolific-Neon-DatabaseURL.md', 'utf8').trim();
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
});
