import { createFileRoute } from "@tanstack/react-router";
import { RoutePlaceholder } from "@/components/admin/RoutePlaceholder";

export const Route = createFileRoute("/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Console Incentiva" }] }),
  component: () => (
    <RoutePlaceholder
      breadcrumb={["Console Incentiva", "Clientes"]}
      title="Clientes"
      description="Aqui a leitura deixa de ser só por canal e passa a ser por conta, operação e carteira acompanhada."
      scope={["Carteira", "Conta por operação", "Contexto do cliente", "Risco e prioridade"]}
    />
  ),
});
