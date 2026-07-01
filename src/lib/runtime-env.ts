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
