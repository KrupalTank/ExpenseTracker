const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for mobile & frontend apps
app.use(cors({
  origin: '*', // Allows local dev and deployed frontend domains
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'Internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});