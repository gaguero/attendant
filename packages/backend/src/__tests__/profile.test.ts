import request from 'supertest';
import app from '../app.js';
import { prisma } from '../lib/prisma.js';
import { generateAuthResponse } from '../lib/auth.js';
import { hash } from 'bcrypt';

// Integration tests for profile endpoints
import { describe, it, beforeAll, afterAll, expect } from 'vitest';

describe('Profile API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Create test user
    const passwordHash = await hash('password123', 12);
    const user = await prisma.user.create({ data: { email: 'test@example.com', authId: passwordHash } });
    userId = user.id;
    const authResp = generateAuthResponse(user);
    token = authResp.tokens.accessToken;
  });

  afterAll(async () => {
    // Clean up test user and disconnect
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/profile/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/profile/me returns profile data', async () => {
    const res = await request(app)
      .get('/api/v1/profile/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('email', 'test@example.com');
  });

  it('PUT /api/v1/profile/me updates firstName and bio', async () => {
    const res = await request(app)
      .put('/api/v1/profile/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Alice', bio: 'Hello world' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ firstName: 'Alice', bio: 'Hello world' });
  });
}); 