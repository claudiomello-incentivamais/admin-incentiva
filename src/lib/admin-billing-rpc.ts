import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const requestContextMiddleware = createMiddleware().server(({ request, next }) =>
  next({ context: { request } }),
);

const requestContext = z.object({
  request: z.custom<Request>(),
});

export const loadScopedBillingDashboardServerFn = createServerFn({ method: "GET" })
  .middleware([requestContextMiddleware])
  .handler(async ({ context }) => {
    const { request } = requestContext.parse(context);
    const [
      { readAuthSessionFromRequest },
      { loadScopedBillingDashboard },
      { loadApi4ComTelemetryDashboard },
    ] = await Promise.all([
      import("./admin-auth.server"),
      import("./admin-billing-data"),
      import("./admin-api4com.server"),
    ]);

    const session = await readAuthSessionFromRequest(request);
    const operationIds = session?.operationIds ?? "all";
    const api4com = await loadApi4ComTelemetryDashboard({ operationIds });

    return loadScopedBillingDashboard({
      operationIds,
      api4com,
    });
  });
