import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const requestContextMiddleware = createMiddleware().server(({ request, next }) =>
  next({ context: { request } }),
);

const requestContext = z.object({
  request: z.custom<Request>(),
});

export const getAuthSessionServerFn = createServerFn({ method: "GET" })
  .middleware([requestContextMiddleware])
  .handler(async ({ context }) => {
    const { request } = requestContext.parse(context);
    const { readAuthSessionFromRequest } = await import("./admin-auth.server");
    return readAuthSessionFromRequest(request);
  });

export const signInServerFn = createServerFn({ method: "POST" })
  .middleware([requestContextMiddleware])
  .validator(
    z.object({
      identityId: z.string().min(1),
      passcode: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    const { request } = requestContext.parse(context);
    const { signInIdentity } = await import("./admin-auth.server");
    const result = await signInIdentity({
      identityId: data.identityId,
      passcode: data.passcode,
      request,
    });

    if (!result.ok || !result.session) {
      return Response.json(
        { ok: false, error: result.error ?? "Falha ao abrir a sessão." },
        { status: 401 },
      );
    }

    return Response.json(
      { ok: true, session: result.session },
      {
        headers: {
          "Set-Cookie": result.cookie,
        },
      },
    );
  });

export const signOutServerFn = createServerFn({ method: "POST" })
  .middleware([requestContextMiddleware])
  .handler(async ({ context }) => {
    const { request } = requestContext.parse(context);
    const { buildSignOutCookie } = await import("./admin-auth.server");
    return Response.json(
      { ok: true },
      {
        headers: {
          "Set-Cookie": buildSignOutCookie(request),
        },
      },
    );
  });

export const createAccessInviteServerFn = createServerFn({ method: "POST" })
  .middleware([requestContextMiddleware])
  .validator(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      profileId: z.enum(["direcao", "claw", "sales_ops", "sdr", "cliente"]),
      accessPackageId: z.enum([
        "admin_full",
        "executivo_publish",
        "operacional_safe",
        "portal_private",
      ]),
      allowedRoutes: z.array(z.string().min(1)).optional(),
      operationIds: z.union([z.literal("all"), z.array(z.string().min(1))]),
      defaultVisibility: z.enum(["internal", "client"]),
      expiresInHours: z.number().int().min(1).max(24 * 30),
    }),
  )
  .handler(async ({ data, context }) => {
    const { request } = requestContext.parse(context);
    const { createAccessInvite, readAuthSessionFromRequest } = await import("./admin-auth.server");
    const session = await readAuthSessionFromRequest(request);

    if (!session) {
      return Response.json({ ok: false, error: "Sessão inválida para emitir convite." }, { status: 401 });
    }

    const result = await createAccessInvite({
      invitedBy: session,
      draft: data,
      request,
    });

    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: 403 });
    }

    return Response.json({ ok: true, invite: result.invite, registry: result.registry });
  });

export const verifyAccessInviteServerFn = createServerFn({ method: "POST" })
  .middleware([requestContextMiddleware])
  .validator(
    z.object({
      token: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    const { request } = requestContext.parse(context);
    const { verifyAccessInviteToken } = await import("./admin-auth.server");
    const result = await verifyAccessInviteToken({
      token: data.token,
      request,
    });

    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: 400 });
    }

    return Response.json({ ok: true, invite: result.invite });
  });

export const acceptAccessInviteServerFn = createServerFn({ method: "POST" })
  .middleware([requestContextMiddleware])
  .validator(
    z.object({
      token: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    const { request } = requestContext.parse(context);
    const { acceptAccessInvite } = await import("./admin-auth.server");
    const result = await acceptAccessInvite({
      token: data.token,
      request,
    });

    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: 400 });
    }

    return Response.json(
      { ok: true, session: result.session },
      {
        headers: {
          "Set-Cookie": result.cookie,
        },
      },
    );
  });

export const listAccessRegistryServerFn = createServerFn({ method: "GET" })
  .middleware([requestContextMiddleware])
  .handler(async ({ context }) => {
    const { request } = requestContext.parse(context);
    const { listAccessRegistryEntries } = await import("./admin-access-registry.server");
    const { readAuthSessionFromRequest } = await import("./admin-auth.server");
    const session = await readAuthSessionFromRequest(request);

    if (!session) {
      return Response.json({ ok: false, error: "Sessão inválida para ler o registry." }, { status: 401 });
    }

    if (!["direcao", "claw"].includes(session.profileId)) {
      return Response.json({ ok: false, error: "A sessão atual não pode ler o registry." }, { status: 403 });
    }

    const snapshot = await listAccessRegistryEntries();
    return Response.json({ ok: true, snapshot });
  });

export const revokeAccessInviteServerFn = createServerFn({ method: "POST" })
  .middleware([requestContextMiddleware])
  .validator(
    z.object({
      registryId: z.string().min(1),
      reason: z.string().trim().max(240).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { request } = requestContext.parse(context);
    const { revokeAccessInvite } = await import("./admin-access-registry.server");
    const { readAuthSessionFromRequest } = await import("./admin-auth.server");
    const session = await readAuthSessionFromRequest(request);

    if (!session) {
      return Response.json({ ok: false, error: "Sessão inválida para revogar o convite." }, { status: 401 });
    }

    if (!["direcao", "claw"].includes(session.profileId)) {
      return Response.json({ ok: false, error: "A sessão atual não pode revogar convites." }, { status: 403 });
    }

    const result = await revokeAccessInvite({
      registryId: data.registryId,
      revokedBy: session,
      reason: data.reason,
    });

    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: 400 });
    }

    return Response.json({ ok: true });
  });
