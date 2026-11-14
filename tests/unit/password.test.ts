import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("Password Security (SEC-05)", () => {
  it("should securely hash a plain text password using bcrypt", async () => {
    const rawPassword = "StrongPassword123!";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
  });

  it("should successfully verify correct password against hash", async () => {
    const rawPassword = "MySecretPassword!";
    const hash = await hashPassword(rawPassword);

    const isValid = await verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);
  });

  it("should reject incorrect password against hash", async () => {
    const rawPassword = "MySecretPassword!";
    const wrongPassword = "WrongPassword!";
    const hash = await hashPassword(rawPassword);

    const isValid = await verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });
});
