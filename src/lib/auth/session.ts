import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "sundawa_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24; // 24 hours

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  roleId: string;
  roleCode: string;
  roleName: string;
  permissions: string[];
}

function getAuthSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "sundawa-dev-secret-super-secure-key-32-chars-long!";
  return new TextEncoder().encode(secret);
}

/**
 * Sign session JWT with jose
 */
export async function signSession(payload: SessionPayload): Promise<string> {
  const secretKey = getAuthSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey);
}

/**
 * Verify session JWT with jose
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getAuthSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Set session cookie in Next.js Server Action / Route Handler
 */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Read current session from cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}
