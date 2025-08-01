const { PrismaClient } = require('./packages/backend/node_modules/@prisma/client');
const fs = require('fs');

// Read .env file manually
const envPath = './packages/backend/.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/^"/, '').replace(/"$/, '');
  }
});
process.env.DATABASE_URL = envVars.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - Role: ${user.role} - Created: ${user.createdAt}`);
    });
    
    // Check specifically for your test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'gagueromesen@gmail.com' }
    });
    
    if (testUser) {
      console.log('\n✅ Test user found:');
      console.log(JSON.stringify(testUser, null, 2));
    } else {
      console.log('\n❌ Test user not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();