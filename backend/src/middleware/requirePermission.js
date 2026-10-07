const {
  getUserRolesAndPermissions,
} = require("../repositories/authRepository");

const { forbidden } = require("../utils/httpErrors");

function requirePermission(permissionCode) {
  return async function (req, res, next) {
    try {
      if (!req.user) {
        return next(
          forbidden(
            "Authenticated user context is missing",
            "USER_CONTEXT_MISSING"
          )
        );
      }

      const access = await getUserRolesAndPermissions(
        req.user.userId
      );

      if (!access.permissions.includes(permissionCode)) {
        return next(
          forbidden(
            "You do not have permission to perform this action",
            "PERMISSION_DENIED"
          )
        );
      }

      req.user.roles = access.roles;
      req.user.permissions = access.permissions;

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = requirePermission;