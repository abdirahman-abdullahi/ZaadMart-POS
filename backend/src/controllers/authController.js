const { login } = require("../services/authService");
const { successResponse } = require("../utils/apiResponse");
const {
  getUserRolesAndPermissions,
} = require("../repositories/authRepository");


async function loginUser(req, res) {
  const { username, password } = req.body;

  const result = await login(username.trim(), password);

  return successResponse(res, {
    message: "Login successful",
    data: result,
  });
}

async function getCurrentUser(req, res) {
  const access = await getUserRolesAndPermissions(
    req.user.userId
  );

  return successResponse(res, {
    message: "Current user retrieved successfully",
    data: {
      userId: req.user.userId,
      username: req.user.username,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      employeeCode: req.user.employeeCode,
      roles: access.roles,
      permissions: access.permissions,
    },
  });
}



module.exports = {
  loginUser,
  getCurrentUser,
};