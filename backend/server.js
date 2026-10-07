const app = require("./src/app");
const env = require("./src/config/env");
const pool = require("./src/config/database");

async function startServer() {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database,
        current_user AS user
    `);

    console.log(
      `Database connected: ${result.rows[0].database} as ${result.rows[0].user}`
    );

    app.listen(env.port, () => {
      console.log(`ZaadMart API running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Unable to connect to PostgreSQL:");
    console.error(error.message);

    process.exit(1);
  }
}

startServer();