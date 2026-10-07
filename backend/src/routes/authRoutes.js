const express = require("express");

const {
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");

const {
  validateLogin,
} = require("../validators/authValidator");

const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const loginRateLimiter = require("../middleware/loginRateLimiter");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router.get(
  "/me",
  authenticate,
  asyncHandler(getCurrentUser)
);

router.post(
  "/login",
  loginRateLimiter,
  validate(validateLogin),
  asyncHandler(loginUser)
);

module.exports = router;