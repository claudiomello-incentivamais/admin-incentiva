import { createFileRoute } from "@tanstack/react-router";
import { RoutePlaceholder } from "@/components/admin/RoutePlaceholder";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Console Incentiva" }] }),
  component: () => (
    <RoutePlaceholder
      breadcrumb={["Console Incentiva", "Configurações"]}
      title="Configurações"
      description="Camada reservada para fontes, parâmetros, filtros globais e governança de ambiente do painel."
      scope={["Fontes de dados", "Parâmetros", "Filtros globais", "Preferências do ambiente"]}
    />
  ),
});
