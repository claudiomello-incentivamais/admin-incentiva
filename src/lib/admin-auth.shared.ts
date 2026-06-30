export type AccessProfileId = "direcao" | "claw" | "sales" | "cliente";
export type VisibilityMode = "internal" | "client";
export type AccessDirectoryStatus = "active" | "pilot" | "planned";

export interface AuthIdentityPublic {
  id: string;
  name: string;
  email: string;
  profileId: AccessProfileId;
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
  operationIds: string[] | "all";
  defaultVisibility: VisibilityMode;
  signedAt: string;
  expiresAt: string;
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
  sales: "Sales Ops / SDR",
  cliente: "Cliente",
};

export const ACCESS_DIRECTORY: AccessDirectoryEntry[] = [
  {
    id: "claudio-direcao",
    name: "Claudio",
    email: "claudio@incentivamais.com",
    profileId: "direcao",
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
    profileId: "sales",
    operationIds: ["incentiva", "prime-action", "nimbus", "acelerato"],
    defaultVisibility: "internal",
    status: "active",
    audienceLabel: "Operação interna",
    scopeLabel: "Carteira homologada do time comercial",
    notes: "Hoje entra com visão interna e troca para client-safe quando necessário.",
    signInEnabled: true,
  },
  {
    id: "cliente-incentiva",
    name: "Cliente Incentiva",
    email: "cliente.incentiva@incentivamais.com",
    profileId: "cliente",
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
    profileId: "sales",
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
