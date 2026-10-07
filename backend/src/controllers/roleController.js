const {
  getAllRoles,
  getAllPermissions,
  getRoleDetails,
  addPermission,
  removePermission,
} = require("../services/roleService");

const {
  successResponse,
} = require("../utils/apiResponse");

async function listRoles(req, res) {
  const roles = await getAllRoles();

  return successResponse(res, {
    message: "Roles retrieved successfully",
    data: roles,
  });
}

async function listPermissions(req, res) {
  const permissions = await getAllPermissions();

  return successResponse(res, {
    message: "Permissions retrieved successfully",
    data: permissions,
  });
}

async function getRole(req, res) {
  const role = await getRoleDetails(
    req.params.roleId
  );

  return successResponse(res, {
    message: "Role retrieved successfully",
    data: role,
  });
}

async function assignPermission(req, res) {
  const permissions = await addPermission(
    req.params.roleId,
    req.body.permissionCode
  );

  return successResponse(res, {
    message: "Permission assigned successfully",
    data: {
      permissions,
    },
  });
}

async function revokePermission(req, res) {
  const permissions = await removePermission(
    req.params.roleId,
    req.params.permissionCode
  );

  return successResponse(res, {
    message: "Permission removed successfully",
    data: {
      permissions,
    },
  });
}

module.exports = {
  listRoles,
  listPermissions,
  getRole,
  assignPermission,
  revokePermission,
};