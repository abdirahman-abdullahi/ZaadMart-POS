const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const env = require("../config/env");

const {
  MAX_FAILED_LOGIN_ATTEMPTS,
  ACCOUNT_LOCK_MINUTES,
} = require("../config/constants");

const {
  unauthorized,
  forbidden,
} = require("../utils/httpErrors");

const {
  findUserByUsername,
  getUserRolesAndPermissions,
  recordFailedLogin,
  recordSuccessfulLogin,
} = require("../repositories/authRepository");

const DUMMY_PASSWORD_HASH ="$2b$12$C6UzMDM.H6dfI/f/IKcEe.9Xz9J1vFj8J6N8M/PZP.0U0Z2K5vU1a";

async function login(username, password) {
  const user = await findUserByUsername(username);

  if (!user) {
  await bcrypt.compare(password, DUMMY_PASSWORD_HASH);

  throw unauthorized(
    "Invalid username or password",
    "INVALID_CREDENTIALS"
  );
  }

  if (!user.is_active) {
    throw forbidden(
      "This user account is inactive",
      "ACCOUNT_INACTIVE"
    );
  }

  if (user.locked_until) {
    const lockedUntil = new Date(user.locked_until);

    if (lockedUntil > new Date()) {
      throw forbidden(
        "Account temporarily locked due to repeated failed login attempts",
        "ACCOUNT_LOCKED"
      );
    }
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    const newFailedAttempts =
      Number(user.failed_login_attempts || 0) + 1;

    let lockedUntil = null;

    if (newFailedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      lockedUntil = new Date(
        Date.now() + ACCOUNT_LOCK_MINUTES * 60 * 1000
      );
    }

    await recordFailedLogin(
      user.user_id,
      newFailedAttempts,
      lockedUntil
    );

    if (lockedUntil) {
      throw forbidden(
        "Account temporarily locked due to repeated failed login attempts",
        "ACCOUNT_LOCKED"
      );
    }

    throw unauthorized(
      "Invalid username or password",
      "INVALID_CREDENTIALS"
    );
  }

  await recordSuccessfulLogin(user.user_id);

  const access = await getUserRolesAndPermissions(user.user_id);

  const token = jwt.sign(
    {
      userId: user.user_id,
      username: user.username,
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expiresIn,
    }
  );

  return {
    token,
    user: {
      userId: user.user_id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      employeeCode: user.employee_code,
      roles: access.roles,
      permissions: access.permissions,
    },
  };
}

module.exports = {
  login,
};