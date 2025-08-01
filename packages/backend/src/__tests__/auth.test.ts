import request from 'supertest';
import app from '../app.js';
import { prisma } from '../lib/prisma.js';
import { generateAuthResponse } from '../lib/auth.js';
import { hash } from 'bcrypt';
import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';

describe('Authentication API', () => {
  let testUser: any;
  let testToken: string;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'test2@example.com', 'reset@example.com']
        }
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'test2@example.com', 'reset@example.com']
        }
      }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'STAFF'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toMatchObject({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'staff'
      });
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(res.body.data.tokens).toHaveProperty('expiresIn');

      // Store for other tests
      testUser = res.body.data.user;
      testToken = res.body.data.tokens.accessToken;
    });

    it('should reject registration with existing email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('User already exists');
    });

    it('should reject registration with invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        firstName: 'Test'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toMatchObject({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      });
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should reject login with invalid email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should send password reset email for existing user', async () => {
      const emailData = {
        email: 'test@example.com'
      };

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send(emailData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('password reset link has been sent');
    });

    it('should return success even for non-existent email (security)', async () => {
      const emailData = {
        email: 'nonexistent@example.com'
      };

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send(emailData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('password reset link has been sent');
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    let resetToken: string;

    beforeEach(async () => {
      // Create a test user for password reset
      const passwordHash = await hash('oldpassword', 12);
      const user = await prisma.user.create({
        data: {
          email: 'reset@example.com',
          firstName: 'Reset',
          lastName: 'User',
          passwordHash
        }
      });

      // Create a password reset token
      const token = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: 'test-reset-token-123',
          expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
        }
      });

      resetToken = token.token;
    });

    it('should reset password with valid token', async () => {
      const resetData = {
        token: resetToken,
        password: 'newpassword123'
      };

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send(resetData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password has been reset successfully.');

      // Verify the password was actually changed by trying to login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'reset@example.com',
          password: 'newpassword123'
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });

    it('should reject reset with invalid token', async () => {
      const resetData = {
        token: 'invalid-token',
        password: 'newpassword123'
      };

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send(resetData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid or expired token');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      });
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Authentication required');
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const changeData = {
        currentPassword: 'password123',
        newPassword: 'newpassword456'
      };

      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send(changeData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password changed successfully');

      // Verify the password was actually changed
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'newpassword456'
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });

    it('should reject change with invalid current password', async () => {
      const changeData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword789'
      };

      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send(changeData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid current password');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logout successful');
    });

    it('should reject logout without token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return not implemented for refresh token', async () => {
      const refreshData = {
        refreshToken: 'test-refresh-token'
      };

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send(refreshData);

      expect(res.status).toBe(501);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Not implemented');
    });
  });
});