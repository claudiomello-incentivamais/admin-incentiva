import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

import { BrandMark } from "@/components/admin/BrandMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AUTH_IDENTITIES_PUBLIC,
  type AccessProfileId,
  type AuthIdentityPublic,
  type AuthSession,
  type VisibilityMode,
} from "@/lib/admin-auth.shared";
import {
  getAuthSessionServerFn,
  signInServerFn,
  signOutServerFn,
} from "@/lib/admin-auth-rpc";

export type { AccessProfileId, AuthSession, VisibilityMode } from "@/lib/admin-auth.shared";

type AdminAuthContextValue = {
  session: AuthSession | null;
  identities: AuthIdentityPublic[];
  signIn: (
    identityId: string,
    passcode: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  canAccessOperation: (operationId: string) => boolean;
  canAccessRoute: (pathname: string) => boolean;
};

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

export function AdminAuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: AuthSession | null;
}) {
  const [session, setSession] = useState<AuthSession | null>(initialSession);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  const refreshSession = async () => {
    const nextSession = await getAuthSessionServerFn();
    setSession(nextSession);
  };

  const signIn = async (identityId: string, passcode: string) => {
    const response = await signInServerFn({
      data: { identityId, passcode },
    });
    const payload = (await response.json()) as
      | { ok: true; session: AuthSession }
      | { ok: false; error?: string };

    if (!response.ok || !payload.ok) {
      return {
        ok: false as const,
        error: payload.ok ? "Falha ao abrir a sessão." : payload.error ?? "Falha ao abrir a sessão.",
      };
    }

    setSession(payload.session);
    return { ok: true as const };
  };

  const signOut = async () => {
    await signOutServerFn({ data: undefined });
    setSession(null);
  };

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      session,
      identities: AUTH_IDENTITIES_PUBLIC,
      signIn,
      signOut,
      refreshSession,
      canAccessOperation: (operationId: string) =>
        !!session &&
        (session.operationIds === "all" || session.operationIds.includes(operationId)),
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedIdentity =
    identities.find((identity) => identity.id === selectedIdentityId) ?? identities[0] ?? null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await signIn(selectedIdentityId, passcode);
    setIsSubmitting(false);

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
            Auth real
          </Badge>
          <div className="mt-4">
            <BrandMark />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-display">
            Entrada governada para o cockpit
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            A sessão agora sobe pelo servidor, grava cookie de acesso e aplica perfil e carteira
            já na fundação do produto.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <GateInfoCard
              title="Sessão"
              detail="O acesso deixa de ser só local e passa a nascer no servidor."
              icon={UserRound}
            />
            <GateInfoCard
              title="Perfil"
              detail="Direção, Claw, Sales Ops e Cliente entram com papéis diferentes."
              icon={ShieldCheck}
            />
            <GateInfoCard
              title="Escopo"
              detail="Rota, visibilidade e carteira são limitadas pela sessão ativa."
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
            Esta camada fecha a transição do mock local para sessão real por cookie, já pronta para
            publish privado por conta.
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

            <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
              {isSubmitting ? "Abrindo sessão..." : "Entrar no cockpit"}
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
  const { session } = useAdminAuth();
  const fallbackRoute = session?.profileId === "cliente" ? "/portal" : "/";

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
          A sessão ativa já está limitando rota e operação conforme o papel aberto. Volte para a
          frente compatível com esse escopo.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to={fallbackRoute}>Ir para a frente liberada</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/portal">Abrir portal</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
