import { supabaseAdmin } from './packages/backend/src/lib/supabase.js';

console.log('Checking Supabase users table structure...');

try {
  // First try to query the table
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('❌ Error querying users table:', error.message);
    
    if (error.message.includes('relation "users" does not exist')) {
      console.log('\n📋 Users table does not exist in Supabase. You need to create it.');
      console.log('\nRequired columns based on your Prisma schema:');
      console.log('- id (UUID, primary key)');
      console.log('- email (text, unique)');
      console.log('- first_name (text, nullable)');
      console.log('- last_name (text, nullable)');
      console.log('- role (enum: ADMIN, STAFF, CONCIERGE, VIEWER)');
      console.log('- phone (text, nullable)');
      console.log('- address_line1 (text, nullable)');
      console.log('- address_line2 (text, nullable)');
      console.log('- city (text, nullable)');
      console.log('- state_or_province (text, nullable)');
      console.log('- postal_code (text, nullable)');
      console.log('- country (text, nullable)');
      console.log('- preferences (jsonb, nullable)');
      console.log('- notes (text, nullable)');
      console.log('- theme (text, nullable)');
      console.log('- auth_id (text, unique, nullable)');
      console.log('- password_hash (text, nullable)');
      console.log('- bio (text, nullable)');
      console.log('- avatarUrl (text, nullable)');
      console.log('- created_at (timestamp with time zone)');
      console.log('- updated_at (timestamp with time zone)');
    }
  } else {
    console.log('✅ Users table exists');
    if (data && data.length > 0) {
      console.log('\n📊 Current table columns:', Object.keys(data[0]).sort());
    } else {
      console.log('\n📊 Users table is empty, but exists');
    }
  }
} catch (err) {
  console.log('❌ Connection error:', err.message);
  console.log('Make sure your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set correctly');
}