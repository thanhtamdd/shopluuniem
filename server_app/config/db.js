import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let pool = null;

export const connectDB = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log("✅ SQL Server connected");
    }
    return pool;
  } catch (err) {
    console.error("❌ SQL Server connection failed:", err.message);
    throw err;
  }
};

export const getPool = () => {
  if (!pool) {
    throw new Error("❌ DB not connected. Call connectDB() first");
  }
  return pool;
};
