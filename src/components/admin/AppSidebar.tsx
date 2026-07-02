import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Settings,
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
import { Badge } from "@/components/ui/badge";

const clientFacingRoutes = [
  { title: "Portal do Cliente", url: "/portal", icon: GlobeLock },
];

const internalRoutes = [
  { title: "Admin Global", url: "/", icon: LayoutDashboard },
  { title: "Integrações", url: "/integracoes", icon: Link2 },
  { title: "Faturamento", url: "/faturamento", icon: Receipt },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { session, signOut } = useAdminAuth();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));
  const allowedRoutes = new Set(session?.allowedRoutes ?? ["/"]);

  const renderGroup = (
    label: string,
    items: typeof clientFacingRoutes,
    description?: string,
  ) => {
    const visibleItems = items.filter((item) => allowedRoutes.has(item.url));
    if (visibleItems.length === 0) return null;

    return (
      <SidebarGroup>
      {(!collapsed || isMobile) && (
        <div className="px-2 pb-1">
          <SidebarGroupLabel className="px-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {label}
          </SidebarGroupLabel>
          {description ? (
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/80">
              {description}
            </p>
          ) : null}
        </div>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="h-10 rounded-md data-[active=true]:border-l-2 data-[active=true]:border-primary data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground md:h-9"
                >
                  <Link
                    to={item.url}
                    className="flex items-center gap-3"
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
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
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="px-2 py-2.5">
          <BrandMark compact={collapsed} />
          {(!collapsed || isMobile) && session && (
            <div className="mt-3 rounded-xl border border-sidebar-border bg-sidebar-accent/70 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Sessão ativa
                  </div>
                  <div className="mt-1 text-xs text-sidebar-foreground">{session.name}</div>
                </div>
                <Badge
                  variant="outline"
                  className="h-5 border-sidebar-border bg-sidebar px-2 text-[10px] uppercase tracking-[0.16em]"
                >
                  {session.profileId}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1">
        {renderGroup(
          "Portal principal",
          clientFacingRoutes,
          "Leitura client-facing da operação, com foco em cockpit, prioridade e execução.",
        )}
        {renderGroup(
          "Camada interna",
          internalRoutes,
          "Controles administrativos, comparativos e governança multioperação.",
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2">
          {(!collapsed || isMobile) && (
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/60 px-3 py-2">
              <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Ambiente
              </span>
              <span className="mt-1 block text-xs text-sidebar-foreground">
                Piloto Lovable
              </span>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                Portal externo + administração interna separados por contexto.
              </span>
              {session && (
                <>
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
