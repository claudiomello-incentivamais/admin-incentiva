import { createFileRoute } from "@tanstack/react-router";
import { RoutePlaceholder } from "@/components/admin/RoutePlaceholder";

export const Route = createFileRoute("/faturamento")({
  head: () => ({ meta: [{ title: "Faturamento — Console Incentiva" }] }),
  component: () => (
    <RoutePlaceholder
      breadcrumb={["Console Incentiva", "Faturamento"]}
      title="Faturamento"
      description="Esta frente vai ligar operação comercial e previsibilidade de receita, com leitura de carteira, contratos e conversão em valor."
      scope={["Receita prevista", "Conversão em valor", "Carteira ativa", "Expansão e risco"]}
    />
  ),
});
