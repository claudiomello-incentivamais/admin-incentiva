import type {
  AccessInvitePreview,
  AccessRegistryEntrySummary,
  AccessRegistryInviteStatus,
  AccessRegistrySnapshot,
  AuthSession,
} from "./admin-auth.shared";

const ACCESS_REGISTRY_TABLE = "admin_access_registry_v1";

type RegistryClientConfig = {
  url: string;
  serviceRoleKey: string;
};

type PersistInviteRecordParams = {
  invite: AccessInvitePreview;
  invitedBy: AuthSession;
};

type RegistryLookupResult =
  | { ok: true; entry: AccessRegistryEntrySummary | null }
  | { ok: false; error: string };

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

function getRegistryBackendLabel() {
  return getRegistryClientConfig() ? "Supabase server-side" : "Desligado";
}

function buildHeaders(config: RegistryClientConfig, extra?: HeadersInit) {
  return {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function buildRegistryUrl(config: RegistryClientConfig, query = "") {
  return `${config.url}/rest/v1/${ACCESS_REGISTRY_TABLE}${query}`;
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

function normalizeStatus(value: unknown): AccessRegistryInviteStatus {
  if (value === "accepted" || value === "revoked" || value === "expired") return value;
  return "issued";
}

function mapRowToEntry(row: Record<string, unknown>): AccessRegistryEntrySummary {
  return {
    id: String(row.id || ""),
    identityId: String(row.access_identity_id || ""),
    name: String(row.name || ""),
    email: String(row.email || ""),
    profileId: String(row.profile_id || "cliente") as AccessRegistryEntrySummary["profileId"],
    accessPackageId: String(row.access_package_id || "portal_private") as AccessRegistryEntrySummary["accessPackageId"],
    allowedRoutes: normalizeAllowedRoutes(row.allowed_routes),
    operationIds: normalizeOperationIds(row.operation_ids),
    defaultVisibility: String(row.default_visibility || "client") as AccessRegistryEntrySummary["defaultVisibility"],
    invitedByIdentityId: String(row.invited_by_identity_id || ""),
    invitedByName: String(row.invited_by_name || ""),
    inviteIssuedAt: String(row.invite_issued_at || row.created_at || new Date().toISOString()),
    inviteExpiresAt: String(row.invite_expires_at || new Date().toISOString()),
    inviteStatus: normalizeStatus(row.invite_status),
    acceptedAt: row.accepted_at ? String(row.accepted_at) : null,
    revokedAt: row.revoked_at ? String(row.revoked_at) : null,
    revokedByIdentityId: row.revoked_by_identity_id ? String(row.revoked_by_identity_id) : null,
    revokedReason: row.revoked_reason ? String(row.revoked_reason) : null,
  };
}

async function hashInviteToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function fetchRegistryEntryByTokenHash(tokenHash: string): Promise<RegistryLookupResult> {
  const config = getRegistryClientConfig();
  if (!config) {
    return { ok: true, entry: null };
  }

  const query = `?select=*&invite_token_hash=eq.${encodeURIComponent(tokenHash)}&limit=1`;

  try {
    const response = await fetch(buildRegistryUrl(config, query), {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      return { ok: false, error: `Registry lookup falhou (${response.status}).` };
    }

    const rows = (await response.json()) as Record<string, unknown>[];
    return { ok: true, entry: rows[0] ? mapRowToEntry(rows[0]) : null };
  } catch {
    return { ok: false, error: "Registry lookup indisponível." };
  }
}

export function isAccessRegistryConfigured() {
  return !!getRegistryClientConfig();
}

export async function listAccessRegistryEntries(limit = 24): Promise<AccessRegistrySnapshot> {
  const config = getRegistryClientConfig();
  if (!config) {
    return {
      configured: false,
      backendLabel: getRegistryBackendLabel(),
      entries: [],
      error: "Camada persistida ainda não configurada no servidor.",
    };
  }

  const query = `?select=*&order=invite_issued_at.desc&limit=${Math.max(1, Math.min(limit, 100))}`;

  try {
    const response = await fetch(buildRegistryUrl(config, query), {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      return {
        configured: true,
        backendLabel: getRegistryBackendLabel(),
        entries: [],
        error: `Leitura do registry falhou (${response.status}).`,
      };
    }

    const rows = (await response.json()) as Record<string, unknown>[];

    return {
      configured: true,
      backendLabel: getRegistryBackendLabel(),
      entries: rows.map(mapRowToEntry),
      error: null,
    };
  } catch {
    return {
      configured: true,
      backendLabel: getRegistryBackendLabel(),
      entries: [],
      error: "Leitura do registry indisponível no momento.",
    };
  }
}

export async function persistAccessInviteRecord(params: PersistInviteRecordParams) {
  const config = getRegistryClientConfig();
  if (!config) {
    return {
      persisted: false,
      backendLabel: getRegistryBackendLabel(),
      error: "Camada persistida ainda não configurada no servidor.",
    };
  }

  const inviteTokenHash = await hashInviteToken(params.invite.token);
  const payload = {
    access_identity_id: params.invite.identityId,
    name: params.invite.name,
    email: params.invite.email,
    profile_id: params.invite.profileId,
    access_package_id: params.invite.accessPackageId,
    allowed_routes: params.invite.allowedRoutes,
    operation_ids: params.invite.operationIds,
    default_visibility: params.invite.defaultVisibility,
    invite_token_hash: inviteTokenHash,
    invited_by_identity_id: params.invitedBy.identityId,
    invited_by_name: params.invitedBy.name,
    invite_issued_at: params.invite.issuedAt,
    invite_expires_at: params.invite.expiresAt,
    invite_status: "issued",
  };

  try {
    const response = await fetch(
      buildRegistryUrl(config, "?on_conflict=invite_token_hash"),
      {
        method: "POST",
        headers: buildHeaders(config, {
          Prefer: "resolution=merge-duplicates,return=minimal",
        }),
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      return {
        persisted: false,
        backendLabel: getRegistryBackendLabel(),
        error: `Persistência do convite falhou (${response.status}).`,
      };
    }

    return { persisted: true, backendLabel: getRegistryBackendLabel(), error: null };
  } catch {
    return {
      persisted: false,
      backendLabel: getRegistryBackendLabel(),
      error: "Persistência do convite indisponível no momento.",
    };
  }
}

export async function readInviteRegistryState(token: string): Promise<
  | { ok: true; entry: AccessRegistryEntrySummary | null }
  | { ok: false; error: string }
> {
  const tokenHash = await hashInviteToken(token);
  return fetchRegistryEntryByTokenHash(tokenHash);
}

export async function markAccessInviteAccepted(token: string) {
  const config = getRegistryClientConfig();
  if (!config) {
    return { ok: true as const, error: null };
  }

  const tokenHash = await hashInviteToken(token);

  try {
    const response = await fetch(
      buildRegistryUrl(
        config,
        `?invite_token_hash=eq.${encodeURIComponent(tokenHash)}`,
      ),
      {
        method: "PATCH",
        headers: buildHeaders(config, {
          Prefer: "return=minimal",
        }),
        body: JSON.stringify({
          invite_status: "accepted",
          accepted_at: new Date().toISOString(),
        }),
      },
    );

    if (!response.ok) {
      return { ok: false as const, error: `Aceite do convite falhou (${response.status}).` };
    }

    return { ok: true as const, error: null };
  } catch {
    return { ok: false as const, error: "Aceite do convite indisponível no momento." };
  }
}

export async function revokeAccessInvite(params: {
  registryId: string;
  revokedBy: AuthSession;
  reason?: string;
}) {
  const config = getRegistryClientConfig();
  if (!config) {
    return { ok: false as const, error: "Camada persistida ainda não configurada no servidor." };
  }

  try {
    const response = await fetch(
      buildRegistryUrl(config, `?id=eq.${encodeURIComponent(params.registryId)}`),
      {
        method: "PATCH",
        headers: buildHeaders(config, {
          Prefer: "return=minimal",
        }),
        body: JSON.stringify({
          invite_status: "revoked",
          revoked_at: new Date().toISOString(),
          revoked_by_identity_id: params.revokedBy.identityId,
          revoked_reason: params.reason?.trim() || "Revogado no admin",
        }),
      },
    );

    if (!response.ok) {
      return { ok: false as const, error: `Revogação falhou (${response.status}).` };
    }

    return { ok: true as const, error: null };
  } catch {
    return { ok: false as const, error: "Revogação indisponível no momento." };
  }
}
