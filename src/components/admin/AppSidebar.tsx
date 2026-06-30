import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  ShieldCheck,
  Settings,
  LifeBuoy,
  Workflow,
  Receipt,
  GlobeLock,
  Link2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { BrandMark } from "@/components/admin/BrandMark";
import { useAdminAuth } from "@/components/admin/auth-context";

const global = [
  { title: "Admin Global", url: "/", icon: LayoutDashboard },
  { title: "Operações", url: "/operacoes", icon: Building2 },
  { title: "Performance", url: "/performance", icon: BarChart3 },
  { title: "Governança", url: "/governanca", icon: ShieldCheck },
];

const operacional = [
  { title: "Pipelines", url: "/pipelines", icon: Workflow },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Portal", url: "/portal", icon: GlobeLock },
  { title: "Faturamento", url: "/faturamento", icon: Receipt },
];

const sistema = [
  { title: "Integrações", url: "/integracoes", icon: Link2 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Suporte", url: "/suporte", icon: LifeBuoy },
];

export function AppSidebar() {
  const { session, signOut } = useAdminAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));
  const allowedRoutes = new Set(
    session?.profileId === "cliente"
      ? ["/portal"]
      : session?.profileId === "sales"
        ? ["/", "/operacoes", "/performance", "/pipelines", "/clientes", "/portal", "/suporte"]
        : ["/", "/operacoes", "/performance", "/governanca", "/pipelines", "/clientes", "/portal", "/faturamento", "/integracoes", "/configuracoes", "/suporte"],
  );

  const renderGroup = (label: string, items: typeof global) => (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.filter((item) => allowedRoutes.has(item.url)).map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="h-9 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:border-l-2 data-[active=true]:border-primary rounded-md"
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="text-sm">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="px-2 py-2.5">
          <BrandMark compact={collapsed} />
          {!collapsed && (
            <div className="mt-3 rounded-xl border border-sidebar-border bg-sidebar-accent/70 px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Mapa do console
              </div>
              <div className="mt-1 text-[12px] leading-snug text-sidebar-foreground">
                Admin Global consolida a carteira. Operações aprofunda a conta. As demais frentes
                entram como camadas de leitura e execução.
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1">
        {renderGroup("Visão Geral", global)}
        {renderGroup("Operacional", operacional)}
        {renderGroup("Sistema", sistema)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2">
          {!collapsed && (
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/60 px-3 py-2">
              <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Ambiente
              </span>
              <span className="mt-1 block text-xs text-sidebar-foreground">
                Piloto Lovable + GitHub da Incentiva
              </span>
              {session && (
                <>
                  <span className="mt-3 block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Sessão
                  </span>
                  <span className="mt-1 block text-xs text-sidebar-foreground">
                    {session.name} · {session.profileId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      void signOut();
                    }}
                    className="mt-3 inline-flex text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Encerrar sessão
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
