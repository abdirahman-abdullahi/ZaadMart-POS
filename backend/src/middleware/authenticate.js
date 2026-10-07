const jwt = require("jsonwebtoken");

const env = require("../config/env");
const { unauthorized, forbidden } = require("../utils/httpErrors");
const { findUserByUsername } = require("../repositories/authRepository");

async function authenticate(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith("Bearer ")
  ) {
    return next(
      unauthorized(
        "Authentication token is required",
        "TOKEN_REQUIRED"
      )
    );
  }

  const token = authorizationHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwt.secret);

    const user = await findUserByUsername(decoded.username);

    if (!user) {
      return next(
        unauthorized(
          "User associated with this token no longer exists",
          "USER_NOT_FOUND"
        )
      );
    }

    if (!user.is_active) {
      return next(
        forbidden(
          "This user account is inactive",
          "ACCOUNT_INACTIVE"
        )
      );
    }

    req.user = {
      userId: user.user_id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      employeeCode: user.employee_code,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        unauthorized(
          "Authentication token has expired",
          "TOKEN_EXPIRED"
        )
      );
    }

    return next(
      unauthorized(
        "Invalid authentication token",
        "INVALID_TOKEN"
      )
    );
  }
}

module.exports = authenticate;