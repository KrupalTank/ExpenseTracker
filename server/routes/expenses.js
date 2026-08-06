const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// 1. GET TODAY, MONTH, AND YEAR SUMMARY
router.get('/summary', async (req, res) => {
  const userId = req.user.id;

  try {
    const todayQuery = `
      SELECT COALESCE(SUM(amount), 0) AS today_total
      FROM expenses
      WHERE user_id = $1 AND expense_date = CURRENT_DATE;
    `;

    const monthQuery = `
      SELECT COALESCE(SUM(amount), 0) AS month_total
      FROM expenses
      WHERE user_id = $1 
        AND DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE);
    `;

    const yearQuery = `
      SELECT COALESCE(SUM(amount), 0) AS year_total
      FROM expenses
      WHERE user_id = $1 
        AND DATE_TRUNC('year', expense_date) = DATE_TRUNC('year', CURRENT_DATE);
    `;

    const [todayResult, monthResult, yearResult] = await Promise.all([
      db.query(todayQuery, [userId]),
      db.query(monthQuery, [userId]),
      db.query(yearQuery, [userId]),
    ]);

    res.json({
      todayTotal: parseFloat(todayResult.rows[0].today_total),
      monthTotal: parseFloat(monthResult.rows[0].month_total),
      yearTotal: parseFloat(yearResult.rows[0].year_total),
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ message: 'Failed to fetch summary.' });
  }
});

// 2. GET FREQUENTLY USED TITLE SUGGESTIONS & THEIR CATEGORIES
router.get('/suggestions', async (req, res) => {
  const userId = req.user.id;

  try {
    const queryText = `
      SELECT title, category, COUNT(*) as usage_count
      FROM expenses
      WHERE user_id = $1
      GROUP BY title, category
      ORDER BY usage_count DESC, MAX(created_at) DESC
      LIMIT 15;
    `;
    const result = await db.query(queryText, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).json({ message: 'Failed to fetch suggestions.' });
  }
});

// 3. GET CURRENT MONTH EXPENSES
router.get('/current-month', async (req, res) => {
  const userId = req.user.id;

  try {
    const queryText = `
      SELECT id, user_id, title, amount, category, expense_date::TEXT as expense_date, created_at
      FROM expenses
      WHERE user_id = $1 
        AND DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)
      ORDER BY expense_date DESC, id DESC;
    `;
    const result = await db.query(queryText, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching current month expenses:', err);
    res.status(500).json({ message: 'Failed to fetch current month expenses.' });
  }
});

// 4. CREATE EXPENSE
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { title, amount, category, expense_date } = req.body;

  if (!title || !amount) {
    return res.status(400).json({ message: 'Title and amount are required.' });
  }

  try {
    const dateToInsert = expense_date && expense_date.trim() !== '' 
      ? expense_date 
      : new Date().toLocaleDateString('en-CA');

    const queryText = `
      INSERT INTO expenses (user_id, title, amount, category, expense_date)
      VALUES ($1, $2, $3, $4, $5::DATE)
      RETURNING *, expense_date::TEXT as expense_date;
    `;
    const values = [userId, title.trim(), amount, category || 'General', dateToInsert];
    const result = await db.query(queryText, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ message: 'Failed to create expense.' });
  }
});

// 5. GET EXPENSES BY DATE RANGE (FIXED QUERY PARAMETERS)
router.get('/range', async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'startDate and endDate parameters are required.' });
  }

  try {
    const queryText = `
      SELECT id, user_id, title, amount, category, expense_date::TEXT as expense_date, created_at
      FROM expenses
      WHERE user_id = $1 AND expense_date >= $2 AND expense_date <= $3
      ORDER BY expense_date DESC, id DESC;
    `;
    // Pass all three values inside a single parameters array
    const result = await db.query(queryText, [userId, startDate, endDate]);
    const total = result.rows.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    res.json({
      startDate,
      endDate,
      total,
      count: result.rows.length,
      expenses: result.rows
    });
  } catch (err) {
    console.error('Error fetching expenses range:', err);
    res.status(500).json({ message: 'Failed to fetch expenses by range.' });
  }
});

// 6. GET HISTORICAL MONTHLY TOTALS
router.get('/history/summary', async (req, res) => {
  const userId = req.user.id;

  try {
    const queryText = `
      SELECT 
        TO_CHAR(expense_date, 'YYYY-MM') AS month_key,
        TO_CHAR(expense_date, 'Month YYYY') AS month_label,
        SUM(amount) AS total_amount,
        COUNT(id) AS transaction_count
      FROM expenses
      WHERE user_id = $1
      GROUP BY month_key, month_label
      ORDER BY month_key DESC;
    `;
    const result = await db.query(queryText, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching monthly history summary:', err);
    res.status(500).json({ message: 'Failed to fetch history summary.' });
  }
});

// 7. GET ALL EXPENSES FOR A SPECIFIC MONTH
router.get('/history/month/:monthKey', async (req, res) => {
  const userId = req.user.id;
  const { monthKey } = req.params;

  try {
    const queryText = `
      SELECT id, user_id, title, amount, category, expense_date::TEXT as expense_date, created_at
      FROM expenses
      WHERE user_id = $1 AND TO_CHAR(expense_date, 'YYYY-MM') = $2
      ORDER BY expense_date DESC, id DESC;
    `;
    const result = await db.query(queryText, [userId, monthKey]);
    const total = result.rows.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    res.json({
      monthKey,
      total,
      expenses: result.rows
    });
  } catch (err) {
    console.error('Error fetching month expenses:', err);
    res.status(500).json({ message: 'Failed to fetch monthly expenses.' });
  }
});

// 8. UPDATE EXPENSE
router.put('/:id', async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, amount, category, expense_date } = req.body;

  try {
    const queryText = `
      UPDATE expenses
      SET title = $1, amount = $2, category = $3, expense_date = $4::DATE
      WHERE id = $5 AND user_id = $6
      RETURNING *, expense_date::TEXT as expense_date;
    `;
    const result = await db.query(queryText, [title, amount, category, expense_date, id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found or unauthorized.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ message: 'Failed to update expense.' });
  }
});

// 9. DELETE EXPENSE
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found or unauthorized.' });
    }

    res.json({ message: 'Expense deleted successfully.', id });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ message: 'Failed to delete expense.' });
  }
});

module.exports = router;