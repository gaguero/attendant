import { prisma } from '../src/lib/prisma.js';
import { sendPasswordResetEmail } from '../src/lib/mailer.js';
import bcrypt from 'bcryptjs';

async function testEmail() {
  try {
    console.log('🧪 Testing email functionality...');
    
    // Create a test user if it doesn't exist
    const testEmail = 'hello@localfrombocas.com';
    
    let user = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (!user) {
      console.log('👤 Creating test user...');
      const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
      
      user = await prisma.user.create({
        data: {
          email: testEmail,
          firstName: 'Test',
          lastName: 'User',
          passwordHash,
          role: 'STAFF'
        }
      });
      console.log('✅ Test user created:', user.email);
    } else {
      console.log('👤 Test user already exists:', user.email);
    }
    
    // Test sending password reset email
    console.log('📧 Sending password reset email...');
    const token = await sendPasswordResetEmail(testEmail, user.id);
    console.log('✅ Email sent successfully!');
    console.log('🔑 Generated token:', token.substring(0, 8) + '...');
    
    // Check if token was saved in database
    const savedToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });
    
    if (savedToken) {
      console.log('✅ Token saved in database');
      console.log('⏰ Expires at:', savedToken.expiresAt);
    } else {
      console.log('❌ Token not found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEmail(); 