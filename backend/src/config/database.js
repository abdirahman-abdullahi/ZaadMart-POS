const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool({
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  user: env.database.user,
  password: env.database.password,
});

pool.on("connect", () => {
  console.log("Connected to ZaadMart PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
});

module.exports = pool;