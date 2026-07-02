import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const requestContextMiddleware = createMiddleware().server(({ request, next }) =>
  next({ context: { request } }),
);

const requestContext = z.object({
  request: z.custom<Request>(),
});

export const loadEvolutionTelemetryDashboardServerFn = createServerFn({ method: "GET" })
  .middleware([requestContextMiddleware])
  .handler(async ({ context }) => {
    const { request } = requestContext.parse(context);
    const [
      { readAuthSessionFromRequest },
      { loadScopedGlobalDashboard },
      { loadEvolutionTelemetryDashboard },
    ] = await Promise.all([
      import("./admin-auth.server"),
      import("./admin-data"),
      import("./admin-evolution-telemetry"),
    ]);

    const session = await readAuthSessionFromRequest(request);
    const dashboard = await loadScopedGlobalDashboard({
      operationIds: session?.operationIds ?? "all",
    });
    return loadEvolutionTelemetryDashboard({
      operationIds: session?.operationIds ?? "all",
      operationScope: dashboard.operations.map((operation) => ({
        id: operation.id,
        name: operation.name,
      })),
    });
  });
