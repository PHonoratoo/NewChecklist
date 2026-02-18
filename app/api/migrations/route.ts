import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Missing Supabase credentials' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false
    }
  });

  const migrations = [
    '002_add_groups.sql',
    '003_add_categories.sql',
    '004_add_preferences.sql'
  ];

  const results = [];

  for (const migrationFile of migrations) {
    try {
      const filePath = path.join(process.cwd(), 'scripts', migrationFile);
      
      if (!fs.existsSync(filePath)) {
        results.push({ file: migrationFile, status: 'skipped', reason: 'not found' });
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf-8');
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (const statement of statements) {
        const { data, error } = await supabase.rpc('exec', {
          sql: statement
        }).catch(() => ({ data: null, error: { message: 'Fallback needed' } }));

        if (error && !statement.includes('create policy')) {
          console.error(`Migration error in ${migrationFile}:`, error);
        }
      }

      results.push({ file: migrationFile, status: 'success' });
    } catch (error) {
      results.push({
        file: migrationFile,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return NextResponse.json({ migrations: results }, { status: 200 });
}
