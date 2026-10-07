require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../src/config/database");
const { withTransaction } = require("../src/config/transaction");

async function createInitialAdmin() {
  const username = process.env.INITIAL_ADMIN_USERNAME;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const firstName = process.env.INITIAL_ADMIN_FIRST_NAME || "Admin";
  const lastName = process.env.INITIAL_ADMIN_LAST_NAME || "ZaadMart";

  if (!username || !password) {
    throw new Error(
      "INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD are required"
    );
  }

  if (password.length < 8) {
    throw new Error(
      "Initial admin password must contain at least 8 characters"
    );
  }

  const result = await withTransaction(async (client) => {
    // Check whether username already exists
    const existingUser = await client.query(
      `
      SELECT user_id
      FROM auth.users
      WHERE LOWER(username) = LOWER($1)
      `,
      [username]
    );

    if (existingUser.rowCount > 0) {
      throw new Error(
        `A user with username "${username}" already exists`
      );
    }

    // Find OWNER_ADMIN role
    const roleResult = await client.query(
      `
      SELECT role_id
      FROM auth.roles
      WHERE role_name = 'OWNER_ADMIN'
        AND is_active = TRUE
      `
    );

    if (roleResult.rowCount === 0) {
      throw new Error(
        "OWNER_ADMIN role does not exist or is inactive"
      );
    }

    const ownerAdminRoleId = roleResult.rows[0].role_id;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await client.query(
      `
      INSERT INTO auth.users (
        username,
        password_hash,
        first_name,
        last_name,
        is_active
      )
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING
        user_id,
        username,
        first_name,
        last_name,
        is_active,
        created_at
      `,
      [
        username,
        passwordHash,
        firstName,
        lastName,
      ]
    );

    const user = userResult.rows[0];

    // Assign OWNER_ADMIN role
    await client.query(
      `
      INSERT INTO auth.user_roles (
        user_id,
        role_id
      )
      VALUES ($1, $2)
      `,
      [
        user.user_id,
        ownerAdminRoleId,
      ]
    );

    return user;
  });

  console.log("");
  console.log("Initial ZaadMart administrator created successfully.");
  console.log("-----------------------------------------------");
  console.log(`Username: ${result.username}`);
  console.log(`Name: ${result.first_name} ${result.last_name}`);
  console.log(`User ID: ${result.user_id}`);
  console.log(`Active: ${result.is_active}`);
  console.log("-----------------------------------------------");
}

createInitialAdmin()
  .catch((error) => {
    console.error("");
    console.error("Unable to create initial administrator:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });