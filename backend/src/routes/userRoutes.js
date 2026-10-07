const express = require("express");

const authenticate = require("../middleware/authenticate");
const requirePermission = require("../middleware/requirePermission");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");

const {
  validateCreateUser,
  validateResetPassword,
} = require("../validators/userValidator");

const {
  createUser,
  listUsers,
  getUser,
  updateUser,
  activateUser,
  deactivateUser,
  resetPassword,
  assignRole,
  removeRole,
} = require("../controllers/userController");

const router = express.Router();

router.use(authenticate);
router.use(requirePermission("user.manage"));

router.get(
  "/",
  asyncHandler(listUsers)
);

router.get(
  "/:userId",
  asyncHandler(getUser)
);

router.post(
  "/",
  validate(validateCreateUser),
  asyncHandler(createUser)
);

router.patch(
  "/:userId",
  asyncHandler(updateUser)
);

router.patch(
  "/:userId/activate",
  asyncHandler(activateUser)
);

router.patch(
  "/:userId/deactivate",
  asyncHandler(deactivateUser)
);

router.patch(
  "/:userId/password",
  validate(validateResetPassword),
  asyncHandler(resetPassword)
);

router.post(
  "/:userId/roles",
  asyncHandler(assignRole)
);

router.delete(
  "/:userId/roles/:roleName",
  asyncHandler(removeRole)
);

module.exports = router;