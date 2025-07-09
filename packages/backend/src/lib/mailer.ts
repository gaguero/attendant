import nodemailer from 'nodemailer';
import { emailConfig, serverConfig } from '../config';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (options: MailOptions) => {
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    logger.error('SMTP user or password is not configured. Cannot send email.');
    // In a real app, you might want to have a fallback or a more robust notification system.
    // For this tutorial, we will just log the error.
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Attendandt" <${emailConfig.auth.user}>`,
      ...options,
    });
    logger.info(`Message sent: ${info.messageId}`);
  } catch (error) {
    logger.error('Error sending email:', error);
  }
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetUrl = `${serverConfig.frontendUrl}/reset-password?token=${token}`;
  
  await sendEmail({
    to,
    subject: 'Your Password Reset Request',
    text: `You requested a password reset. Click this link to reset your password: ${resetUrl}`,
    html: `<p>You requested a password reset. Click this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}; 