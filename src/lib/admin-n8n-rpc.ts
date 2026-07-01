import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const requestContextMiddleware = createMiddleware().server(({ request, next }) =>
  next({ context: { request } }),
);

const requestContext = z.object({
  request: z.custom<Request>(),
});

export const loadN8nTelemetryDashboardServerFn = createServerFn({ method: "GET" })
  .middleware([requestContextMiddleware])
  .handler(async ({ context }) => {
    const { request } = requestContext.parse(context);
    const [{ readAuthSessionFromRequest }, { loadN8nTelemetryDashboard }] = await Promise.all([
      import("./admin-auth.server"),
      import("./admin-n8n-telemetry"),
    ]);

    const session = await readAuthSessionFromRequest(request);
    return loadN8nTelemetryDashboard({
      operationIds: session?.operationIds ?? "all",
    });
  });
