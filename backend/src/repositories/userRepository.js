const pool = require("../config/database");

async function findUserByUsername(username) {
  const result = await pool.query(
    `
    SELECT
      user_id,
      username,
      first_name,
      last_name,
      phone,
      email,
      employee_code,
      is_active,
      created_at,
      updated_at
    FROM auth.users
    WHERE LOWER(username) = LOWER($1)
    LIMIT 1
    `,
    [username]
  );

  return result.rows[0] || null;
}

async function findUserById(userId) {
  const result = await pool.query(
    `
    SELECT
      user_id,
      username,
      first_name,
      last_name,
      phone,
      email,
      employee_code,
      is_active,
      failed_login_attempts,
      locked_until,
      last_login_at,
      created_at,
      updated_at
    FROM auth.users
    WHERE user_id = $1
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

async function createUser(client, user) {
  const result = await client.query(
    `
    INSERT INTO auth.users (
      username,
      password_hash,
      first_name,
      last_name,
      phone,
      email,
      employee_code,
      is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
    RETURNING
      user_id,
      username,
      first_name,
      last_name,
      phone,
      email,
      employee_code,
      is_active,
      created_at
    `,
    [
      user.username,
      user.passwordHash,
      user.firstName,
      user.lastName || null,
      user.phone || null,
      user.email || null,
      user.employeeCode || null,
    ]
  );

  return result.rows[0];
}

async function listUsers() {
  const result = await pool.query(
    `
    SELECT
      u.user_id,
      u.username,
      u.first_name,
      u.last_name,
      u.phone,
      u.email,
      u.employee_code,
      u.is_active,
      u.last_login_at,
      u.created_at,
      COALESCE(
        ARRAY_AGG(r.role_name)
          FILTER (WHERE r.role_name IS NOT NULL),
        ARRAY[]::VARCHAR[]
      ) AS roles
    FROM auth.users u
    LEFT JOIN auth.user_roles ur
      ON u.user_id = ur.user_id
    LEFT JOIN auth.roles r
      ON ur.role_id = r.role_id
    GROUP BY
      u.user_id,
      u.username,
      u.first_name,
      u.last_name,
      u.phone,
      u.email,
      u.employee_code,
      u.is_active,
      u.last_login_at,
      u.created_at
    ORDER BY u.created_at DESC
    `
  );

  return result.rows;
}

async function updateUser(userId, fields) {
  const result = await pool.query(
    `
    UPDATE auth.users
    SET
      first_name = COALESCE($2, first_name),
      last_name = COALESCE($3, last_name),
      phone = COALESCE($4, phone),
      email = COALESCE($5, email),
      employee_code = COALESCE($6, employee_code),
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    RETURNING
      user_id,
      username,
      first_name,
      last_name,
      phone,
      email,
      employee_code,
      is_active,
      updated_at
    `,
    [
      userId,
      fields.firstName ?? null,
      fields.lastName ?? null,
      fields.phone ?? null,
      fields.email ?? null,
      fields.employeeCode ?? null,
    ]
  );

  return result.rows[0] || null;
}

async function setUserActive(userId, isActive) {
  const result = await pool.query(
    `
    UPDATE auth.users
    SET
      is_active = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    RETURNING
      user_id,
      username,
      is_active,
      updated_at
    `,
    [userId, isActive]
  );

  return result.rows[0] || null;
}

async function updatePassword(userId, passwordHash) {
  const result = await pool.query(
    `
    UPDATE auth.users
    SET
      password_hash = $2,
      failed_login_attempts = 0,
      locked_until = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    RETURNING user_id
    `,
    [userId, passwordHash]
  );

  return result.rows[0] || null;
}

async function getRoleByName(roleName) {
  const result = await pool.query(
    `
    SELECT role_id, role_name
    FROM auth.roles
    WHERE role_name = $1
      AND is_active = TRUE
    LIMIT 1
    `,
    [roleName]
  );

  return result.rows[0] || null;
}

async function assignRole(client, userId, roleId) {
  await client.query(
    `
    INSERT INTO auth.user_roles (
      user_id,
      role_id
    )
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    `,
    [userId, roleId]
  );
}

async function removeRole(userId, roleId) {
  const result = await pool.query(
    `
    DELETE FROM auth.user_roles
    WHERE user_id = $1
      AND role_id = $2
    RETURNING user_id
    `,
    [userId, roleId]
  );

  return result.rowCount > 0;
}

async function getUserRoles(userId) {
  const result = await pool.query(
    `
    SELECT
      r.role_id,
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

  return result.rows;
}

module.exports = {
  findUserByUsername,
  findUserById,
  createUser,
  listUsers,
  updateUser,
  setUserActive,
  updatePassword,
  getRoleByName,
  assignRole,
  removeRole,
  getUserRoles,
};