type RuntimeEnvMap = Record<string, unknown>;

function readRawEnv(name: string): unknown {
  const runtimeEnv = (globalThis as { __env__?: RuntimeEnvMap }).__env__;
  if (runtimeEnv && name in runtimeEnv) {
    return runtimeEnv[name];
  }

  if (typeof process !== "undefined" && process.env && name in process.env) {
    return process.env[name];
  }

  const metaEnv = (import.meta as { env?: RuntimeEnvMap }).env;
  if (metaEnv && name in metaEnv) {
    return metaEnv[name];
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
