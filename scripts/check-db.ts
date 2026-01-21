import { db } from './lib/db';
import { sql } from '@vercel/postgres';

async function checkDatabase() {
  try {
    // Check if tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

    console.log('Existing tables:', tables.rows);

    // Check if users table exists
    const hasUsers = tables.rows.some((row: any) => row.table_name === 'users');
    const hasPallets = tables.rows.some((row: any) => row.table_name === 'pallets');

    console.log('Has users table:', hasUsers);
    console.log('Has pallets table:', hasPallets);

    if (!hasUsers) {
      console.error('❌ Users table does not exist! Run: pnpm db:push');
    } else {
      console.log('✅ Users table exists');
    }

    if (!hasPallets) {
      console.error('❌ Pallets table does not exist! Run: pnpm db:push');
    } else {
      console.log('✅ Pallets table exists');
    }
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

checkDatabase();
