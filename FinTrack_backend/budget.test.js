require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./src/app');
const User = require('./src/models/User');
const Transaction = require('./src/models/Transaction');
const Budget = require('./src/models/Budget');

test('Budget Management API & Progress Calculations', async (t) => {
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
      console.error('MongoDB unavailable, skipping budget tests');
      process.exit(0);
    }
  }

  // Clean test database
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await Budget.deleteMany({});

  let userAToken;
  let userAId;
  let userBToken;
  let userBId;

  // Setup User A
  const userARes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'User Alpha',
      email: 'alpha_budget@example.com',
      password: 'password123',
    });
  userAId = userARes.body.data.user.id;

  const loginARes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alpha_budget@example.com', password: 'password123' });
  userAToken = loginARes.body.data.token;

  // Setup User B
  const userBRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'User Beta',
      email: 'beta_budget@example.com',
      password: 'password123',
    });
  userBId = userBRes.body.data.user.id;

  const loginBRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'beta_budget@example.com', password: 'password123' });
  userBToken = loginBRes.body.data.token;

  let createdBudgetId;

  // 1. Security & Authentication Checks
  await t.test('Security - Reject unauthenticated requests and invalid tokens', async () => {
    const postRes = await request(app).post('/api/budgets').send({
      category: 'Food',
      amount: 15000,
      month: 10,
      year: 2026,
    });
    assert.strictEqual(postRes.status, 401);

    const getRes = await request(app).get('/api/budgets');
    assert.strictEqual(getRes.status, 401);

    const getSingleRes = await request(app).get('/api/budgets/507f1f77bcf86cd799439011');
    assert.strictEqual(getSingleRes.status, 401);

    const putRes = await request(app).put('/api/budgets/507f1f77bcf86cd799439011').send({ amount: 16000 });
    assert.strictEqual(putRes.status, 401);

    const deleteRes = await request(app).delete('/api/budgets/507f1f77bcf86cd799439011');
    assert.strictEqual(deleteRes.status, 401);

    // Invalid JWT
    const invalidTokenRes = await request(app)
      .get('/api/budgets')
      .set('Authorization', 'Bearer invalid_jwt_string_123');
    assert.strictEqual(invalidTokenRes.status, 401);
  });

  // 2. Validation Checks
  await t.test('Validation - Reject invalid amounts (negative, zero, non-finite, null)', async () => {
    for (const invalidAmount of [-500, 0, 'abc', null]) {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          category: 'Food',
          amount: invalidAmount,
          month: 10,
          year: 2026,
        });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('amount'));
    }
  });

  await t.test('Validation - Reject invalid month parameters', async () => {
    for (const invalidMonth of [0, 13, -1, 'october', 2.5]) {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          category: 'Food',
          amount: 15000,
          month: invalidMonth,
          year: 2026,
        });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Month'));
    }
  });

  await t.test('Validation - Reject invalid year parameters', async () => {
    for (const invalidYear of [26, 'invalid', 12345, 999]) {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          category: 'Food',
          amount: 15000,
          month: 10,
          year: invalidYear,
        });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Year'));
    }
  });

  await t.test('Validation - Reject missing or empty category', async () => {
    for (const invalidCategory of ['', '   ', null]) {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          category: invalidCategory,
          amount: 15000,
          month: 10,
          year: 2026,
        });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Category'));
    }
  });

  await t.test('Validation - Reject malformed ObjectIds in params', async () => {
    const invalidId = '123-not-a-valid-id';

    const getRes = await request(app)
      .get(`/api/budgets/${invalidId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(getRes.status, 400);
    assert.ok(getRes.body.message.includes('Invalid budget ID format'));

    const putRes = await request(app)
      .put(`/api/budgets/${invalidId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 16000 });
    assert.strictEqual(putRes.status, 400);

    const deleteRes = await request(app)
      .delete(`/api/budgets/${invalidId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(deleteRes.status, 400);
  });

  await t.test('Validation - Prevent client from altering userId or internal ID', async () => {
    const putOwnershipRes = await request(app)
      .put('/api/budgets/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ userId: userBId, amount: 20000 });
    assert.strictEqual(putOwnershipRes.status, 400);
    assert.ok(putOwnershipRes.body.message.includes('ownership'));

    const putIdRes = await request(app)
      .put('/api/budgets/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ _id: '507f1f77bcf86cd799439099' });
    assert.strictEqual(putIdRes.status, 400);
  });

  // 3. Create Budget & Zero Spending Initial State
  await t.test('POST /api/budgets - Create valid budget with zero initial spending', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        category: 'Food',
        amount: 15000,
        month: 10,
        year: 2026,
        userId: userBId, // Attempt client injection
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.budget.category, 'Food');
    assert.strictEqual(res.body.data.budget.amount, 15000);
    assert.strictEqual(res.body.data.budget.budgetAmount, 15000);
    assert.strictEqual(res.body.data.budget.spentAmount, 0);
    assert.strictEqual(res.body.data.budget.remainingAmount, 15000);
    assert.strictEqual(res.body.data.budget.percentageUsed, 0);
    assert.strictEqual(res.body.data.budget.isExceeded, false);
    // User isolation: derived strictly from req.user.id
    assert.strictEqual(res.body.data.budget.userId.toString(), userAId);

    createdBudgetId = res.body.data.budget._id;
  });

  await t.test('POST /api/budgets - Reject duplicate category/month/year budgets', async () => {
    // Exact duplicate
    const resExact = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        category: 'Food',
        amount: 12000,
        month: 10,
        year: 2026,
      });
    assert.strictEqual(resExact.status, 400);
    assert.strictEqual(resExact.body.success, false);
    assert.ok(resExact.body.message.includes('already exists'));

    // Case-insensitive duplicate ("food")
    const resCase = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        category: 'food',
        amount: 10000,
        month: 10,
        year: 2026,
      });
    assert.strictEqual(resCase.status, 400);
    assert.ok(resCase.body.message.includes('already exists'));
  });

  // 4. Progress Calculations with Transactions
  await t.test('Calculations - Count single matching expense correctly', async () => {
    // Add matching expense: $5000 for Food in Oct 2026
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 5000,
        category: 'Food',
        description: 'Supermarket shopping',
        date: '2026-10-05T12:00:00.000Z',
      });

    const res = await request(app)
      .get(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    const { budget } = res.body.data;
    assert.strictEqual(budget.budgetAmount, 15000);
    assert.strictEqual(budget.spentAmount, 5000);
    assert.strictEqual(budget.remainingAmount, 10000);
    assert.strictEqual(budget.percentageUsed, 33.33);
    assert.strictEqual(budget.isExceeded, false);
  });

  await t.test('Calculations - Multiple matching expenses are summed correctly', async () => {
    // Add second matching expense: $3500 for Food in Oct 2026
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 3500,
        category: 'Food',
        description: 'Restaurant dinner',
        date: '2026-10-12T19:00:00.000Z',
      });

    const res = await request(app)
      .get(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    const { budget } = res.body.data;
    // Total spent: 5000 + 3500 = 8500
    assert.strictEqual(budget.spentAmount, 8500);
    assert.strictEqual(budget.remainingAmount, 6500);
    // (8500 / 15000) * 100 = 56.67
    assert.strictEqual(budget.percentageUsed, 56.67);
    assert.strictEqual(budget.isExceeded, false);
  });

  await t.test('Calculations - Income transactions are excluded', async () => {
    // Add income: $20000 for Food category
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'income',
        amount: 20000,
        category: 'Food',
        description: 'Reimbursement for food',
        date: '2026-10-10T10:00:00.000Z',
      });

    const res = await request(app)
      .get(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    // Spent amount must remain unchanged at 8500
    assert.strictEqual(res.body.data.budget.spentAmount, 8500);
    assert.strictEqual(res.body.data.budget.remainingAmount, 6500);
  });

  await t.test('Calculations - Expenses from other categories are excluded', async () => {
    // Add expense: $4000 for Utilities
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 4000,
        category: 'Utilities',
        description: 'Electric bill',
        date: '2026-10-15T10:00:00.000Z',
      });

    const res = await request(app)
      .get(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.body.data.budget.spentAmount, 8500);
  });

  await t.test('Calculations - Expenses from other users are excluded', async () => {
    // User B adds expense: $5000 for Food in Oct 2026
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        type: 'expense',
        amount: 5000,
        category: 'Food',
        description: 'User B Food Expense',
        date: '2026-10-16T12:00:00.000Z',
      });

    const res = await request(app)
      .get(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    // Must still be 8500
    assert.strictEqual(res.body.data.budget.spentAmount, 8500);
  });

  await t.test('Calculations - Transactions outside selected month are excluded', async () => {
    // September expense
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 2500,
        category: 'Food',
        description: 'September food',
        date: '2026-09-25T12:00:00.000Z',
      });

    // November expense
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 3000,
        category: 'Food',
        description: 'November food',
        date: '2026-11-05T12:00:00.000Z',
      });

    const res = await request(app)
      .get(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    // Must still be 8500
    assert.strictEqual(res.body.data.budget.spentAmount, 8500);
  });

  await t.test('Calculations - Exceeded budget correctly flagged and negative remaining amount preserved', async () => {
    // Add additional expense of $10000 -> Total spent becomes 18500 (exceeds 15000)
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 10000,
        category: 'Food',
        description: 'Party catering',
        date: '2026-10-25T20:00:00.000Z',
      });

    const res = await request(app)
      .get(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    const { budget } = res.body.data;
    assert.strictEqual(budget.budgetAmount, 15000);
    assert.strictEqual(budget.spentAmount, 18500);
    // Negative remaining amount preserved: 15000 - 18500 = -3500
    assert.strictEqual(budget.remainingAmount, -3500);
    // (18500 / 15000) * 100 = 123.33
    assert.strictEqual(budget.percentageUsed, 123.33);
    assert.strictEqual(budget.isExceeded, true);
  });

  // 5. Querying & Filtering Budgets
  await t.test('GET /api/budgets - Retrieve user budgets for month with progress', async () => {
    // Create second budget for User A: Transport $5000 in Oct 2026
    await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        category: 'Transport',
        amount: 5000,
        month: 10,
        year: 2026,
      });

    const res = await request(app)
      .get('/api/budgets?month=10&year=2026')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.count, 2);
    assert.strictEqual(res.body.data.budgets.length, 2);

    const foodB = res.body.data.budgets.find((b) => b.category === 'Food');
    assert.ok(foodB);
    assert.strictEqual(foodB.spentAmount, 18500);

    const transportB = res.body.data.budgets.find((b) => b.category === 'Transport');
    assert.ok(transportB);
    assert.strictEqual(transportB.spentAmount, 0);
  });

  await t.test('GET /api/budgets - Filter by category', async () => {
    const res = await request(app)
      .get('/api/budgets?month=10&year=2026&category=Transport')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.count, 1);
    assert.strictEqual(res.body.data.budgets[0].category, 'Transport');
  });

  // 6. Update Budget
  await t.test('PUT /api/budgets/:id - Update spending limit and recalculate progress', async () => {
    const res = await request(app)
      .put(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 20000 });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);

    const { budget } = res.body.data;
    assert.strictEqual(budget.budgetAmount, 20000);
    assert.strictEqual(budget.spentAmount, 18500);
    assert.strictEqual(budget.remainingAmount, 1500);
    // (18500 / 20000) * 100 = 92.5
    assert.strictEqual(budget.percentageUsed, 92.5);
    assert.strictEqual(budget.isExceeded, false);
  });

  await t.test('PUT /api/budgets/:id - Reject updates creating duplicate category/month/year', async () => {
    // Attempt to rename Transport budget to 'Food' for Oct 2026
    const budgetsRes = await request(app)
      .get('/api/budgets?month=10&year=2026&category=Transport')
      .set('Authorization', `Bearer ${userAToken}`);
    const transportId = budgetsRes.body.data.budgets[0]._id;

    const res = await request(app)
      .put(`/api/budgets/${transportId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ category: 'Food' });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message.includes('already exists'));
  });

  // 7. Security & User Isolation
  await t.test('Security & User Isolation - User B cannot read, update, or delete User A budget', async () => {
    // User B read
    const getRes = await request(app)
      .get(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    assert.strictEqual(getRes.status, 404);
    assert.strictEqual(getRes.body.message, 'Budget not found');

    // User B update
    const putRes = await request(app)
      .put(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ amount: 99999 });
    assert.strictEqual(putRes.status, 404);
    assert.strictEqual(putRes.body.message, 'Budget not found');

    // User B delete
    const deleteRes = await request(app)
      .delete(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    assert.strictEqual(deleteRes.status, 404);
    assert.strictEqual(deleteRes.body.message, 'Budget not found');

    // User B budget list does not include User A's budgets
    const listRes = await request(app)
      .get('/api/budgets?month=10&year=2026')
      .set('Authorization', `Bearer ${userBToken}`);
    assert.strictEqual(listRes.status, 200);
    assert.strictEqual(listRes.body.count, 0);
    assert.deepStrictEqual(listRes.body.data.budgets, []);
  });

  // 8. Delete Budget
  await t.test('DELETE /api/budgets/:id - Delete budget successfully', async () => {
    const res = await request(app)
      .delete(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, 'Budget deleted successfully');

    // Verify budget is gone
    const checkRes = await request(app)
      .get(`/api/budgets/${createdBudgetId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(checkRes.status, 404);
  });

  await t.test('DELETE /api/budgets/:id - Non-existent ID returns 404', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/budgets/${nonExistentId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Budget not found');
  });

  // Teardown
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
