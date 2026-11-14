import { describe, it, expect } from "vitest";
import { signSession, verifySession, type SessionPayload } from "@/lib/auth/session";

describe("Session Management & Cryptography (SEC-08)", () => {
  const dummyPayload: SessionPayload = {
    userId: "usr-12345",
    name: "John Doe",
    email: "john@sundawa.id",
    roleId: "role-admin",
    roleCode: "ADMIN",
    roleName: "Administrator",
    permissions: ["dashboard.view", "users.read", "users.create"],
  };

  it("should generate a valid JWT token signed with AUTH_SECRET", async () => {
    const token = await signSession(dummyPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3); // Standard JWT format
  });

  it("should correctly verify and decode the session token", async () => {
    const token = await signSession(dummyPayload);
    const decoded = await verifySession(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(dummyPayload.userId);
    expect(decoded?.email).toBe(dummyPayload.email);
    expect(decoded?.roleCode).toBe(dummyPayload.roleCode);
    expect(decoded?.permissions).toEqual(dummyPayload.permissions);
  });

  it("should return null for tampered or invalid tokens", async () => {
    const validToken = await signSession(dummyPayload);
    const tamperedToken = validToken.slice(0, -6) + "xxxxxx";

    const result = await verifySession(tamperedToken);
    expect(result).toBeNull();
  });
});
