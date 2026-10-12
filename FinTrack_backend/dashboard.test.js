require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./src/app');
const User = require('./src/models/User');
const Transaction = require('./src/models/Transaction');

test('Dashboard API & Financial Calculations', async (t) => {
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
      console.error('MongoDB unavailable, skipping dashboard tests');
      process.exit(0);
    }
  }

  // Clean test collections
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
      email: 'alpha_dash@example.com',
      password: 'password123',
    });
  userAId = userARes.body.data.user.id;

  const loginARes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alpha_dash@example.com', password: 'password123' });
  userAToken = loginARes.body.data.token;

  // Setup User B
  const userBRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'User Beta',
      email: 'beta_dash@example.com',
      password: 'password123',
    });
  userBId = userBRes.body.data.user.id;

  const loginBRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'beta_dash@example.com', password: 'password123' });
  userBToken = loginBRes.body.data.token;

  // 1. Unauthenticated request rejection
  await t.test('Security - Reject unauthenticated dashboard requests', async () => {
    const res = await request(app).get('/api/dashboard');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  // 2. Invalid month and year parameter validation
  await t.test('Validation - Reject invalid month parameters', async () => {
    const invalidMonths = [0, 13, -1, 'october', 2.5];
    for (const m of invalidMonths) {
      const res = await request(app)
        .get(`/api/dashboard?month=${m}&year=2026`)
        .set('Authorization', `Bearer ${userAToken}`);
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Month'));
    }
  });

  await t.test('Validation - Reject invalid year parameters', async () => {
    const invalidYears = [26, 'abcd', 12345, 999];
    for (const y of invalidYears) {
      const res = await request(app)
        .get(`/api/dashboard?month=10&year=${y}`)
        .set('Authorization', `Bearer ${userAToken}`);
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Year'));
    }
  });

  // 3. User with no transactions
  await t.test('Empty State - User with no transactions returns zero totals and empty arrays', async () => {
    const res = await request(app)
      .get('/api/dashboard?month=10&year=2026')
      .set('Authorization', `Bearer ${userBToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.month, 10);
    assert.strictEqual(res.body.data.year, 2026);
    assert.strictEqual(res.body.data.summary.totalIncome, 0);
    assert.strictEqual(res.body.data.summary.totalExpenses, 0);
    assert.strictEqual(res.body.data.summary.balance, 0);
    assert.deepStrictEqual(res.body.data.expenseBreakdown, []);
    assert.deepStrictEqual(res.body.data.incomeVsExpenses, []);
    assert.deepStrictEqual(res.body.data.recentTransactions, []);
  });

  // Populate data for User A and User B
  await t.test('Seed test transaction records', async () => {
    // User A transactions in October 2026
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'income',
        amount: 3000,
        category: 'Salary',
        description: 'Monthly Salary Paycheck',
        date: '2026-10-01T08:00:00.000Z',
      });

    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 150,
        category: 'Food',
        description: 'Grocery shopping at Mart',
        date: '2026-10-02T12:30:00.000Z',
      });

    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 50,
        category: 'Food',
        description: 'Dinner at cafe',
        date: '2026-10-05T19:00:00.000Z',
      });

    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 200,
        category: 'Utilities',
        description: 'Electricity bill',
        date: '2026-10-10T10:00:00.000Z',
      });

    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'income',
        amount: 500,
        category: 'Freelance',
        description: 'Web consulting gig',
        date: '2026-10-15T15:00:00.000Z',
      });

    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 100,
        category: 'Entertainment',
        description: 'Concert tickets',
        date: '2026-10-20T20:00:00.000Z',
      });

    // User A transaction in September 2026 (outside October)
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'expense',
        amount: 80,
        category: 'Food',
        description: 'September restaurant meal',
        date: '2026-09-15T14:00:00.000Z',
      });

    // User B transaction in October 2026
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        type: 'income',
        amount: 10000,
        category: 'Investment',
        description: 'User B dividend payment',
        date: '2026-10-01T09:00:00.000Z',
      });
  });

  // 4. Financial calculations
  await t.test('Calculations - Correct total income, total expenses, and balance', async () => {
    const res = await request(app)
      .get('/api/dashboard?month=10&year=2026')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);

    const { summary } = res.body.data;
    // Income: 3000 + 500 = 3500
    assert.strictEqual(summary.totalIncome, 3500);
    // Expenses: 150 + 50 + 200 + 100 = 500
    assert.strictEqual(summary.totalExpenses, 500);
    // Balance: 3500 - 500 = 3000
    assert.strictEqual(summary.balance, 3000);
  });

  // 5. Expense breakdown by category
  await t.test('Expense Breakdown - Group expenses by category with totals and percentages', async () => {
    const res = await request(app)
      .get('/api/dashboard?month=10&year=2026')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    const { expenseBreakdown } = res.body.data;

    // Must exclude income categories (Salary, Freelance)
    const categoryNames = expenseBreakdown.map((item) => item.category);
    assert.ok(!categoryNames.includes('Salary'));
    assert.ok(!categoryNames.includes('Freelance'));

    // Check categories present: Food (200), Utilities (200), Entertainment (100)
    assert.strictEqual(expenseBreakdown.length, 3);

    const foodCategory = expenseBreakdown.find((item) => item.category === 'Food');
    assert.ok(foodCategory);
    assert.strictEqual(foodCategory.amount, 200);
    assert.strictEqual(foodCategory.percentage, 40);

    const utilitiesCategory = expenseBreakdown.find((item) => item.category === 'Utilities');
    assert.ok(utilitiesCategory);
    assert.strictEqual(utilitiesCategory.amount, 200);
    assert.strictEqual(utilitiesCategory.percentage, 40);

    const entertainmentCategory = expenseBreakdown.find((item) => item.category === 'Entertainment');
    assert.ok(entertainmentCategory);
    assert.strictEqual(entertainmentCategory.amount, 100);
    assert.strictEqual(entertainmentCategory.percentage, 20);

    // Sorted descending by amount
    assert.ok(expenseBreakdown[0].amount >= expenseBreakdown[1].amount);
    assert.ok(expenseBreakdown[1].amount >= expenseBreakdown[2].amount);
  });

  // 6. Income vs. Expenses time-series
  await t.test('Time-Series - Daily income and expense comparisons ordered chronologically', async () => {
    const res = await request(app)
      .get('/api/dashboard?month=10&year=2026')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    const { incomeVsExpenses } = res.body.data;

    assert.ok(Array.isArray(incomeVsExpenses));
    assert.strictEqual(incomeVsExpenses.length, 6);

    // Verify chronological order
    for (let i = 0; i < incomeVsExpenses.length - 1; i++) {
      assert.ok(incomeVsExpenses[i].date < incomeVsExpenses[i + 1].date);
    }

    // Verify individual daily data
    const day1 = incomeVsExpenses.find((d) => d.date === '2026-10-01');
    assert.ok(day1);
    assert.strictEqual(day1.income, 3000);
    assert.strictEqual(day1.expense, 0);

    const day2 = incomeVsExpenses.find((d) => d.date === '2026-10-02');
    assert.ok(day2);
    assert.strictEqual(day2.income, 0);
    assert.strictEqual(day2.expense, 150);

    const day5 = incomeVsExpenses.find((d) => d.date === '2026-10-05');
    assert.ok(day5);
    assert.strictEqual(day5.income, 0);
    assert.strictEqual(day5.expense, 50);

    const day15 = incomeVsExpenses.find((d) => d.date === '2026-10-15');
    assert.ok(day15);
    assert.strictEqual(day15.income, 500);
    assert.strictEqual(day15.expense, 0);
  });

  // 7. Recent transactions list
  await t.test('Recent Transactions - Return latest 5 transactions sorted by date descending', async () => {
    const res = await request(app)
      .get('/api/dashboard?month=10&year=2026')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    const { recentTransactions } = res.body.data;

    assert.strictEqual(recentTransactions.length, 5);

    // Sorted descending by date
    for (let i = 0; i < recentTransactions.length - 1; i++) {
      const dateA = new Date(recentTransactions[i].date);
      const dateB = new Date(recentTransactions[i + 1].date);
      assert.ok(dateA >= dateB);
    }

    // First one should be latest transaction: 2026-10-20 Entertainment
    assert.strictEqual(recentTransactions[0].category, 'Entertainment');

    // Verify safe fields only
    recentTransactions.forEach((tx) => {
      assert.ok(tx._id);
      assert.ok(tx.type);
      assert.ok(tx.amount > 0);
      assert.ok(tx.category);
      assert.ok(tx.date);
    });
  });

  // 8. Month/Year filtering accuracy
  await t.test('Filtering - Filter dashboard data by another month (September 2026)', async () => {
    const res = await request(app)
      .get('/api/dashboard?month=9&year=2026')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    const { summary, expenseBreakdown, incomeVsExpenses } = res.body.data;

    assert.strictEqual(summary.totalIncome, 0);
    assert.strictEqual(summary.totalExpenses, 80);
    assert.strictEqual(summary.balance, -80);

    assert.strictEqual(expenseBreakdown.length, 1);
    assert.strictEqual(expenseBreakdown[0].category, 'Food');
    assert.strictEqual(expenseBreakdown[0].amount, 80);
    assert.strictEqual(expenseBreakdown[0].percentage, 100);

    assert.strictEqual(incomeVsExpenses.length, 1);
    assert.strictEqual(incomeVsExpenses[0].date, '2026-09-15');
    assert.strictEqual(incomeVsExpenses[0].expense, 80);
  });

  // 9. Default month/year when omitted
  await t.test('Defaults - Defaults to current month and year when query params are omitted', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    const now = new Date();
    assert.strictEqual(res.body.data.month, now.getUTCMonth() + 1);
    assert.strictEqual(res.body.data.year, now.getUTCFullYear());
  });

  // 10. Strict user isolation
  await t.test('Security & User Isolation - User B cannot see User A dashboard data and vice versa', async () => {
    // User B dashboard for October 2026
    const resB = await request(app)
      .get('/api/dashboard?month=10&year=2026')
      .set('Authorization', `Bearer ${userBToken}`);

    assert.strictEqual(resB.status, 200);
    // User B only has 1 income of 10000
    assert.strictEqual(resB.body.data.summary.totalIncome, 10000);
    assert.strictEqual(resB.body.data.summary.totalExpenses, 0);
    assert.strictEqual(resB.body.data.summary.balance, 10000);
    assert.deepStrictEqual(resB.body.data.expenseBreakdown, []);
    assert.strictEqual(resB.body.data.recentTransactions.length, 1);
    assert.strictEqual(resB.body.data.recentTransactions[0].category, 'Investment');

    // Confirm User A's October totals did not include User B's 10000
    const resA = await request(app)
      .get('/api/dashboard?month=10&year=2026')
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(resA.body.data.summary.totalIncome, 3500);
    assert.notStrictEqual(resA.body.data.summary.totalIncome, 13500);
  });

  // Teardown
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
