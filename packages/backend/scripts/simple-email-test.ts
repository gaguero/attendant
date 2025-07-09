import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSimpleEmail() {
  console.log('🧪 Testing SMTP email configuration...');
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('📧 SMTP Configuration:');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`Secure: ${process.env.SMTP_SECURE}`);
    console.log(`User: ${process.env.SMTP_USER}`);
    console.log(`Pass: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'Not set'}`);

    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    // Send test email
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: 'Test Email from Attendandt',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Test Successful! 🎉</h2>
          <p>This is a test email from the Attendandt application.</p>
          <p>If you're receiving this, your SMTP configuration is working correctly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📤 Response:', info.response);

  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

testSimpleEmail(); 