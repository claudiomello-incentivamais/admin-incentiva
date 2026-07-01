export type AccessProfileId = "direcao" | "claw" | "sales_ops" | "sdr" | "cliente";
export type VisibilityMode = "internal" | "client";
export type AccessDirectoryStatus = "active" | "pilot" | "planned";
export type AccessRegistryInviteStatus = "issued" | "accepted" | "revoked" | "expired";
export type AccessScopeMode = "all" | "multi" | "single";
export type AccessPackageId =
  | "admin_full"
  | "executivo_publish"
  | "operacional_safe"
  | "portal_private";

export interface AccessOperationOption {
  id: string;
  label: string;
}

export interface AuthIdentityPublic {
  id: string;
  name: string;
  email: string;
  profileId: AccessProfileId;
  accessPackageId: AccessPackageId;
  allowedRoutes: string[];
  operationIds: string[] | "all";
  defaultVisibility: VisibilityMode;
}

export interface AccessDirectoryEntry extends AuthIdentityPublic {
  status: AccessDirectoryStatus;
  audienceLabel: string;
  scopeLabel: string;
  notes: string;
  signInEnabled: boolean;
}

export interface AuthSession {
  identityId: string;
  name: string;
  email: string;
  profileId: AccessProfileId;
  accessPackageId: AccessPackageId;
  allowedRoutes: string[];
  operationIds: string[] | "all";
  defaultVisibility: VisibilityMode;
  signedAt: string;
  expiresAt: string;
}

export interface AccessInviteDraft {
  name: string;
  email: string;
  profileId: AccessProfileId;
  accessPackageId: AccessPackageId;
  allowedRoutes?: string[];
  operationIds: string[] | "all";
  defaultVisibility: VisibilityMode;
  expiresInHours: number;
}

export interface AccessInvitePreview extends AccessInviteDraft {
  token: string;
  inviteUrl: string;
  invitedByIdentityId: string;
  invitedByName: string;
  identityId: string;
  allowedRoutes: string[];
  issuedAt: string;
  expiresAt: string;
  landingPath: string;
}

export interface AccessRegistryEntrySummary {
  id: string;
  identityId: string;
  name: string;
  email: string;
  profileId: AccessProfileId;
  accessPackageId: AccessPackageId;
  allowedRoutes: string[];
  operationIds: string[] | "all";
  defaultVisibility: VisibilityMode;
  invitedByIdentityId: string;
  invitedByName: string;
  inviteIssuedAt: string;
  inviteExpiresAt: string;
  inviteStatus: AccessRegistryInviteStatus;
  acceptedAt: string | null;
  revokedAt: string | null;
  revokedByIdentityId: string | null;
  revokedReason: string | null;
}

export interface AccessRegistrySnapshot {
  configured: boolean;
  backendLabel: string;
  entries: AccessRegistryEntrySummary[];
  error?: string | null;
}

const operationLabelMap: Record<string, string> = {
  "cafe-fazenda-brasil": "Café Fazenda Brasil",
  acelerato: "Acelerato",
  incentiva: "Incentiva",
  nimbus: "Nimbus",
  "prime-action": "Prime Action",
  "plan-idiomas": "Plan Idiomas",
  "trial-ambiental": "Trial Ambiental",
  docseg: "DocSeg",
  valloo: "Valloo",
  iamit: "Iamit",
  we9: "We9 / Shopping Jaraguá Araraquara",
  inmeta: "InMeta",
  r2b: "R2B",
  "lima-duarte-alimentos": "Lima Duarte Alimentos",
};

export const ACCESS_PROFILE_LABELS: Record<AccessProfileId, string> = {
  direcao: "Direção",
  claw: "Claw/main",
  sales_ops: "Sales Ops",
  sdr: "SDR",
  cliente: "Cliente",
};

export const ACCESS_PACKAGE_LABELS: Record<AccessPackageId, string> = {
  admin_full: "Console completo",
  executivo_publish: "Visão executiva",
  operacional_safe: "Visão operacional",
  portal_private: "Área do cliente",
};

export const ADMIN_ROUTE_LABELS: Record<string, string> = {
  "/": "Admin Global",
  "/operacoes": "Operações",
  "/performance": "Performance",
  "/governanca": "Governança",
  "/pipelines": "Pipelines",
  "/clientes": "Clientes",
  "/portal": "Portal",
  "/faturamento": "Faturamento",
  "/integracoes": "Integrações",
  "/configuracoes": "Configurações",
  "/suporte": "Suporte",
};

export const ACCESS_SCOPE_LABELS: Record<AccessScopeMode, string> = {
  all: "Admin completo",
  multi: "Carteira parcial",
  single: "Acesso exclusivo",
};

export const ACCESS_SCOPE_DESCRIPTIONS: Record<AccessScopeMode, string> = {
  all: "Vê a carteira inteira e pode alternar livremente entre operações.",
  multi: "Vê somente o conjunto de operações explicitamente liberado no convite.",
  single: "Vê apenas uma operação específica, sem mistura com outras contas.",
};

export const ACCESS_REGISTRY_STATUS_LABELS: Record<AccessRegistryInviteStatus, string> = {
  issued: "Emitido",
  accepted: "Aceito",
  revoked: "Revogado",
  expired: "Expirado",
};

export const ACCESS_ROUTE_PACKAGES: Record<
  AccessPackageId,
  { label: string; description: string; allowedRoutes: string[] }
> = {
  admin_full: {
    label: ACCESS_PACKAGE_LABELS.admin_full,
    description: "Acesso total ao console administrativo.",
    allowedRoutes: [
      "/",
      "/operacoes",
      "/performance",
      "/governanca",
      "/pipelines",
      "/clientes",
      "/portal",
      "/faturamento",
      "/integracoes",
      "/configuracoes",
      "/suporte",
    ],
  },
  executivo_publish: {
    label: ACCESS_PACKAGE_LABELS.executivo_publish,
    description: "Visão executiva com foco em leitura gerencial.",
    allowedRoutes: ["/", "/performance", "/clientes", "/portal", "/faturamento", "/integracoes"],
  },
  operacional_safe: {
    label: ACCESS_PACKAGE_LABELS.operacional_safe,
    description: "Visão operacional para rotina comercial sem abrir a camada administrativa.",
    allowedRoutes: ["/", "/performance", "/clientes", "/portal"],
  },
  portal_private: {
    label: ACCESS_PACKAGE_LABELS.portal_private,
    description: "Recorte do cliente com leitura limitada à própria conta.",
    allowedRoutes: ["/portal"],
  },
};

export const ACCESS_OPERATION_OPTIONS: AccessOperationOption[] = Object.entries(operationLabelMap)
  .map(([id, label]) => ({ id, label }))
  .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));

export const ACCESS_DIRECTORY: AccessDirectoryEntry[] = [
  {
    id: "claudio-direcao",
    name: "Claudio",
    email: "claudio@incentivamais.com",
    profileId: "direcao",
    accessPackageId: "admin_full",
    allowedRoutes: ACCESS_ROUTE_PACKAGES.admin_full.allowedRoutes,
    operationIds: "all",
    defaultVisibility: "internal",
    status: "active",
    audienceLabel: "Executivo interno",
    scopeLabel: "Carteira inteira, governança e abertura por conta",
    notes: "Visão total do console e da camada administrativa.",
    signInEnabled: true,
  },
  {
    id: "claw-main",
    name: "Claw/main",
    email: "main@incentivamais.com",
    profileId: "claw",
    accessPackageId: "admin_full",
    allowedRoutes: ACCESS_ROUTE_PACKAGES.admin_full.allowedRoutes,
    operationIds: "all",
    defaultVisibility: "internal",
    status: "active",
    audienceLabel: "Operador estrutural",
    scopeLabel: "Leitura e edição estrutural cross-operação",
    notes: "Mantém governança, integrações, shell e rollout do produto.",
    signInEnabled: true,
  },
  {
    id: "salesops-carteira",
    name: "Sales Ops",
    email: "salesops@incentivamais.com",
    profileId: "sales_ops",
    accessPackageId: "operacional_safe",
    allowedRoutes: ACCESS_ROUTE_PACKAGES.operacional_safe.allowedRoutes,
    operationIds: "all",
    defaultVisibility: "internal",
    status: "active",
    audienceLabel: "Operação interna",
    scopeLabel: "Carteira inteira da operação comercial",
    notes: "Hoje entra com visão operacional em toda a carteira.",
    signInEnabled: false,
  },
  {
    id: "cliente-incentiva",
    name: "Cliente Incentiva",
    email: "cliente.incentiva@incentivamais.com",
    profileId: "cliente",
    accessPackageId: "portal_private",
    allowedRoutes: ACCESS_ROUTE_PACKAGES.portal_private.allowedRoutes,
    operationIds: ["incentiva"],
    defaultVisibility: "client",
    status: "active",
    audienceLabel: "Leitura externa",
    scopeLabel: "Portal privado da operação Incentiva",
    notes: "Vê somente o recorte client-safe da própria conta.",
    signInEnabled: true,
  },
  {
    id: "lucas-direcao",
    name: "Lucas Visnadi",
    email: "lucas@incentivamais.com",
    profileId: "direcao",
    accessPackageId: "admin_full",
    allowedRoutes: ACCESS_ROUTE_PACKAGES.admin_full.allowedRoutes,
    operationIds: "all",
    defaultVisibility: "internal",
    status: "pilot",
    audienceLabel: "Executivo interno",
    scopeLabel: "Carteira inteira com foco executivo e rollout",
    notes: "Pronto para ativação quando quisermos sair da chave compartilhada de direção.",
    signInEnabled: false,
  },
  {
    id: "sdr-incentiva",
    name: "SDR Incentiva",
    email: "sdr.incentiva@incentivamais.com",
    profileId: "sdr",
    accessPackageId: "operacional_safe",
    allowedRoutes: ACCESS_ROUTE_PACKAGES.operacional_safe.allowedRoutes,
    operationIds: ["incentiva"],
    defaultVisibility: "internal",
    status: "pilot",
    audienceLabel: "Operação interna",
    scopeLabel: "Acesso restrito à operação Incentiva",
    notes: "Modelo para liberar leitura operacional e execução sem abrir a carteira inteira.",
    signInEnabled: false,
  },
  {
    id: "cliente-prime-action",
    name: "Cliente Prime Action",
    email: "cliente.primeaction@incentivamais.com",
    profileId: "cliente",
    accessPackageId: "portal_private",
    allowedRoutes: ACCESS_ROUTE_PACKAGES.portal_private.allowedRoutes,
    operationIds: ["prime-action"],
    defaultVisibility: "client",
    status: "planned",
    audienceLabel: "Leitura externa",
    scopeLabel: "Portal privado da operação Prime Action",
    notes: "Modelo de replicação do portal por conta para as próximas operações.",
    signInEnabled: false,
  },
];

export const AUTH_IDENTITIES_PUBLIC: AuthIdentityPublic[] = ACCESS_DIRECTORY.filter(
  (entry) => entry.signInEnabled,
).map(({ status: _status, audienceLabel: _audienceLabel, scopeLabel: _scopeLabel, notes: _notes, signInEnabled: _signInEnabled, ...entry }) => entry);

export function formatOperationScope(operationIds: string[] | "all") {
  if (operationIds === "all") return "Carteira inteira";
  return operationIds.map((operationId) => operationLabelMap[operationId] ?? operationId).join(", ");
}

export function formatAccessStatusLabel(status: AccessDirectoryStatus) {
  if (status === "active") return "Ativo";
  if (status === "pilot") return "Piloto";
  return "Planejado";
}

export function defaultVisibilityForProfile(profileId: AccessProfileId): VisibilityMode {
  return profileId === "cliente" ? "client" : "internal";
}

export function defaultOperationScopeForProfile(profileId: AccessProfileId): string[] | "all" {
  return profileId === "direcao" || profileId === "claw" || profileId === "sales_ops" ? "all" : [];
}

export function defaultAccessPackageForProfile(profileId: AccessProfileId): AccessPackageId {
  if (profileId === "cliente") return "portal_private";
  if (profileId === "sales_ops" || profileId === "sdr") return "operacional_safe";
  return "admin_full";
}

export function resolveAllowedRoutes(accessPackageId: AccessPackageId) {
  return ACCESS_ROUTE_PACKAGES[accessPackageId].allowedRoutes;
}

export function formatAllowedRouteLabels(allowedRoutes: string[]) {
  return allowedRoutes.map((route) => ADMIN_ROUTE_LABELS[route] ?? route);
}

export function canManageAccessProfile(profileId: AccessProfileId) {
  return profileId === "direcao" || profileId === "claw";
}

export function resolveEffectiveInviteStatus(entry: Pick<AccessRegistryEntrySummary, "inviteStatus" | "inviteExpiresAt">) {
  if (entry.inviteStatus !== "issued") return entry.inviteStatus;
  return new Date(entry.inviteExpiresAt).getTime() <= Date.now() ? "expired" : "issued";
}

export function resolveAccessScopeMode(operationIds: string[] | "all"): AccessScopeMode {
  if (operationIds === "all") return "all";
  return operationIds.length <= 1 ? "single" : "multi";
}
