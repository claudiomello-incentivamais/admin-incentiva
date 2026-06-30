import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LockKeyhole, LogOut, ShieldCheck, UserRound } from "lucide-react";

import { BrandMark } from "@/components/admin/BrandMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AccessProfileId = "direcao" | "claw" | "sales" | "cliente";
export type VisibilityMode = "internal" | "client";

export interface SessionIdentity {
  id: string;
  name: string;
  email: string;
  profileId: AccessProfileId;
  operationIds: string[] | "all";
  defaultVisibility: VisibilityMode;
  passcode: string;
}

export interface AuthSession {
  identityId: string;
  name: string;
  email: string;
  profileId: AccessProfileId;
  operationIds: string[] | "all";
  defaultVisibility: VisibilityMode;
  signedAt: string;
}

type AdminAuthContextValue = {
  session: AuthSession | null;
  identities: SessionIdentity[];
  signIn: (identityId: string, passcode: string) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
  canAccessOperation: (operationId: string) => boolean;
  canAccessRoute: (pathname: string) => boolean;
};

const SESSION_STORAGE_KEY = "admin-incentiva-auth-session";

const identities: SessionIdentity[] = [
  {
    id: "claudio-direcao",
    name: "Claudio",
    email: "claudio@incentivamais.com",
    profileId: "direcao",
    operationIds: "all",
    defaultVisibility: "internal",
    passcode: "5501",
  },
  {
    id: "claw-main",
    name: "Claw/main",
    email: "main@incentivamais.com",
    profileId: "claw",
    operationIds: "all",
    defaultVisibility: "internal",
    passcode: "5400",
  },
  {
    id: "salesops-carteira",
    name: "Sales Ops",
    email: "salesops@incentivamais.com",
    profileId: "sales",
    operationIds: ["incentiva", "prime-action", "nimbus", "acelerato"],
    defaultVisibility: "internal",
    passcode: "5300",
  },
  {
    id: "cliente-incentiva",
    name: "Cliente Incentiva",
    email: "cliente.incentiva@incentivamais.com",
    profileId: "cliente",
    operationIds: ["incentiva"],
    defaultVisibility: "client",
    passcode: "5200",
  },
];

const routeAccess: Record<AccessProfileId, string[]> = {
  direcao: [
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
  claw: [
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
  sales: ["/", "/operacoes", "/performance", "/pipelines", "/clientes", "/portal", "/suporte"],
  cliente: ["/portal"],
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function matchesRoute(pathname: string, allowedRoute: string) {
  return allowedRoute === "/" ? pathname === "/" : pathname.startsWith(allowedRoute);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AuthSession;
      setSession(parsed);
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  const signIn = (identityId: string, passcode: string) => {
    const identity = identities.find((item) => item.id === identityId);
    if (!identity) return { ok: false as const, error: "Perfil não encontrado." };
    if (identity.passcode !== passcode.trim()) {
      return { ok: false as const, error: "Chave de acesso inválida." };
    }

    const nextSession: AuthSession = {
      identityId: identity.id,
      name: identity.name,
      email: identity.email,
      profileId: identity.profileId,
      operationIds: identity.operationIds,
      defaultVisibility: identity.defaultVisibility,
      signedAt: new Date().toISOString(),
    };

    setSession(nextSession);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    }
    return { ok: true as const };
  };

  const signOut = () => {
    setSession(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      session,
      identities,
      signIn,
      signOut,
      canAccessOperation: (operationId: string) =>
        !session || session.operationIds === "all" || session.operationIds.includes(operationId),
      canAccessRoute: (pathname: string) => {
        if (!session) return false;
        return routeAccess[session.profileId].some((route) => matchesRoute(pathname, route));
      },
    }),
    [session],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, canAccessRoute } = useAdminAuth();
  const pathname = useRouterState({ select: (router) => router.location.pathname });

  if (!session) {
    return <SignInScreen />;
  }

  if (!canAccessRoute(pathname)) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}

function SignInScreen() {
  const { identities, signIn } = useAdminAuth();
  const [selectedIdentityId, setSelectedIdentityId] = useState(identities[0]?.id ?? "");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedIdentity =
    identities.find((identity) => identity.id === selectedIdentityId) ?? identities[0] ?? null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = signIn(selectedIdentityId, passcode);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setPasscode("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-border bg-card p-8">
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
          >
            Auth e RBAC
          </Badge>
          <div className="mt-4">
            <BrandMark />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-display">
            Entrada governada para o cockpit
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            O produto agora separa sessão, perfil e escopo por operação antes de liberar a leitura
            interna, o portal e as frentes sensíveis do sistema.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <GateInfoCard
              title="Sessão"
              detail="Cada acesso passa a abrir uma identidade operacional clara."
              icon={UserRound}
            />
            <GateInfoCard
              title="Perfil"
              detail="Direção, Claw, Sales Ops e Cliente entram com papéis diferentes."
              icon={ShieldCheck}
            />
            <GateInfoCard
              title="Escopo"
              detail="O sistema limita rota e operação conforme a carteira liberada."
              icon={LockKeyhole}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-8">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Acesso controlado
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-display">Entrar no produto</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta é a base da próxima camada de produção real: sessão, permissão e portal privado
            por papel.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Perfil
              </label>
              <select
                value={selectedIdentityId}
                onChange={(event) => setSelectedIdentityId(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {identities.map((identity) => (
                  <option key={identity.id} value={identity.id}>
                    {identity.name} · {identity.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Chave de acesso
              </label>
              <Input
                type="password"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                placeholder="Informe a chave deste perfil"
                className="h-11 bg-background"
              />
            </div>

            {selectedIdentity && (
              <div className="rounded-xl border border-border bg-surface px-4 py-3 text-[12px] text-muted-foreground">
                <span className="text-foreground font-medium">{selectedIdentity.name}</span>
                {" · "}
                {selectedIdentity.profileId}
                {" · "}
                {selectedIdentity.operationIds === "all"
                  ? "carteira inteira"
                  : `${selectedIdentity.operationIds.length} operação(ões) liberada(s)`}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="h-11 w-full">
              Entrar no cockpit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function GateInfoCard({
  title,
  detail,
  icon: Icon,
}: {
  title: string;
  detail: string;
  icon: typeof UserRound;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function AccessDeniedScreen() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-xl rounded-[28px] border border-border bg-card p-8 text-center">
        <Badge
          variant="outline"
          className="text-[10px] uppercase tracking-[0.18em] border-destructive/40 text-destructive bg-destructive/5 h-5"
        >
          Escopo restrito
        </Badge>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-display">
          Esta rota não está liberada para o perfil atual
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          O produto agora limita leitura e navegação por papel e por operação. Use uma rota
          compatível com este perfil ou volte para o portal liberado.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/portal">Ir para o portal</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
