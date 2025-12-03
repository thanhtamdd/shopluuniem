import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

let pool;

export const getPool = async () => {
    if (!pool) {
        try {
            pool = await sql.connect(dbConfig);
            console.log("Connected to SQL Server successfully");
        } catch (err) {
            console.error("Database connection failed:", err);
        }
    }
    return pool;
};
