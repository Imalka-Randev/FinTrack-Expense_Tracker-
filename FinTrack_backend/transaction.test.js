require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./src/app');
const User = require('./src/models/User');
const Transaction = require('./src/models/Transaction');

test('Transaction Management API', async (t) => {
  let mongod;

  // Setup database connection with fallback to MongoMemoryServer
  try {
    await mongoose.connect(process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/fintrack_test', {
      serverSelectionTimeoutMS: 2000,
    });
  } catch (err) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
    } catch (fallbackErr) {
      console.error('MongoDB unavailable, skipping transaction tests');
      process.exit(0);
    }
  }

  // Clean test database
  await User.deleteMany({});
  await Transaction.deleteMany({});

  let userAToken;
  let userAId;
  let userBToken;
  let userBId;

  // Setup User A
  const userARes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'User Alpha',
      email: 'alpha@example.com',
      password: 'password123',
    });
  userAId = userARes.body.data.user.id;

  const loginARes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alpha@example.com', password: 'password123' });
  userAToken = loginARes.body.data.token;

  // Setup User B
  const userBRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'User Beta',
      email: 'beta@example.com',
      password: 'password123',
    });
  userBId = userBRes.body.data.user.id;

  const loginBRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'beta@example.com', password: 'password123' });
  userBToken = loginBRes.body.data.token;

  let createdTransactionId;

  // 1. Authentication requirements
  await t.test('Authentication - Reject unauthenticated requests', async () => {
    const postRes = await request(app).post('/api/transactions').send({
      type: 'expense',
      amount: 50,
      category: 'Food',
    });
    assert.strictEqual(postRes.status, 401);

    const getRes = await request(app).get('/api/transactions');
    assert.strictEqual(getRes.status, 401);

    const getSingleRes = await request(app).get('/api/transactions/507f1f77bcf86cd799439011');
    assert.strictEqual(getSingleRes.status, 401);

    const putRes = await request(app).put('/api/transactions/507f1f77bcf86cd799439011').send({ amount: 60 });
    assert.strictEqual(putRes.status, 401);

    const deleteRes = await request(app).delete('/api/transactions/507f1f77bcf86cd799439011');
    assert.strictEqual(deleteRes.status, 401);
  });

  // 2. Validation
  await t.test('Validation - Reject invalid transaction types', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'investment',
        amount: 100,
        category: 'Stocks',
      });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('type'));
  });

  await t.test('Validation - Reject invalid amounts (negative, zero, non-finite, NaN)', async () => {
    for (const invalidAmount of [-50, 0, 'abc', null]) {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'expense',
          amount: invalidAmount,
          category: 'Food',
        });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Amount'));
    }
  });

  await t.test('Validation - Reject missing or empty category', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 50,
        category: '   ',
      });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Category'));
  });

  await t.test('Validation - Reject invalid date format', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 50,
        category: 'Food',
        date: 'invalid-date-string',
      });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('date'));
  });

  await t.test('Validation - Reject invalid ObjectIds in params', async () => {
    const invalidId = '123-not-a-valid-id';

    const getRes = await request(app)
      .get(`/api/transactions/${invalidId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(getRes.status, 400);
    assert.ok(getRes.body.message.includes('Invalid transaction ID format'));

    const putRes = await request(app)
      .put(`/api/transactions/${invalidId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 100 });
    assert.strictEqual(putRes.status, 400);

    const deleteRes = await request(app)
      .delete(`/api/transactions/${invalidId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(deleteRes.status, 400);
  });

  await t.test('Validation - Prevent changing ownership via update', async () => {
    const res = await request(app)
      .put('/api/transactions/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ userId: userBId, amount: 200 });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message.includes('ownership'));
  });

  await t.test('Validation - Reject update with no valid fields or unsupported fields', async () => {
    const emptyRes = await request(app)
      .put('/api/transactions/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({});
    assert.strictEqual(emptyRes.status, 400);

    const unsupportedRes = await request(app)
      .put('/api/transactions/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ unknownField: 'test' });
    assert.strictEqual(unsupportedRes.status, 400);
  });

  // 3. Create transactions
  await t.test('POST /api/transactions - Create income and expense transactions', async () => {
    // Create expense
    const expenseRes = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 45.5,
        category: 'Food',
        description: 'Lunch at bistro',
        date: '2026-10-05T12:00:00.000Z',
      });

    assert.strictEqual(expenseRes.status, 201);
    assert.strictEqual(expenseRes.body.success, true);
    assert.strictEqual(expenseRes.body.data.transaction.type, 'expense');
    assert.strictEqual(expenseRes.body.data.transaction.amount, 45.5);
    assert.strictEqual(expenseRes.body.data.transaction.category, 'Food');
    assert.strictEqual(expenseRes.body.data.transaction.description, 'Lunch at bistro');
    assert.strictEqual(expenseRes.body.data.transaction.userId.toString(), userAId);
    createdTransactionId = expenseRes.body.data.transaction._id;

    // Create income
    const incomeRes = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'income',
        amount: 3500,
        category: 'Salary',
        description: 'Monthly salary paycheck',
        date: '2026-10-01T08:00:00.000Z',
      });

    assert.strictEqual(incomeRes.status, 201);
    assert.strictEqual(incomeRes.body.success, true);
    assert.strictEqual(incomeRes.body.data.transaction.type, 'income');
    assert.strictEqual(incomeRes.body.data.transaction.amount, 3500);
  });

  await t.test('Security - Client cannot assign transaction to another user', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 25,
        category: 'Transport',
        description: 'Taxi ride',
        userId: userBId, // Attempt to assign to User B
      });

    assert.strictEqual(res.status, 201);
    // Verified: transaction is owned by User A, ignoring client-provided userId
    assert.strictEqual(res.body.data.transaction.userId.toString(), userAId);
    assert.notStrictEqual(res.body.data.transaction.userId.toString(), userBId);
  });

  // 4. Retrieve single transaction
  await t.test('GET /api/transactions/:id - Retrieve single transaction', async () => {
    const res = await request(app)
      .get(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.transaction._id.toString(), createdTransactionId);
    assert.strictEqual(res.body.data.transaction.category, 'Food');
  });

  await t.test('GET /api/transactions/:id - Non-existent ID returns 404', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/transactions/${nonExistentId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Transaction not found');
  });

  // 5. Update transaction
  await t.test('PUT /api/transactions/:id - Update transaction fields', async () => {
    const res = await request(app)
      .put(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amount: 55.75,
        description: 'Updated lunch with coffee',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.transaction.amount, 55.75);
    assert.strictEqual(res.body.data.transaction.description, 'Updated lunch with coffee');
    assert.strictEqual(res.body.data.transaction.category, 'Food'); // Unchanged
  });

  await t.test('PUT /api/transactions/:id - Non-existent ID returns 404', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/transactions/${nonExistentId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 100 });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Transaction not found');
  });

  // 6. User Isolation (User B cannot access or modify User A transactions)
  await t.test('Security & User Isolation - User B cannot read User A transaction', async () => {
    const res = await request(app)
      .get(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Transaction not found');
  });

  await t.test('Security & User Isolation - User B cannot update User A transaction', async () => {
    const res = await request(app)
      .put(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ amount: 999 });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Transaction not found');

    // Confirm amount in DB did not change
    const checkRes = await request(app)
      .get(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(checkRes.body.data.transaction.amount, 55.75);
  });

  await t.test('Security & User Isolation - User B cannot delete User A transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Transaction not found');

    // Confirm transaction still exists
    const checkRes = await request(app)
      .get(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(checkRes.status, 200);
  });

  // 7. Empty results
  await t.test('GET /api/transactions - User B with no transactions gets empty array', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${userBToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.count, 0);
    assert.deepStrictEqual(res.body.data.transactions, []);
  });

  // 8. Search and Filtering
  await t.test('Search & Filtering - Filter by type', async () => {
    const incomeRes = await request(app)
      .get('/api/transactions?type=income')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(incomeRes.status, 200);
    assert.ok(incomeRes.body.data.transactions.length >= 1);
    incomeRes.body.data.transactions.forEach((tx) => {
      assert.strictEqual(tx.type, 'income');
    });

    const expenseRes = await request(app)
      .get('/api/transactions?type=expense')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(expenseRes.status, 200);
    assert.ok(expenseRes.body.data.transactions.length >= 1);
    expenseRes.body.data.transactions.forEach((tx) => {
      assert.strictEqual(tx.type, 'expense');
    });
  });

  await t.test('Search & Filtering - Filter by category', async () => {
    const res = await request(app)
      .get('/api/transactions?category=Food')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.transactions.length >= 1);
    res.body.data.transactions.forEach((tx) => {
      assert.strictEqual(tx.category.toLowerCase(), 'food');
    });
  });

  await t.test('Search & Filtering - Search by description with safe regex escaping', async () => {
    // Create transaction with special characters in description
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 15,
        category: 'Food',
        description: 'Special coffee (latte) + donut [deal]',
      });

    // Test normal search keyword
    const resNormal = await request(app)
      .get('/api/transactions?search=latte')
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(resNormal.status, 200);
    assert.strictEqual(resNormal.body.data.transactions.length, 1);
    assert.ok(resNormal.body.data.transactions[0].description.includes('latte'));

    // Test search with special regex symbols: () + []
    const specialQuery = encodeURIComponent('(latte) + donut [deal]');
    const resSpecial = await request(app)
      .get(`/api/transactions?search=${specialQuery}`)
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(resSpecial.status, 200);
    assert.strictEqual(resSpecial.body.data.transactions.length, 1);

    // Search that does not match
    const resNoMatch = await request(app)
      .get('/api/transactions?search=nonexistentsearchterm123')
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(resNoMatch.status, 200);
    assert.strictEqual(resNoMatch.body.count, 0);
  });

  await t.test('Search & Filtering - Filter by date range', async () => {
    const res = await request(app)
      .get('/api/transactions?startDate=2026-10-01&endDate=2026-10-04')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.transactions.length >= 1);
    res.body.data.transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      assert.ok(txDate >= new Date('2026-10-01T00:00:00.000Z'));
      assert.ok(txDate <= new Date('2026-10-04T23:59:59.999Z'));
    });
  });

  await t.test('Search & Filtering - Reject invalid query parameters', async () => {
    const invalidTypeRes = await request(app)
      .get('/api/transactions?type=invalid')
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(invalidTypeRes.status, 400);

    const invalidDateRes = await request(app)
      .get('/api/transactions?startDate=bad-date')
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(invalidDateRes.status, 400);

    const reversedDateRes = await request(app)
      .get('/api/transactions?startDate=2026-10-20&endDate=2026-10-10')
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(reversedDateRes.status, 400);
  });

  // 9. Delete transaction
  await t.test('DELETE /api/transactions/:id - Delete transaction successfully', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, 'Transaction deleted successfully');

    // Verify it is gone
    const getRes = await request(app)
      .get(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(getRes.status, 404);
  });

  await t.test('DELETE /api/transactions/:id - Delete non-existent ID returns 404', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/transactions/${nonExistentId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Transaction not found');
  });

  // Teardown
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
