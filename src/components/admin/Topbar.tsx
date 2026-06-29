import { Bell, Search, ChevronDown, Filter } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  breadcrumb: string[];
}

export function Topbar({ breadcrumb }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="h-5 w-px bg-border" />
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumb.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span
              className={
                i === breadcrumb.length - 1
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }
            >
              {c}
            </span>
            {i < breadcrumb.length - 1 && (
              <span className="text-muted-foreground/40">/</span>
            )}
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar operações, clientes, métricas..."
            className="h-9 w-[280px] pl-8 bg-surface border-border text-sm"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground text-mono">
            ⌘K
          </kbd>
        </div>

        <Button variant="ghost" size="sm" className="h-9 gap-2 text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          <span className="text-xs">Últimos 30 dias</span>
          <ChevronDown className="h-3 w-3" />
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-primary text-primary-foreground border-2 border-background">
            7
          </Badge>
        </Button>
      </div>
    </header>
  );
}
