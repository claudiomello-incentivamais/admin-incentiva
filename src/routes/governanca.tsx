import { createFileRoute } from "@tanstack/react-router";
import { RoutePlaceholder } from "@/components/admin/RoutePlaceholder";

export const Route = createFileRoute("/governanca")({
  head: () => ({ meta: [{ title: "Governança — Console Incentiva" }] }),
  component: () => (
    <RoutePlaceholder
      breadcrumb={["Console Incentiva", "Governança"]}
      title="Governança"
      description="Aqui vai ficar a leitura da integridade operacional: qualidade de dado, saúde do n8n, ownership, alertas e checkpoints de execução."
      scope={["Qualidade de dado", "Saúde do n8n", "Alertas", "Ownership e SLA"]}
    />
  ),
});
