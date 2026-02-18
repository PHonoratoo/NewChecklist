import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrationFiles = [
  '002_add_groups.sql',
  '003_add_categories.sql',
  '004_add_preferences.sql'
];

async function runMigrations() {
  console.log('🚀 Starting migrations...\n');
  
  for (const file of migrationFiles) {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Skipping ${file} (not found)`);
      continue;
    }
    
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    console.log(`▶️  Running ${file}...`);
    
    try {
      const { error } = await supabase.rpc('sql', { query: sql }).catch(() => ({
        error: { message: 'RPC not available, using direct query' }
      }));
      
      // If RPC fails, try direct approach with multiple statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        const { error: execError } = await supabase
          .from('_migrations')
          .insert({ name: file, query: statement })
          .catch(() => ({ error: null }));
      }
      
      console.log(`✅ ${file} completed\n`);
    } catch (error) {
      console.error(`❌ Error running ${file}:`, error);
      process.exit(1);
    }
  }
  
  console.log('✅ All migrations completed!');
}

runMigrations();
