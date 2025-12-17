// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- 1. AUTHENTICATION (LOGIN) ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email]
    });

    if (result.rows.length === 0) return res.status(401).json({ error: "User not found" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ error: "Wrong password" });

    // Login successful
    res.json({ message: "Login success", user: { email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 2. DASHBOARD DATA (Enhanced) ---
app.get('/dashboard-stats', async (req, res) => {
  try {
    // Calculate Totals
    const transRes = await db.execute("SELECT type, amount, date FROM transactions");
    
    let income = 0;
    let expense = 0;
    // For Chart: Array of { date: '2023-10-01', sales: 500 }
    let chartDataObj = {}; 

    transRes.rows.forEach(t => {
      const date = new Date(t.date).toLocaleDateString();
      if (t.type === 'income') {
        income += t.amount;
        // Add to chart data
        if (!chartDataObj[date]) chartDataObj[date] = 0;
        chartDataObj[date] += t.amount;
      } else {
        expense += t.amount;
      }
    });

    // Convert chart object to array for Recharts
    const salesChart = Object.keys(chartDataObj).map(date => ({
      date,
      sales: chartDataObj[date]
    }));

    // Top Selling Product (Mock logic until we link sales to inventory)
    const productRes = await db.execute("SELECT name, sales_count FROM products ORDER BY sales_count DESC LIMIT 5");

    res.json({
      totalIncome: income,
      totalExpense: expense,
      netProfit: income - expense,
      salesChart: salesChart,
      topProducts: productRes.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 3. INVENTORY MANAGEMENT ---
app.get('/products', async (req, res) => {
  const result = await db.execute("SELECT * FROM products");
  res.json(result.rows);
});

app.post('/products', async (req, res) => {
  const { name, category, price, cost, stock } = req.body;
  try {
    await db.execute({
      sql: "INSERT INTO products (name, category, price, cost, stock) VALUES (?, ?, ?, ?, ?)",
      args: [name, category, price, cost, stock]
    });
    res.json({ message: "Product added" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW: DELETE PRODUCT ENDPOINT
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute({
      sql: "DELETE FROM products WHERE id = ?",
      args: [id]
    });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 4. TRANSACTIONS (Updated with Stock Logic) ---
app.get('/transactions', async (req, res) => {
    const result = await db.execute("SELECT * FROM transactions ORDER BY date DESC");
    res.json(result.rows);
});

app.post('/transactions', async (req, res) => {
  // We now accept productId and quantity to update stock
  const { type, amount, description, category, productId, quantity } = req.body;
  
  try {
    // 1. Save the Transaction
    await db.execute({
      sql: "INSERT INTO transactions (type, amount, description, category) VALUES (?, ?, ?, ?)",
      args: [type, amount, description, category || 'General']
    });

    // 2. IF it is a SALE (Income) and linked to a Product -> Decrease Stock
    if (type === 'income' && productId && quantity) {
      await db.execute({
        sql: "UPDATE products SET stock = stock - ?, sales_count = sales_count + ? WHERE id = ?",
        args: [quantity, quantity, productId]
      });
    }

    res.json({ message: "Transaction added and stock updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// --- 5. CHANGE PASSWORD SETTING ---
app.put('/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    // 1. Find the user
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email]
    });

    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = result.rows[0];

    // 2. Check if OLD password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect old password" });

    // 3. Hash the NEW password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update database
    await db.execute({
      sql: "UPDATE users SET password = ? WHERE email = ?",
      args: [hashedNewPassword, email]
    });

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});