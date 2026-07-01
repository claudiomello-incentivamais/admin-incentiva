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
    const [{ readAuthSessionFromRequest }, { loadEvolutionTelemetryDashboard }] = await Promise.all([
      import("./admin-auth.server"),
      import("./admin-evolution-telemetry"),
    ]);

    const session = await readAuthSessionFromRequest(request);
    return loadEvolutionTelemetryDashboard({
      operationIds: session?.operationIds ?? "all",
    });
  });
