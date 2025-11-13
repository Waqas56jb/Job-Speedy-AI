import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();


const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  port: process.env.POSTGRES_PORT,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then(() => {
    console.log("Connected Successfully");
  })
  .catch((err) => {
    console.error("Connection error:", err.stack);
  });
export { pool };