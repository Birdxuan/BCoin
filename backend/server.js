const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
const dbPath = path.join(__dirname, "db.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

// Initialize database table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      coin TEXT NOT NULL,
      amount REAL NOT NULL,
      price REAL NOT NULL,
      quantity REAL NOT NULL,
      timestamp TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// API Routes

// Get all trades
app.get("/api/trades", (req, res) => {
  db.all(
    "SELECT * FROM trades ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows || []);
    }
  );
});

// Add new trade
app.post("/api/trade", (req, res) => {
  const { coin, amount, price, quantity, timestamp } = req.body;

  // Validation
  if (!coin || !amount || !price || !quantity || !timestamp) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.run(
    "INSERT INTO trades (coin, amount, price, quantity, timestamp) VALUES (?, ?, ?, ?, ?)",
    [coin, amount, price, quantity, timestamp],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: "Trade recorded successfully" });
    }
  );
});

// Delete trade
app.delete("/api/trade/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM trades WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Trade deleted successfully" });
  });
});

// Get statistics
app.get("/api/stats", (req, res) => {
  db.all("SELECT * FROM trades", [], (err, trades) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!trades || trades.length === 0) {
      return res.json({
        totalCost: 0,
        totalValue: 0,
        totalQuantity: 0,
        pnl: 0,
        roi: 0,
        byCoins: {}
      });
    }

    // Calculate statistics
    let totalCost = 0;
    let byCoins = {};

    trades.forEach((trade) => {
      const cost = trade.amount;
      totalCost += cost;

      if (!byCoins[trade.coin]) {
        byCoins[trade.coin] = {
          quantity: 0,
          totalCost: 0,
          avgPrice: 0
        };
      }

      byCoins[trade.coin].quantity += trade.quantity;
      byCoins[trade.coin].totalCost += cost;
      byCoins[trade.coin].avgPrice = byCoins[trade.coin].totalCost / byCoins[trade.coin].quantity;
    });

    // Calculate total quantity
    let totalQuantity = 0;
    Object.values(byCoins).forEach((coin) => {
      totalQuantity += coin.quantity;
    });

    // Using last price as current price (in real app, use Binance API)
    let totalValue = 0;
    trades.forEach((trade) => {
      if (byCoins[trade.coin]) {
        totalValue += byCoins[trade.coin].quantity * trade.price;
      }
    });

    const pnl = totalValue - totalCost;
    const roi = totalCost > 0 ? ((pnl / totalCost) * 100).toFixed(2) : 0;

    res.json({
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
      totalQuantity: parseFloat(totalQuantity.toFixed(8)),
      pnl: parseFloat(pnl.toFixed(2)),
      roi: parseFloat(roi),
      byCoins: byCoins
    });
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 BCoin API Server`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`💾 Database: ${dbPath}`);
  console.log(`\n✅ API Ready!\n`);
});

// Error handling
process.on("SIGINT", () => {
  console.log("\n👋 Closing database and server...");
  db.close();
  process.exit(0);
});
