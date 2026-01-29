import crypto from "crypto";

const users = new Map(); // Stores users in memory

/**
 * Registers a new user.
 * @param {string} email
 * @param {string} password
 * @returns {{success: boolean, message: string, userId?: string}}
 */
export function registerUser(email, password) {
  if (users.has(email)) {
    return { success: false, message: 'User already exists.' };
  }

  const userId = crypto.randomUUID();
  // IMPORTANT: Storing plain text passwords is not secure. 
  // This is a temporary solution for local development.
  users.set(email, {
    id: userId,
    email,
    password,
  });

  console.log('Registered new user:', { id: userId, email });
  return { success: true, message: 'User registered successfully.', userId };
}

/**
 * Logs in a user.
 * @param {string} email
 * @param {string} password
 * @returns {{success: boolean, message: string, userId?: string}}
 */
export function loginUser(email, password) {
  const user = users.get(email);

  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  if (user.password !== password) {
    return { success: false, message: 'Invalid password.' };
  }

  console.log('User logged in:', { id: user.id, email });
  return { success: true, message: 'Login successful.', userId: user.id };
}
