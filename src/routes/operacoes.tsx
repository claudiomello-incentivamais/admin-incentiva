import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";

export const Route = createFileRoute("/operacoes")({
  head: () => ({ meta: [{ title: "Operações — Console B2B" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <Topbar breadcrumb={["Console", "Operações"]} />
      <main className="flex-1 flex items-center justify-center p-10">
        <div className="surface-card p-10 max-w-md text-center">
          <Construction className="h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="text-display text-xl font-semibold mb-2">Console por Operação</h2>
          <p className="text-sm text-muted-foreground">
            Estrutura preparada para drill-down por operação. Cada operação terá seu próprio
            painel com KPIs, pipeline e governança individual.
          </p>
        </div>
      </main>
    </>
  );
}
