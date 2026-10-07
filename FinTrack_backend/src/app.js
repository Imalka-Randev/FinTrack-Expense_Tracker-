const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic API route structure (Placeholders)
app.get('/', (req, res) => {
  res.send('FinTrack API is running...');
});

app.use('/api/auth', (req, res, next) => {
  // TODO: Implement Auth routes
  res.status(501).json({ message: 'Auth routes not implemented yet' });
});

app.use('/api/transactions', (req, res, next) => {
  // TODO: Implement Transaction routes
  res.status(501).json({ message: 'Transaction routes not implemented yet' });
});

app.use('/api/budgets', (req, res, next) => {
  // TODO: Implement Budget routes
  res.status(501).json({ message: 'Budget routes not implemented yet' });
});

app.use('/api/dashboard', (req, res, next) => {
  // TODO: Implement Dashboard routes
  res.status(501).json({ message: 'Dashboard routes not implemented yet' });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
