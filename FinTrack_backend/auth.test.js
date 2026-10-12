require('dotenv').config(); // Load env for JWT_SECRET
const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./src/app');
const User = require('./src/models/User');

test('Authentication API', async (t) => {
  // Setup
  let mongod;
  try {
    await mongoose.connect(process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/fintrack_test', { serverSelectionTimeoutMS: 2000 });
  } catch (err) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
    } catch (fallbackErr) {
      console.error('MongoDB not running, skipping tests');
      process.exit(0); // Exit safely if mongo is unavailable
    }
  }
  
  await User.deleteMany({});
  
  let token;
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  await t.test('POST /api/auth/register - Should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.name, testUser.name);
    assert.strictEqual(res.body.data.user.email, testUser.email);
    assert.ok(!res.body.data.user.password);
  });

  await t.test('POST /api/auth/register - Should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Incomplete User' });
    
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('POST /api/auth/register - Should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Email already exists'));
  });

  await t.test('POST /api/auth/login - Should login user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    token = res.body.data.token;
  });

  await t.test('GET /api/auth/me - Should return current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, testUser.email);
  });

  // Teardown
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
