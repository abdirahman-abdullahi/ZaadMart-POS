const pool = require("../config/database");
const { successResponse } = require("../utils/apiResponse");

async function getHealth(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database,
        current_user AS user,
        NOW() AS server_time
    `);

    return successResponse(res, {
      message: "ZaadMart API is healthy",
      data: {
        database: result.rows[0].database,
        user: result.rows[0].user,
        serverTime: result.rows[0].server_time,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealth,
};