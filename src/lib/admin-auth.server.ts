import { parse, serialize } from "cookie-es";

import { readEnvString } from "./runtime-env";

import {
  ACCESS_DIRECTORY,
  AUTH_IDENTITIES_PUBLIC,
  type AuthIdentityPublic,
  type AccessInviteDraft,
  type AccessInvitePreview,
  type AuthSession,
  canManageAccessProfile,
  defaultAccessPackageForProfile,
  defaultOperationScopeForProfile,
  defaultVisibilityForProfile,
  resolveAllowedRoutes,
} from "./admin-auth.shared";
import {
  isAccessRegistryConfigured,
  markAccessInviteAccepted,
  persistAccessInviteRecord,
  readInviteRegistryState,
} from "./admin-access-registry.server";
import {
  findAccessUserByEmail,
  touchAccessUserLogin,
  upsertAccessUserFromInvite,
  verifyAccessPassword,
} from "./admin-access-users.server";

type AuthIdentityRecord = AuthIdentityPublic & {
  passcode?: string;
};

type EmbeddedSessionIdentity = AuthIdentityPublic;

type SessionCookiePayload =
  | {
      v: 1;
      identityId: string;
      iat: number;
      exp: number;
    }
  | {
      v: 2;
      session: EmbeddedSessionIdentity;
      iat: number;
      exp: number;
    };

type InviteTokenPayload = {
  v: 1;
  type: "invite";
  invitedByIdentityId: string;
  invitedByName: string;
  identity: EmbeddedSessionIdentity;
  iat: number;
  exp: number;
};

const AUTH_COOKIE_NAME = "admin_incentiva_session";
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

const authIdentitySeedRecords: AuthIdentityRecord[] = [
  {
    ...(AUTH_IDENTITIES_PUBLIC.find((identity) => identity.id === "claudio-direcao") as AuthIdentityPublic),
    passcode: "5501",
  },
  {
    ...(AUTH_IDENTITIES_PUBLIC.find((identity) => identity.id === "claw-main") as AuthIdentityPublic),
    passcode: "5400",
  },
];

function readPasscodeOverrides() {
  const envValue = readEnvString("ADMIN_INCENTIVA_PASSCODES_JSON");

  if (!envValue) return {} as Record<string, string>;

  try {
    const parsed = JSON.parse(envValue) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

const passcodeOverrides = readPasscodeOverrides();

const authIdentityRecords: AuthIdentityRecord[] = ACCESS_DIRECTORY.map((entry) => {
  const seed = authIdentitySeedRecords.find((record) => record.id === entry.id);

  return {
    id: entry.id,
    name: entry.name,
    email: entry.email,
    profileId: entry.profileId,
    accessPackageId: entry.accessPackageId,
    allowedRoutes: entry.allowedRoutes,
    operationIds: entry.operationIds,
    defaultVisibility: entry.defaultVisibility,
    passcode: passcodeOverrides[entry.id] ?? seed?.passcode,
  };
});

let secretKeyPromise: Promise<CryptoKey> | null = null;

function getAuthSecret() {
  const envSecret = readEnvString("ADMIN_INCENTIVA_AUTH_SECRET");

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

async function encodeEmbeddedSessionCookie(identity: EmbeddedSessionIdentity) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: SessionCookiePayload = {
    v: 2,
    session: identity,
    iat: issuedAt,
    exp: issuedAt + AUTH_COOKIE_MAX_AGE_SECONDS,
  };

  const payloadEncoded = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signValue(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

async function encodeInviteToken(payload: InviteTokenPayload) {
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

    if ((payload.v !== 1 && payload.v !== 2) || payload.exp * 1000 <= Date.now()) {
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

function mapIdentityToSession(
  identity: AuthIdentityPublic,
  issuedAtSeconds: number,
  expiresAtSeconds: number,
): AuthSession {
  return {
    identityId: identity.id,
    name: identity.name,
    email: identity.email,
    profileId: identity.profileId,
    accessPackageId: identity.accessPackageId,
    allowedRoutes: identity.allowedRoutes,
    operationIds: identity.operationIds,
    defaultVisibility: identity.defaultVisibility,
    signedAt: new Date(issuedAtSeconds * 1000).toISOString(),
    expiresAt: new Date(expiresAtSeconds * 1000).toISOString(),
  };
}

function getLandingPathForProfile(profileId: AuthIdentityPublic["profileId"]) {
  return profileId === "cliente" ? "/portal" : "/";
}

function getRequestOrigin(request: Request) {
  return new URL(request.url).origin;
}

function sanitizeInviteDraft(draft: AccessInviteDraft): AuthIdentityPublic {
  const trimmedName = draft.name.trim();
  const trimmedEmail = draft.email.trim().toLowerCase();
  const profileId = draft.profileId;
  const accessPackageId = draft.accessPackageId || defaultAccessPackageForProfile(profileId);
  const packageAllowedRoutes = resolveAllowedRoutes(accessPackageId);

  let operationIds = draft.operationIds;
  if (profileId === "direcao" || profileId === "claw") {
    operationIds = "all";
  } else if (operationIds === "all") {
    operationIds = defaultOperationScopeForProfile(profileId);
  } else {
    operationIds = Array.from(new Set(operationIds.map((value) => value.trim()).filter(Boolean)));
  }

  if ((profileId === "sdr" || profileId === "cliente") && operationIds !== "all" && operationIds.length === 0) {
    throw new Error("Selecione pelo menos uma operação para esse perfil.");
  }

  const defaultVisibility =
    profileId === "cliente"
      ? "client"
      : draft.defaultVisibility ?? defaultVisibilityForProfile(profileId);

  let allowedRoutes =
    Array.isArray(draft.allowedRoutes) && draft.allowedRoutes.length > 0
      ? Array.from(new Set(draft.allowedRoutes.filter((route) => packageAllowedRoutes.includes(route))))
      : packageAllowedRoutes;

  if (profileId === "direcao" || profileId === "claw") {
    allowedRoutes = packageAllowedRoutes;
  }

  if (allowedRoutes.length === 0) {
    throw new Error("Selecione pelo menos um módulo para esse convite.");
  }

  const baseIdentityId = `${trimmedName || trimmedEmail || profileId}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return {
    id: `invite-${baseIdentityId || profileId}`,
    name: trimmedName,
    email: trimmedEmail,
    profileId,
    accessPackageId,
    allowedRoutes,
    operationIds,
    defaultVisibility,
  };
}

function buildInvitePreview(
  request: Request,
  payload: InviteTokenPayload,
  token: string,
): AccessInvitePreview {
  const landingPath = getLandingPathForProfile(payload.identity.profileId);
  const inviteUrl = `${getRequestOrigin(request)}${landingPath}?invite=${encodeURIComponent(token)}`;

  return {
    token,
    inviteUrl,
    invitedByIdentityId: payload.invitedByIdentityId,
    invitedByName: payload.invitedByName,
    identityId: payload.identity.id,
    allowedRoutes: payload.identity.allowedRoutes,
    name: payload.identity.name,
    email: payload.identity.email,
    profileId: payload.identity.profileId,
    operationIds: payload.identity.operationIds,
    defaultVisibility: payload.identity.defaultVisibility,
    expiresInHours: Math.max(1, Math.round((payload.exp - payload.iat) / 3600)),
    issuedAt: new Date(payload.iat * 1000).toISOString(),
    expiresAt: new Date(payload.exp * 1000).toISOString(),
    landingPath,
  };
}

async function decodeInviteToken(token: string | null | undefined) {
  if (!token) return null;

  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return null;

  const expectedSignature = await signValue(payloadEncoded);
  if (expectedSignature !== signature) return null;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payloadEncoded)),
    ) as InviteTokenPayload;

    if (
      payload.v !== 1 ||
      payload.type !== "invite" ||
      payload.exp * 1000 <= Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function readAuthSessionFromRequest(request: Request): Promise<AuthSession | null> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  const payload = await decodeSessionCookie(cookies[AUTH_COOKIE_NAME]);
  if (!payload) return null;

  if (payload.v === 2) {
    return mapIdentityToSession(payload.session, payload.iat, payload.exp);
  }

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

  if (!identity.passcode) {
    return { ok: false as const, error: "Perfil ainda não habilitado para login." };
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

export async function signInWithEmail(params: {
  email: string;
  password: string;
  request: Request;
}) {
  const lookup = await findAccessUserByEmail(params.email);
  if (!lookup.ok) {
    return { ok: false as const, error: lookup.error };
  }

  if (!lookup.user || lookup.user.disabledAt) {
    return { ok: false as const, error: "Usuário não encontrado ou sem acesso ativo." };
  }

  const passwordOk = await verifyAccessPassword(params.password.trim(), lookup.user.passwordHash);
  if (!passwordOk) {
    return { ok: false as const, error: "E-mail ou senha inválidos." };
  }

  await touchAccessUserLogin(lookup.user.email);

  const cookieValue = await encodeEmbeddedSessionCookie(lookup.user.identity);
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

export async function createAccessInvite(params: {
  invitedBy: AuthSession;
  draft: AccessInviteDraft;
  request: Request;
}) {
  if (!canManageAccessProfile(params.invitedBy.profileId)) {
    return { ok: false as const, error: "A sessão atual não pode emitir convites." };
  }

  const expiresInHours = Math.min(24 * 30, Math.max(1, Math.floor(params.draft.expiresInHours || 72)));

  let identity: AuthIdentityPublic;
  try {
    identity = sanitizeInviteDraft({
      ...params.draft,
      expiresInHours,
    });
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Falha ao validar o convite.",
    };
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: InviteTokenPayload = {
    v: 1,
    type: "invite",
    invitedByIdentityId: params.invitedBy.identityId,
    invitedByName: params.invitedBy.name,
    identity,
    iat: issuedAt,
    exp: issuedAt + expiresInHours * 3600,
  };

  const token = await encodeInviteToken(payload);
  const invite = buildInvitePreview(params.request, payload, token);
  const registry = await persistAccessInviteRecord({
    invite,
    invitedBy: params.invitedBy,
  });

  return {
    ok: true as const,
    invite,
    registry,
  };
}

export async function verifyAccessInviteToken(params: {
  token: string;
  request: Request;
}) {
  const payload = await decodeInviteToken(params.token);
  if (!payload) {
    return { ok: false as const, error: "Convite inválido, expirado ou já inutilizável." };
  }

  if (isAccessRegistryConfigured()) {
    const registryState = await readInviteRegistryState(params.token);
    if (!registryState.ok) {
      return { ok: false as const, error: registryState.error };
    }

    if (!registryState.entry) {
      return { ok: false as const, error: "Convite não encontrado no registry persistido." };
    }

    if (registryState.entry.inviteStatus === "revoked") {
      return { ok: false as const, error: "Convite revogado pela administração." };
    }

    if (registryState.entry.inviteStatus === "accepted") {
      return { ok: false as const, error: "Convite já utilizado." };
    }

    if (new Date(registryState.entry.inviteExpiresAt).getTime() <= Date.now()) {
      return { ok: false as const, error: "Convite expirado." };
    }
  }

  return {
    ok: true as const,
    invite: buildInvitePreview(params.request, payload, params.token),
  };
}

export async function completeInviteSetup(params: {
  token: string;
  password: string;
  request: Request;
}) {
  const verification = await verifyAccessInviteToken(params);
  if (!verification.ok) {
    return verification;
  }

  const payload = await decodeInviteToken(params.token);
  if (!payload) {
    return { ok: false as const, error: "Convite inválido, expirado ou já inutilizável." };
  }

  const createdUser = await upsertAccessUserFromInvite({
    invite: verification.invite,
    password: params.password,
  });

  if (!createdUser.ok) {
    return { ok: false as const, error: createdUser.error };
  }

  if (isAccessRegistryConfigured()) {
    const acceptance = await markAccessInviteAccepted(params.token);
    if (!acceptance.ok) {
      return { ok: false as const, error: acceptance.error ?? "Falha ao registrar o aceite do convite." };
    }
  }

  const cookieValue = await encodeEmbeddedSessionCookie(createdUser.user.identity);
  const session = mapIdentityToSession(
    createdUser.user.identity,
    Math.floor(Date.now() / 1000),
    Math.floor(Date.now() / 1000) + AUTH_COOKIE_MAX_AGE_SECONDS,
  );

  return {
    ok: true as const,
    session,
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
