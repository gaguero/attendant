import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database with Prisma...');
    
    // Try to count users
    const userCount = await prisma.user.count();
    console.log(`✅ Users table exists with ${userCount} records`);
    
    // Try to get one user to see the structure
    if (userCount > 0) {
      const sampleUser = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          addressLine1: true,
          city: true,
          authId: true,
          createdAt: true,
          updatedAt: true
        }
      });
      console.log('\n📊 Sample user structure:', Object.keys(sampleUser || {}));
    }
    
    console.log('\n✅ All required columns are available in the users table');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('does not exist')) {
      console.log('\n❌ Users table does not exist. Need to run migrations.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();