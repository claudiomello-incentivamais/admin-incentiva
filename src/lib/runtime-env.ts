type RuntimeEnvMap = Record<string, unknown>;

// Vite only inlines variables that are accessed explicitly. Keep the public
// Supabase keys enumerated here so the SSR bundle carries them even when the
// Cloudflare runtime bindings are absent in Lovable publishes.
const explicitMetaEnv: RuntimeEnvMap = {
  BASE_URL: import.meta.env.BASE_URL,
  DEV: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  SSR: import.meta.env.SSR,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// The public Portal SSR still has to materialize live telemetry even when the
// external deploy omits build/runtime env bindings. Keep the operational
// Supabase credentials available as a server-side fallback for these loaders.
const serverFallbackEnv: RuntimeEnvMap =
  import.meta.env.SSR
    ? {
        ADMIN_INCENTIVA_SUPABASE_URL: "https://mpylbvzifkwwfjwajobp.supabase.co",
        VITE_SUPABASE_URL: "https://mpylbvzifkwwfjwajobp.supabase.co",
        ADMIN_INCENTIVA_SUPABASE_ANON_KEY:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1weWxidnppZmt3d2Zqd2Fqb2JwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA2MzI5OSwiZXhwIjoyMDY3NjM5Mjk5fQ.IUnuZiolWaxdsP15GRFSXGAI4DD42YkiRKKv_KKcW7M",
        VITE_SUPABASE_ANON_KEY:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1weWxidnppZmt3d2Zqd2Fqb2JwIiwicm9sZSI6InNlcnZpY2Vfcm9sZV9rZXkiLCJpYXQiOjE3NTIyMzA2ODgsImV4cCI6MjA2NzgwNjY4OH0.5yLQcbdV_UsaJ4W-fGdS7-uXwScHrnF3HppWBDbS9LQ",
        ADMIN_INCENTIVA_SUPABASE_SERVICE_ROLE_KEY:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1weWxidnppZmt3d2Zqd2Fqb2JwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA2MzI5OSwiZXhwIjoyMDY3NjM5Mjk5fQ.IUnuZiolWaxdsP15GRFSXGAI4DD42YkiRKKv_KKcW7M",
        SUPABASE_SERVICE_ROLE_KEY:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1weWxidnppZmt3d2Zqd2Fqb2JwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA2MzI5OSwiZXhwIjoyMDY3NjM5Mjk5fQ.IUnuZiolWaxdsP15GRFSXGAI4DD42YkiRKKv_KKcW7M",
        SUPABASE_SERVICE_ROLE:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1weWxidnppZmt3d2Zqd2Fqb2JwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA2MzI5OSwiZXhwIjoyMDY3NjM5Mjk5fQ.IUnuZiolWaxdsP15GRFSXGAI4DD42YkiRKKv_KKcW7M",
      }
    : {};

function readRawEnv(name: string): unknown {
  const runtimeEnv = (globalThis as { __env__?: RuntimeEnvMap }).__env__;
  if (runtimeEnv && name in runtimeEnv) {
    return runtimeEnv[name];
  }

  if (typeof process !== "undefined" && process.env && name in process.env) {
    return process.env[name];
  }

  if (name in explicitMetaEnv) {
    return explicitMetaEnv[name];
  }

  if (name in serverFallbackEnv) {
    return serverFallbackEnv[name];
  }

  return undefined;
}

export function readEnvString(...names: string[]) {
  for (const name of names) {
    const raw = readRawEnv(name);
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (trimmed) return trimmed;
  }

  return "";
}
