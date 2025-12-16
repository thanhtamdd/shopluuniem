import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB, getPool } from "./config/db.js";

// Import router
import productRoute from "./API/Router/product.router.js";
import categoryRoute from "./API/Router/category.router.js";
import userRoute from "./API/Router/user.router.js"; // user/admin router

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Port
const PORT = process.env.PORT || 8000;

// Kết nối DB trước khi chạy server
(async () => {
  try {
    await connectDB();
    console.log("🚀 Database connected successfully");
  } catch (err) {
    console.error("❌ Cannot connect database:", err.message);
    process.exit(1);
  }
})();

// Test DB
app.get("/api/test-db", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT 1 AS connected");
    res.json({ connected: true, result: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// Register API routes
app.use("/api/Product", productRoute);
app.use("/api/Category", categoryRoute);
app.use("/api/admin/user", userRoute); // đăng ký router user/admin

// 404 cho tất cả route khác
app.use((req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
