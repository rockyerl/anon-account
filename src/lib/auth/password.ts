import * as bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash plain-text password using bcrypt (SEC-05)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify plain-text password against bcrypt hash (SEC-05)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
