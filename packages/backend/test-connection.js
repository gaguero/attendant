import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config();

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');
  console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'Set ✅' : 'Not set ❌');

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('📡 Attempting to connect to database...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test a simple query
    console.log('🔍 Testing simple query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful:', result);

    // Test user table exists
    console.log('🔍 Checking user table...');
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible. Current users: ${userCount}`);

    // List all users (just id and email for safety)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      },
      take: 5,
    });
    console.log('📋 Sample users:', users);

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.meta) console.error('Error meta:', error.meta);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}

testConnection();