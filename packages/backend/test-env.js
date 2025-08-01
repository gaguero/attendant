import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const result = config();

console.log('🔍 Environment loading result:', result);
console.log('📁 Current working directory:', process.cwd());
console.log('📄 .env file path:', resolve('.env'));

console.log('\n📊 Environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');
console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'Set ✅' : 'Not set ❌');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set ✅' : 'Not set ❌');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✅' : 'Not set ❌');

if (process.env.DATABASE_URL) {
  // Mask the password for security
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@');
  console.log('DATABASE_URL (masked):', maskedUrl);
}