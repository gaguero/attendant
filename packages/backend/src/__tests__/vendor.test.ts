import request from 'supertest';
import app from '../app.js';
import { prisma } from '../lib/prisma.js';
import { generateAuthResponse } from '../lib/auth.js';
import { hash } from 'bcrypt';
import { VendorCategory } from '@attendandt/shared';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';

describe('Vendor API', () => {
  let token: string;
  let userId: string;
  let vendorId: string;

  beforeAll(async () => {
    const passwordHash = await hash('password123', 12);
    const user = await prisma.user.create({
      data: { email: `vendor_${Date.now()}@test.com`, authId: passwordHash, role: 'ADMIN' as any },
    });
    userId = user.id;
    token = generateAuthResponse(user).tokens.accessToken;
  });

  afterAll(async () => {
    await prisma.vendor.deleteMany();
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('POST /vendors creates vendor', async () => {
    const res = await request(app)
      .post('/api/v1/vendors')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Laundry Co.',
        category: VendorCategory.MAINTENANCE,
        rating: 4,
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    vendorId = res.body.data.id;
  });

  it('GET /vendors lists vendors', async () => {
    const res = await request(app)
      .get('/api/v1/vendors')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /vendors/:id updates vendor', async () => {
    const res = await request(app)
      .put(`/api/v1/vendors/${vendorId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5 });
    expect(res.status).toBe(200);
    expect(res.body.data.rating).toBe(5);
  });

  it('DELETE /vendors/:id removes vendor', async () => {
    const res = await request(app)
      .delete(`/api/v1/vendors/${vendorId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
}); 