const request = require('supertest');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('API smoke tests', () => {
  it('GET /health returns ok', async () => {
    const res = await request(BASE_URL).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/portfolios returns array', async () => {
    const res = await request(BASE_URL).get('/api/portfolios');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
