const {
  listRoles,
  listPermissions,
  getRoleById,
  getPermissionByCode,
  getRolePermissions,
  addPermissionToRole,
  removePermissionFromRole,
} = require("../repositories/roleRepository");

const {
  notFound,
  badRequest,
} = require("../utils/httpErrors");

async function getAllRoles() {
  return listRoles();
}

async function getAllPermissions() {
  return listPermissions();
}

async function getRoleDetails(roleId) {
  const role = await getRoleById(roleId);

  if (!role) {
    throw notFound(
      "Role not found",
      "ROLE_NOT_FOUND"
    );
  }

  const permissions = await getRolePermissions(roleId);

  return {
    ...role,
    permissions,
  };
}

async function addPermission(roleId, permissionCode) {
  const role = await getRoleById(roleId);

  if (!role) {
    throw notFound(
      "Role not found",
      "ROLE_NOT_FOUND"
    );
  }

  if (!role.is_active) {
    throw badRequest(
      "Cannot modify an inactive role",
      "ROLE_INACTIVE"
    );
  }

  const permission =
    await getPermissionByCode(permissionCode);

  if (!permission) {
    throw notFound(
      "Permission not found",
      "PERMISSION_NOT_FOUND"
    );
  }

  await addPermissionToRole(
    roleId,
    permission.permission_id
  );

  return getRolePermissions(roleId);
}

async function removePermission(roleId, permissionCode) {
  const role = await getRoleById(roleId);

  if (!role) {
    throw notFound(
      "Role not found",
      "ROLE_NOT_FOUND"
    );
  }

  const permission =
    await getPermissionByCode(permissionCode);

  if (!permission) {
    throw notFound(
      "Permission not found",
      "PERMISSION_NOT_FOUND"
    );
  }

  if (
    role.role_name === "OWNER_ADMIN" &&
    [
      "user.manage",
      "role.manage",
      "settings.manage",
    ].includes(permissionCode)
  ) {
    throw badRequest(
      "Critical Owner/Admin permissions cannot be removed",
      "CRITICAL_PERMISSION_PROTECTED"
    );
  }

  const removed = await removePermissionFromRole(
    roleId,
    permission.permission_id
  );

  if (!removed) {
    throw badRequest(
      "Role does not have this permission",
      "PERMISSION_NOT_ASSIGNED"
    );
  }

  return getRolePermissions(roleId);
}

module.exports = {
  getAllRoles,
  getAllPermissions,
  getRoleDetails,
  addPermission,
  removePermission,
};