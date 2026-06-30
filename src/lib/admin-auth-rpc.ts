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
