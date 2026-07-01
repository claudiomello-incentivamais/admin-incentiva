import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const requestContextMiddleware = createMiddleware().server(({ request, next }) =>
  next({ context: { request } }),
);

const requestContext = z.object({
  request: z.custom<Request>(),
});

export const loadPortalAnalyticsServerFn = createServerFn({ method: "GET" })
  .middleware([requestContextMiddleware])
  .handler(async ({ context }) => {
    const { request } = requestContext.parse(context);
    const [
      { readAuthSessionFromRequest },
      { loadScopedGlobalDashboard },
      { loadPortalAnalytics },
    ] = await Promise.all([
      import("./admin-auth.server"),
      import("./admin-data"),
      import("./admin-portal-analytics"),
    ]);

    const session = await readAuthSessionFromRequest(request);
    const dashboard = await loadScopedGlobalDashboard({
      operationIds: session?.operationIds ?? "all",
    });

    return loadPortalAnalytics({
      operationScope: dashboard.operations.map((operation) => ({
        id: operation.id,
        name: operation.name,
      })),
    });
  });
