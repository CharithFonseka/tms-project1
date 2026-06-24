// Stub env vars required by src/config/env.js so tests don't need a real .env file.
// These values are never sent to any real service — db.js is always jest.mock()'d
// in every test that touches it.
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.JWT_SECRET = 'test-jwt-secret-for-jest';
