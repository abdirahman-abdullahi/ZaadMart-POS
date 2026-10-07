const express = require("express");

const authenticate = require("../middleware/authenticate");
const requirePermission = require("../middleware/requirePermission");
const asyncHandler = require("../utils/asyncHandler");

const {
  listRoles,
  listPermissions,
  getRole,
  assignPermission,
  revokePermission,
} = require("../controllers/roleController");

const router = express.Router();

router.use(authenticate);
router.use(requirePermission("role.manage"));

router.get(
  "/",
  asyncHandler(listRoles)
);

router.get(
  "/permissions",
  asyncHandler(listPermissions)
);

router.get(
  "/:roleId",
  asyncHandler(getRole)
);

router.post(
  "/:roleId/permissions",
  asyncHandler(assignPermission)
);

router.delete(
  "/:roleId/permissions/:permissionCode",
  asyncHandler(revokePermission)
);

module.exports = router;