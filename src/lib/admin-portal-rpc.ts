import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const requestContextMiddleware = createMiddleware().server(({ request, next }) =>
  next({ context: { request } }),
);

const requestContext = z.object({
  request: z.custom<Request>(),
});

const portalBundleRequest = z.object({
  operationId: z.string().optional(),
});

function resolveFocusOperation(
  dashboard: Awaited<ReturnType<typeof import("./admin-data").loadScopedGlobalDashboard>>,
  requestedOperationId?: string,
) {
  return (
    (requestedOperationId
      ? dashboard.operations.find((operation) => operation.id === requestedOperationId)
      : null) ??
    dashboard.operations.find((operation) => operation.health === "healthy") ??
    dashboard.operations.find((operation) => operation.health === "monitor") ??
    dashboard.operations[0] ??
    null
  );
}

export type PortalPageBundle = {
  dashboard: Awaited<ReturnType<typeof import("./admin-data").loadScopedGlobalDashboard>> | null;
  evolution: Awaited<
    ReturnType<typeof import("./admin-evolution-telemetry").loadEvolutionTelemetryDashboard>
  > | null;
  n8n: Awaited<ReturnType<typeof import("./admin-n8n-telemetry").loadN8nTelemetryDashboard>> | null;
  analytics: Awaited<ReturnType<typeof import("./admin-portal-analytics").loadPortalAnalytics>> | null;
  focusOperationId: string | null;
};

export const loadPortalPageBundleServerFn = createServerFn({ method: "GET" })
  .middleware([requestContextMiddleware])
  .validator(portalBundleRequest.optional())
  .handler(async ({ context, data }) => {
    const { request } = requestContext.parse(context);
    const [
      { readAuthSessionFromRequest },
      { loadScopedGlobalDashboard },
      { loadEvolutionTelemetryDashboard },
      { loadN8nTelemetryDashboard },
      { loadPortalAnalytics },
    ] = await Promise.all([
      import("./admin-auth.server"),
      import("./admin-data"),
      import("./admin-evolution-telemetry"),
      import("./admin-n8n-telemetry"),
      import("./admin-portal-analytics"),
    ]);

    const session = await readAuthSessionFromRequest(request);
    if (!session) {
      return {
        dashboard: null,
        evolution: null,
        n8n: null,
        analytics: null,
        focusOperationId: null,
      } satisfies PortalPageBundle;
    }

    const operationIds = session.operationIds ?? "all";
    const dashboard = await loadScopedGlobalDashboard({ operationIds });
    const focusOperation = resolveFocusOperation(dashboard, data?.operationId);
    if (!focusOperation) {
      return {
        dashboard,
        evolution: { source: "snapshot", snapshotLabel: "Sem operação foco", metrics: [], operations: [], instances: [] },
        n8n: { source: "snapshot", snapshotLabel: "Sem operação foco", metrics: [], operations: [], workflows: [] },
        analytics: { operations: [], source: "snapshot" },
        focusOperationId: null,
      } satisfies PortalPageBundle;
    }

    const focusOperationScope = [{ id: focusOperation.id, name: focusOperation.name }];

    const [evolution, n8n, analytics] = await Promise.all([
      loadEvolutionTelemetryDashboard({
        operationIds: [focusOperation.id],
        operationScope: focusOperationScope,
      }),
      loadN8nTelemetryDashboard({
        operationIds: [focusOperation.id],
      }),
      loadPortalAnalytics({
        operationScope: focusOperationScope,
      }),
    ]);

    return {
      dashboard,
      evolution,
      n8n,
      analytics,
      focusOperationId: focusOperation.id,
    } satisfies PortalPageBundle;
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
