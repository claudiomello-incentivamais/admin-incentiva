import { Construction, Layers3 } from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { Badge } from "@/components/ui/badge";

export function RoutePlaceholder({
  breadcrumb,
  title,
  description,
  scope,
}: {
  breadcrumb: string[];
  title: string;
  description: string;
  scope: string[];
}) {
  return (
    <>
      <Topbar breadcrumb={breadcrumb} />
      <main className="flex-1 px-6 py-6 max-w-5xl w-full mx-auto">
        <div className="surface-card p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/30 text-primary bg-primary/5 h-5"
              >
                Próxima camada
              </Badge>
              <h1 className="text-display text-2xl font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/15">
              <Construction className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layers3 className="h-4 w-4 text-primary" />
              O que esta frente vai concentrar
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {scope.map((item) => (
                <Badge key={item} variant="secondary" className="rounded-full px-3 py-1 text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
