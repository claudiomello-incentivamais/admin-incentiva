export type AccessProfileId = "direcao" | "claw" | "sales" | "cliente";
export type VisibilityMode = "internal" | "client";

export interface AuthIdentityPublic {
  id: string;
  name: string;
  email: string;
  profileId: AccessProfileId;
  operationIds: string[] | "all";
  defaultVisibility: VisibilityMode;
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

export const AUTH_IDENTITIES_PUBLIC: AuthIdentityPublic[] = [
  {
    id: "claudio-direcao",
    name: "Claudio",
    email: "claudio@incentivamais.com",
    profileId: "direcao",
    operationIds: "all",
    defaultVisibility: "internal",
  },
  {
    id: "claw-main",
    name: "Claw/main",
    email: "main@incentivamais.com",
    profileId: "claw",
    operationIds: "all",
    defaultVisibility: "internal",
  },
  {
    id: "salesops-carteira",
    name: "Sales Ops",
    email: "salesops@incentivamais.com",
    profileId: "sales",
    operationIds: ["incentiva", "prime-action", "nimbus", "acelerato"],
    defaultVisibility: "internal",
  },
  {
    id: "cliente-incentiva",
    name: "Cliente Incentiva",
    email: "cliente.incentiva@incentivamais.com",
    profileId: "cliente",
    operationIds: ["incentiva"],
    defaultVisibility: "client",
  },
];
