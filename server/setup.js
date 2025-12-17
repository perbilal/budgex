// server/setup.js
import db from './db.js';
import bcrypt from 'bcryptjs'; // specific for password security

async function setup() {
  console.log("🔄 Starting Database Upgrade...");

  try {
    // 1. TRANSACTIONS TABLE (Already exists, but ensuring it's there)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL, 
        amount REAL NOT NULL,
        category TEXT, 
        description TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. INVENTORY / PRODUCTS TABLE (New!)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        cost REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        sales_count INTEGER DEFAULT 0
      )
    `);

    // 3. USERS TABLE (For Login)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    console.log("✅ All Tables Created (Transactions, Products, Users)");

    // 4. CREATE DEFAULT ADMIN USER
    // We will create a default admin: email="admin@budgemart.com", password="admin"
    // We hash the password so it's secure.
    const hashedPassword = await bcrypt.hash("admin", 10);
    
    try {
      await db.execute({
        sql: "INSERT INTO users (email, password) VALUES (?, ?)",
        args: ["admin@budgemart.com", hashedPassword]
      });
      console.log("👤 Default Admin User Created: admin@budgemart.com / admin");
    } catch (e) {
      console.log("ℹ️ Admin user already exists.");
    }

  } catch (error) {
    console.error("❌ Error setting up database:", error);
  }
}

setup();