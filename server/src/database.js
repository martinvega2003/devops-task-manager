import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // Set in .env (e.g., postgres://user:password@localhost:5432/mydb)
});

export default pool;

