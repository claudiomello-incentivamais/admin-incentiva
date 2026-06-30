import { parse, serialize } from "cookie-es";

import {
  AUTH_IDENTITIES_PUBLIC,
  type AuthIdentityPublic,
  type AuthSession,
} from "./admin-auth.shared";

type AuthIdentityRecord = AuthIdentityPublic & {
  passcode: string;
};

type SessionCookiePayload = {
  v: 1;
  identityId: string;
  iat: number;
  exp: number;
};

const AUTH_COOKIE_NAME = "admin_incentiva_session";
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

const authIdentityRecords: AuthIdentityRecord[] = [
  {
    ...AUTH_IDENTITIES_PUBLIC[0],
    passcode: "5501",
  },
  {
    ...AUTH_IDENTITIES_PUBLIC[1],
    passcode: "5400",
  },
  {
    ...AUTH_IDENTITIES_PUBLIC[2],
    passcode: "5300",
  },
  {
    ...AUTH_IDENTITIES_PUBLIC[3],
    passcode: "5200",
  },
];

let secretKeyPromise: Promise<CryptoKey> | null = null;

function getAuthSecret() {
  const envSecret =
    (typeof process !== "undefined" && process.env.ADMIN_INCENTIVA_AUTH_SECRET) ||
    (import.meta.env.ADMIN_INCENTIVA_AUTH_SECRET as string | undefined);

  return envSecret || "admin-incentiva-local-fallback-secret";
}

function getSecretKey() {
  if (!secretKeyPromise) {
    secretKeyPromise = crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(getAuthSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
  }

  return secretKeyPromise;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(`${normalized}${padding}`);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signValue(value: string) {
  const key = await getSecretKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function encodeSessionCookie(identityId: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: SessionCookiePayload = {
    v: 1,
    identityId,
    iat: issuedAt,
    exp: issuedAt + AUTH_COOKIE_MAX_AGE_SECONDS,
  };

  const payloadEncoded = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signValue(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

async function decodeSessionCookie(value: string | null | undefined) {
  if (!value) return null;

  const [payloadEncoded, signature] = value.split(".");
  if (!payloadEncoded || !signature) return null;

  const expectedSignature = await signValue(payloadEncoded);
  if (expectedSignature !== signature) return null;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payloadEncoded)),
    ) as SessionCookiePayload;

    if (payload.v !== 1 || payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function getIdentityById(identityId: string) {
  return authIdentityRecords.find((identity) => identity.id === identityId) ?? null;
}

function mapIdentityToSession(identity: AuthIdentityPublic, issuedAtSeconds: number, expiresAtSeconds: number): AuthSession {
  return {
    identityId: identity.id,
    name: identity.name,
    email: identity.email,
    profileId: identity.profileId,
    operationIds: identity.operationIds,
    defaultVisibility: identity.defaultVisibility,
    signedAt: new Date(issuedAtSeconds * 1000).toISOString(),
    expiresAt: new Date(expiresAtSeconds * 1000).toISOString(),
  };
}

export async function readAuthSessionFromRequest(request: Request): Promise<AuthSession | null> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  const payload = await decodeSessionCookie(cookies[AUTH_COOKIE_NAME]);
  if (!payload) return null;

  const identity = getIdentityById(payload.identityId);
  if (!identity) return null;

  return mapIdentityToSession(identity, payload.iat, payload.exp);
}

export async function signInIdentity(params: {
  identityId: string;
  passcode: string;
  request: Request;
}) {
  const identity = getIdentityById(params.identityId);
  if (!identity) {
    return { ok: false as const, error: "Perfil não encontrado." };
  }

  if (identity.passcode !== params.passcode.trim()) {
    return { ok: false as const, error: "Chave de acesso inválida." };
  }

  const cookieValue = await encodeSessionCookie(identity.id);
  const currentSession = await readAuthSessionFromRequest(
    new Request(params.request.url, {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${cookieValue}`,
      },
    }),
  );

  return {
    ok: true as const,
    session: currentSession,
    cookie: serialize(AUTH_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: new URL(params.request.url).protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    }),
  };
}

export function buildSignOutCookie(request: Request) {
  return serialize(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
