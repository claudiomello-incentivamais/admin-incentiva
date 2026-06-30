import { createFileRoute } from "@tanstack/react-router";
import { RoutePlaceholder } from "@/components/admin/RoutePlaceholder";

export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "Performance — Console Incentiva" }] }),
  component: () => (
    <RoutePlaceholder
      breadcrumb={["Console Incentiva", "Performance"]}
      title="Performance Comercial"
      description="Esta frente vai comparar conversão, throughput e resultado entre canais, famílias de workflow e operações."
      scope={["Conversão por canal", "Throughput", "Eficiência comercial", "Comparativos entre operações"]}
    />
  ),
});
