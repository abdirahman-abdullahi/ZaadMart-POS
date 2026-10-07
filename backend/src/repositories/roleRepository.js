const pool = require("../config/database");

async function listRoles() {
  const result = await pool.query(`
    SELECT
      role_id,
      role_name,
      description,
      is_system_role,
      is_active,
      created_at,
      updated_at
    FROM auth.roles
    ORDER BY role_name
  `);

  return result.rows;
}

async function listPermissions() {
  const result = await pool.query(`
    SELECT
      permission_id,
      permission_code,
      permission_name,
      module,
      description,
      created_at
    FROM auth.permissions
    ORDER BY module, permission_code
  `);

  return result.rows;
}

async function getRoleById(roleId) {
  const result = await pool.query(
    `
    SELECT
      role_id,
      role_name,
      description,
      is_system_role,
      is_active
    FROM auth.roles
    WHERE role_id = $1
    LIMIT 1
    `,
    [roleId]
  );

  return result.rows[0] || null;
}

async function getRoleByName(roleName) {
  const result = await pool.query(
    `
    SELECT
      role_id,
      role_name,
      description,
      is_system_role,
      is_active
    FROM auth.roles
    WHERE role_name = $1
    LIMIT 1
    `,
    [roleName]
  );

  return result.rows[0] || null;
}

async function getPermissionByCode(permissionCode) {
  const result = await pool.query(
    `
    SELECT
      permission_id,
      permission_code,
      permission_name,
      module
    FROM auth.permissions
    WHERE permission_code = $1
    LIMIT 1
    `,
    [permissionCode]
  );

  return result.rows[0] || null;
}

async function getRolePermissions(roleId) {
  const result = await pool.query(
    `
    SELECT
      p.permission_id,
      p.permission_code,
      p.permission_name,
      p.module
    FROM auth.role_permissions rp
    JOIN auth.permissions p
      ON rp.permission_id = p.permission_id
    WHERE rp.role_id = $1
    ORDER BY p.module, p.permission_code
    `,
    [roleId]
  );

  return result.rows;
}

async function addPermissionToRole(roleId, permissionId) {
  await pool.query(
    `
    INSERT INTO auth.role_permissions (
      role_id,
      permission_id
    )
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    `,
    [roleId, permissionId]
  );
}

async function removePermissionFromRole(roleId, permissionId) {
  const result = await pool.query(
    `
    DELETE FROM auth.role_permissions
    WHERE role_id = $1
      AND permission_id = $2
    RETURNING role_id
    `,
    [roleId, permissionId]
  );

  return result.rowCount > 0;
}

module.exports = {
  listRoles,
  listPermissions,
  getRoleById,
  getRoleByName,
  getPermissionByCode,
  getRolePermissions,
  addPermissionToRole,
  removePermissionFromRole,
};