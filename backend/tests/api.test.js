const request = require('supertest');
const app = require('../index');

let superAdminToken = '';
let adminToken = '';
let flagId = '';

describe('Super Admin Auth', () => {
  test('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/super-admin/login')
      .send({ email: 'admin@system.com', password: 'admin123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    superAdminToken = res.body.token;
  });

  test('should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/super-admin/login')
      .send({ email: 'wrong@email.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

describe('Organizations', () => {
  test('should create an organization', async () => {
    const res = await request(app)
      .post('/api/organizations')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ name: 'TestOrg' });

    expect([201, 409]).toContain(res.statusCode);
  });

  test('should get all organizations', async () => {
    const res = await request(app)
      .get('/api/organizations')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should reject unauthorized access', async () => {
    const res = await request(app)
      .get('/api/organizations');

    expect(res.statusCode).toBe(401);
  });
});

describe('Admin Auth', () => {
  test('should signup as org admin', async () => {
    const res = await request(app)
      .post('/api/auth/admin/signup')
      .send({
        username: 'testadmin',
        email: 'testadmin@test.com',
        password: 'test123',
        org_id: 1
      });

    expect([201, 409]).toContain(res.statusCode);
  });

  test('should login as org admin', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'testadmin@test.com', password: 'test123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    adminToken = res.body.token;
  });

  test('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'testadmin@test.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
  });
});

describe('Feature Flags', () => {
  test('should create a feature flag', async () => {
    const res = await request(app)
      .post('/api/flags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ feature_key: 'test_flag' });

    expect([201, 409]).toContain(res.statusCode);
  });

  test('should get all flags for org', async () => {
    const res = await request(app)
      .get('/api/flags')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) flagId = res.body[0].id;
  });

  test('should toggle a flag', async () => {
    if (!flagId) return;
    const res = await request(app)
      .patch(`/api/flags/${flagId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.is_enabled).toBeDefined();
  });

  test('should check flag as end user', async () => {
    const res = await request(app)
      .get('/api/flags/check?feature_key=test_flag&org_id=1');

    expect(res.statusCode).toBe(200);
    expect(res.body.is_enabled).toBeDefined();
  });

  test('should reject flag creation without auth', async () => {
    const res = await request(app)
      .post('/api/flags')
      .send({ feature_key: 'unauthorized_flag' });

    expect(res.statusCode).toBe(401);
  });
});