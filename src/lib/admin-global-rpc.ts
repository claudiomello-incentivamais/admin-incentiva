import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const requestContextMiddleware = createMiddleware().server(({ request, next }) =>
  next({ context: { request } }),
);

const requestContext = z.object({
  request: z.custom<Request>(),
});

export const loadScopedGlobalDashboardServerFn = createServerFn({ method: "GET" })
  .middleware([requestContextMiddleware])
  .handler(async ({ context }) => {
    const { request } = requestContext.parse(context);
    const [{ readAuthSessionFromRequest }, { loadScopedGlobalDashboard }] = await Promise.all([
      import("./admin-auth.server"),
      import("./admin-data"),
    ]);

    const session = await readAuthSessionFromRequest(request);
    return loadScopedGlobalDashboard({
      operationIds: session?.operationIds ?? "all",
    });
  });
