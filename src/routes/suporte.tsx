import { createFileRoute } from "@tanstack/react-router";
import { RoutePlaceholder } from "@/components/admin/RoutePlaceholder";

export const Route = createFileRoute("/suporte")({
  head: () => ({ meta: [{ title: "Suporte — Console Incentiva" }] }),
  component: () => (
    <RoutePlaceholder
      breadcrumb={["Console Incentiva", "Suporte"]}
      title="Suporte"
      description="Aqui entram incidentes, runbooks e apoio operacional para quando a leitura do painel pedir intervenção técnica."
      scope={["Incidentes", "Runbooks", "Checklist de correção", "Apoio técnico"]}
    />
  ),
});
