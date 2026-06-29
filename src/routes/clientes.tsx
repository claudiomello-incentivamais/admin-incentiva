import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";

export const Route = createFileRoute("/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Console B2B" }] }),
  component: () => (
    <>
      <Topbar breadcrumb={["Console", "Clientes"]} />
      <main className="flex-1 flex items-center justify-center p-10">
        <div className="surface-card p-10 max-w-md text-center">
          <Construction className="h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="text-display text-xl font-semibold mb-2">Clientes</h2>
          <p className="text-sm text-muted-foreground">Em construção.</p>
        </div>
      </main>
    </>
  ),
});
