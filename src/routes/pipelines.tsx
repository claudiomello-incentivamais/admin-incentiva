import { createFileRoute } from "@tanstack/react-router";
import { RoutePlaceholder } from "@/components/admin/RoutePlaceholder";

export const Route = createFileRoute("/pipelines")({
  head: () => ({ meta: [{ title: "Pipelines — Console Incentiva" }] }),
  component: () => (
    <RoutePlaceholder
      breadcrumb={["Console Incentiva", "Pipelines"]}
      title="Pipelines"
      description="Esta camada vai descer da operação para cada fluxo relevante, mostrando fila, gargalo, estado e saída útil."
      scope={["WhatsApp", "E-mail", "LinkedIn", "Drill-down por workflow"]}
    />
  ),
});
