import type {
  AccessInvitePreview,
  AuthIdentityPublic,
} from "./admin-auth.shared";

const ACCESS_USERS_TABLE = "admin_access_users_v1";

type AccessUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  identity: AuthIdentityPublic;
  activatedAt: string | null;
  lastLoginAt: string | null;
  disabledAt: string | null;
};

type RegistryClientConfig = {
  url: string;
  serviceRoleKey: string;
};

function getSupabaseUrl() {
  return (
    process.env.ADMIN_INCENTIVA_SUPABASE_URL?.trim() ||
    process.env.VITE_SUPABASE_URL?.trim() ||
    (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
    ""
  );
}

function getSupabaseServiceRoleKey() {
  return (
    process.env.ADMIN_INCENTIVA_SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE?.trim() ||
    ""
  );
}

function getRegistryClientConfig(): RegistryClientConfig | null {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

function buildHeaders(config: RegistryClientConfig, extra?: HeadersInit) {
  return {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function buildUsersUrl(config: RegistryClientConfig, query = "") {
  return `${config.url}/rest/v1/${ACCESS_USERS_TABLE}${query}`;
}

function normalizeOperationIds(value: unknown): string[] | "all" {
  if (value === "all") return "all";
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  return [];
}

function normalizeAllowedRoutes(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function mapRowToUser(row: Record<string, unknown>): AccessUserRecord {
  return {
    id: String(row.id || ""),
    email: String(row.email || "").toLowerCase(),
    passwordHash: String(row.password_hash || ""),
    identity: {
      id: String(row.access_identity_id || ""),
      name: String(row.name || ""),
      email: String(row.email || "").toLowerCase(),
      profileId: String(row.profile_id || "cliente") as AuthIdentityPublic["profileId"],
      accessPackageId: String(row.access_package_id || "portal_private") as AuthIdentityPublic["accessPackageId"],
      allowedRoutes: normalizeAllowedRoutes(row.allowed_routes),
      operationIds: normalizeOperationIds(row.operation_ids),
      defaultVisibility: String(row.default_visibility || "client") as AuthIdentityPublic["defaultVisibility"],
    },
    activatedAt: row.activated_at ? String(row.activated_at) : null,
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
    disabledAt: row.disabled_at ? String(row.disabled_at) : null,
  };
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string) {
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((pair) => Number.parseInt(pair, 16)));
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations,
    },
    key,
    256,
  );

  return new Uint8Array(bits);
}

export async function hashAccessPassword(password: string) {
  const iterations = 210_000;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt, iterations);
  return `pbkdf2_sha256$${iterations}$${bytesToHex(salt)}$${bytesToHex(hash)}`;
}

export async function verifyAccessPassword(password: string, passwordHash: string) {
  const [algorithm, iterationsRaw, saltHex, hashHex] = passwordHash.split("$");
  if (algorithm !== "pbkdf2_sha256" || !iterationsRaw || !saltHex || !hashHex) return false;

  const iterations = Number.parseInt(iterationsRaw, 10);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const derived = await derivePasswordHash(password, hexToBytes(saltHex), iterations);
  return bytesToHex(derived) === hashHex;
}

export async function upsertAccessUserFromInvite(params: {
  invite: AccessInvitePreview;
  password: string;
}) {
  const config = getRegistryClientConfig();
  if (!config) {
    return { ok: false as const, error: "Camada de usuários ainda não configurada no servidor." };
  }

  const passwordHash = await hashAccessPassword(params.password);
  const payload = {
    access_identity_id: params.invite.identityId,
    name: params.invite.name,
    email: params.invite.email.toLowerCase(),
    profile_id: params.invite.profileId,
    access_package_id: params.invite.accessPackageId,
    allowed_routes: params.invite.allowedRoutes,
    operation_ids: params.invite.operationIds,
    default_visibility: params.invite.defaultVisibility,
    password_hash: passwordHash,
    activated_at: new Date().toISOString(),
    last_login_at: new Date().toISOString(),
    disabled_at: null,
  };

  try {
    const response = await fetch(buildUsersUrl(config, "?on_conflict=email"), {
      method: "POST",
      headers: buildHeaders(config, {
        Prefer: "resolution=merge-duplicates,return=representation",
      }),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ok: false as const, error: `Criação do usuário falhou (${response.status}).` };
    }

    const rows = (await response.json()) as Record<string, unknown>[];
    const row = rows[0];
    if (!row) {
      return { ok: false as const, error: "Usuário não retornado após criação." };
    }

    return { ok: true as const, user: mapRowToUser(row) };
  } catch {
    return { ok: false as const, error: "Criação do usuário indisponível no momento." };
  }
}

export async function findAccessUserByEmail(email: string) {
  const config = getRegistryClientConfig();
  if (!config) {
    return { ok: false as const, error: "Camada de usuários ainda não configurada no servidor." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const query = `?select=*&email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`;

  try {
    const response = await fetch(buildUsersUrl(config, query), {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      return { ok: false as const, error: `Leitura do usuário falhou (${response.status}).` };
    }

    const rows = (await response.json()) as Record<string, unknown>[];
    return { ok: true as const, user: rows[0] ? mapRowToUser(rows[0]) : null };
  } catch {
    return { ok: false as const, error: "Leitura do usuário indisponível no momento." };
  }
}

export async function touchAccessUserLogin(email: string) {
  const config = getRegistryClientConfig();
  if (!config) {
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    await fetch(buildUsersUrl(config, `?email=eq.${encodeURIComponent(normalizedEmail)}`), {
      method: "PATCH",
      headers: buildHeaders(config, {
        Prefer: "return=minimal",
      }),
      body: JSON.stringify({
        last_login_at: new Date().toISOString(),
      }),
    });
  } catch {
    // Non-blocking audit field update.
  }
}
