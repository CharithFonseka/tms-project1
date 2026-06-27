const request = require('supertest');
const app = require('../../src/app');
const { signToken, signRefreshToken } = require('../../src/utils/token.util');

describe('POST /api/auth/refresh', () => {
  test('issues a new access token when a valid refresh cookie is present', async () => {
    const refresh = signRefreshToken({ id: 'u1', role: 'Admin' });
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`tms_refresh=${refresh}`]);

    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie'].join(';');
    expect(setCookie).toMatch(/tms_token=/);
  });

  test('rejects when no refresh cookie is provided', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });

  test('rejects an access token used as a refresh token', async () => {
    const access = signToken({ id: 'u1', role: 'Admin' }); // no type: 'refresh'
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`tms_refresh=${access}`]);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  test('clears the auth cookies', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie'].join(';');
    expect(setCookie).toMatch(/tms_token=;/);
    expect(setCookie).toMatch(/tms_refresh=;/);
  });
});
