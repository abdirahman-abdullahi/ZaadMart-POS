const bcrypt = require("bcrypt");

const { withTransaction } = require("../config/transaction");

const {
  conflict,
  notFound,
  badRequest,
} = require("../utils/httpErrors");

const {
  findUserByUsername,
  findUserById,
  createUser,
  listUsers,
  updateUser,
  setUserActive,
  updatePassword,
  getRoleByName,
  assignRole,
  removeRole,
  getUserRoles,
} = require("../repositories/userRepository");

async function createNewUser(data) {
  const existingUser = await findUserByUsername(data.username);

  if (existingUser) {
    throw conflict(
      "Username already exists",
      "USERNAME_EXISTS"
    );
  }

  const role = await getRoleByName(data.roleName);

  if (!role) {
    throw badRequest(
      "Invalid or inactive role",
      "INVALID_ROLE"
    );
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await withTransaction(async (client) => {
    const createdUser = await createUser(client, {
      username: data.username.trim(),
      passwordHash,
      firstName: data.firstName.trim(),
      lastName: data.lastName?.trim(),
      phone: data.phone?.trim(),
      email: data.email?.trim(),
      employeeCode: data.employeeCode?.trim(),
    });

    await assignRole(client, createdUser.user_id, role.role_id);

    return createdUser;
  });

  return {
    user,
    role: role.role_name,
  };
}

async function getUsers() {
  return listUsers();
}

async function getUserById(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw notFound(
      "User not found",
      "USER_NOT_FOUND"
    );
  }

  const roles = await getUserRoles(userId);

  return {
    ...user,
    roles: roles.map((role) => role.role_name),
  };
}

async function editUser(userId, fields) {
  const existing = await findUserById(userId);

  if (!existing) {
    throw notFound(
      "User not found",
      "USER_NOT_FOUND"
    );
  }

  return updateUser(userId, fields);
}

async function changeUserStatus(userId, isActive, currentUserId) {
  if (userId === currentUserId && isActive === false) {
    throw badRequest(
      "You cannot deactivate your own account",
      "SELF_DEACTIVATION_NOT_ALLOWED"
    );
  }

  const existing = await findUserById(userId);

  if (!existing) {
    throw notFound(
      "User not found",
      "USER_NOT_FOUND"
    );
  }

  return setUserActive(userId, isActive);
}

async function resetUserPassword(userId, password) {
  const existing = await findUserById(userId);

  if (!existing) {
    throw notFound(
      "User not found",
      "USER_NOT_FOUND"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await updatePassword(userId, passwordHash);

  return true;
}

async function addRoleToUser(userId, roleName) {
  const user = await findUserById(userId);

  if (!user) {
    throw notFound(
      "User not found",
      "USER_NOT_FOUND"
    );
  }

  const role = await getRoleByName(roleName);

  if (!role) {
    throw badRequest(
      "Invalid or inactive role",
      "INVALID_ROLE"
    );
  }

  await withTransaction(async (client) => {
    await assignRole(client, userId, role.role_id);
  });

  return getUserRoles(userId);
}

async function removeRoleFromUser(userId, roleName) {
  const user = await findUserById(userId);

  if (!user) {
    throw notFound(
      "User not found",
      "USER_NOT_FOUND"
    );
  }

  const role = await getRoleByName(roleName);

  if (!role) {
    throw badRequest(
      "Invalid role",
      "INVALID_ROLE"
    );
  }

  const currentRoles = await getUserRoles(userId);

  if (currentRoles.length <= 1) {
    throw badRequest(
      "A user must have at least one role",
      "LAST_ROLE_REMOVAL_NOT_ALLOWED"
    );
  }

  const removed = await removeRole(
    userId,
    role.role_id
  );

  if (!removed) {
    throw badRequest(
      "User does not have this role",
      "ROLE_NOT_ASSIGNED"
    );
  }

  return getUserRoles(userId);
}

module.exports = {
  createNewUser,
  getUsers,
  getUserById,
  editUser,
  changeUserStatus,
  resetUserPassword,
  addRoleToUser,
  removeRoleFromUser,
};