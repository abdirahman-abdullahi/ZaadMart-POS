const {
  createNewUser,
  getUsers,
  getUserById,
  editUser,
  changeUserStatus,
  resetUserPassword,
  addRoleToUser,
  removeRoleFromUser,
} = require("../services/userService");

const {
  successResponse,
} = require("../utils/apiResponse");

async function createUser(req, res) {
  const result = await createNewUser(req.body);

  return successResponse(res, {
    statusCode: 201,
    message: "User created successfully",
    data: result,
  });
}

async function listUsers(req, res) {
  const users = await getUsers();

  return successResponse(res, {
    message: "Users retrieved successfully",
    data: users,
  });
}

async function getUser(req, res) {
  const user = await getUserById(req.params.userId);

  return successResponse(res, {
    message: "User retrieved successfully",
    data: user,
  });
}

async function updateUser(req, res) {
  const user = await editUser(
    req.params.userId,
    req.body
  );

  return successResponse(res, {
    message: "User updated successfully",
    data: user,
  });
}

async function activateUser(req, res) {
  const user = await changeUserStatus(
    req.params.userId,
    true,
    req.user.userId
  );

  return successResponse(res, {
    message: "User activated successfully",
    data: user,
  });
}

async function deactivateUser(req, res) {
  const user = await changeUserStatus(
    req.params.userId,
    false,
    req.user.userId
  );

  return successResponse(res, {
    message: "User deactivated successfully",
    data: user,
  });
}

async function resetPassword(req, res) {
  await resetUserPassword(
    req.params.userId,
    req.body.password
  );

  return successResponse(res, {
    message: "Password reset successfully",
  });
}

async function assignRole(req, res) {
  const roles = await addRoleToUser(
    req.params.userId,
    req.body.roleName
  );

  return successResponse(res, {
    message: "Role assigned successfully",
    data: {
      roles: roles.map((role) => role.role_name),
    },
  });
}

async function removeRole(req, res) {
  const roles = await removeRoleFromUser(
    req.params.userId,
    req.params.roleName
  );

  return successResponse(res, {
    message: "Role removed successfully",
    data: {
      roles: roles.map((role) => role.role_name),
    },
  });
}

module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  activateUser,
  deactivateUser,
  resetPassword,
  assignRole,
  removeRole,
};