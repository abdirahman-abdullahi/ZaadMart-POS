const pool = require("../config/database");

async function findUserByUsername(username) {
  const result = await pool.query(
    `
    SELECT
      user_id,
      username,
      password_hash,
      first_name,
      last_name,
      phone,
      email,
      employee_code,
      is_active,
      failed_login_attempts,
      locked_until,
      last_login_at
    FROM auth.users
    WHERE LOWER(username) = LOWER($1)
    LIMIT 1
    `,
    [username]
  );

  return result.rows[0] || null;
}

async function getUserRolesAndPermissions(userId) {
  const roleResult = await pool.query(
    `
    SELECT DISTINCT
      r.role_name
    FROM auth.user_roles ur
    JOIN auth.roles r
      ON ur.role_id = r.role_id
    WHERE ur.user_id = $1
      AND r.is_active = TRUE
    ORDER BY r.role_name
    `,
    [userId]
  );

  const permissionResult = await pool.query(
    `
    SELECT DISTINCT
      p.permission_code
    FROM auth.user_roles ur
    JOIN auth.roles r
      ON ur.role_id = r.role_id
    JOIN auth.role_permissions rp
      ON r.role_id = rp.role_id
    JOIN auth.permissions p
      ON rp.permission_id = p.permission_id
    WHERE ur.user_id = $1
      AND r.is_active = TRUE
    ORDER BY p.permission_code
    `,
    [userId]
  );

  return {
    roles: roleResult.rows.map((row) => row.role_name),
    permissions: permissionResult.rows.map(
      (row) => row.permission_code
    ),
  };
}

async function recordFailedLogin(userId, failedAttempts, lockedUntil = null) {
  await pool.query(
    `
    UPDATE auth.users
    SET
      failed_login_attempts = $2,
      locked_until = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    `,
    [userId, failedAttempts, lockedUntil]
  );
}

async function recordSuccessfulLogin(userId) {
  await pool.query(
    `
    UPDATE auth.users
    SET
      failed_login_attempts = 0,
      locked_until = NULL,
      last_login_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    `,
    [userId]
  );
}

module.exports = {
  findUserByUsername,
  getUserRolesAndPermissions,
  recordFailedLogin,
  recordSuccessfulLogin,
};