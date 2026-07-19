#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const localNetworkName = "deskops-local-loopback";
const excludedServices = [
  "studio",
  "postgres-meta",
  "realtime",
  "storage-api",
  "imgproxy",
  "edge-runtime",
  "logflare",
  "vector",
  "supavisor",
];

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`DeskOps private local mode

Usage:
  npm run self-host

This starts a local Supabase stack, applies the repository migrations,
then runs DeskOps at http://localhost:3000. App data and login email stay in
local Docker volumes. Press Ctrl+C to stop DeskOps; the database keeps running.

Related commands:
  npm run self-host:backup   Export local table data to backups/deskops-data.sql
  npm run self-host:stop     Stop the local services without deleting their data
`);
  process.exit(0);
}

function fail(message, details) {
  console.error(`\nDeskOps local mode could not start: ${message}`);
  if (details) console.error(details.trim());
  process.exit(1);
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    ...options,
  });
}

const docker = run("docker", ["info"], { stdio: "ignore" });
if (docker.error?.code === "ENOENT") {
  fail("Docker was not found. Install and open Docker Desktop or OrbStack, then try again.");
}
if (docker.status !== 0) {
  fail("Docker is installed but is not running. Open Docker Desktop or OrbStack, then try again.");
}

const network = run("docker", [
  "network",
  "inspect",
  "--format",
  '{{ index .Options "com.docker.network.bridge.host_binding_ipv4" }}',
  localNetworkName,
]);

if (network.status === 0 && network.stdout.trim() !== "127.0.0.1") {
  fail(
    `Docker network ${localNetworkName} already exists without the required localhost-only binding.`,
    `Remove that unused network, then try again: docker network rm ${localNetworkName}`,
  );
}

if (network.status !== 0) {
  const createNetwork = run("docker", [
    "network",
    "create",
    "--driver",
    "bridge",
    "--opt",
    "com.docker.network.bridge.host_binding_ipv4=127.0.0.1",
    localNetworkName,
  ]);

  if (createNetwork.status !== 0) {
    fail("the localhost-only Docker network could not be created.", createNetwork.stderr);
  }
}

console.log("\nStarting the private DeskOps database and login services…");
console.log("The first run downloads the local Supabase containers and can take a few minutes.\n");

const start = run(
  npxCommand,
  [
    "--no-install",
    "supabase",
    "start",
    "--workdir",
    ".",
    "--agent=no",
    "--network-id",
    localNetworkName,
    "--output",
    "json",
    "--exclude",
    excludedServices.join(","),
  ],
  { stdio: ["inherit", "pipe", "pipe"] },
);

if (start.error?.code === "ENOENT") {
  fail("the local Supabase CLI is missing. Run npm install, then try again.");
}
if (start.status !== 0) {
  fail("Supabase did not become ready.", start.stderr);
}

const status = run(npxCommand, [
  "--no-install",
  "supabase",
  "status",
  "--workdir",
  ".",
  "--agent=no",
  "--network-id",
  localNetworkName,
  "--output",
  "json",
]);

if (status.status !== 0) {
  fail("Supabase started, but its local connection details could not be read.", status.stderr);
}

let local;
try {
  local = JSON.parse(status.stdout);
} catch {
  fail("Supabase returned connection details in an unexpected format.");
}

function findValue(...wantedKeys) {
  const wanted = new Set(wantedKeys.map((key) => key.toLowerCase()));
  const pending = [local];

  while (pending.length > 0) {
    const value = pending.shift();
    if (!value || typeof value !== "object") continue;

    for (const [key, child] of Object.entries(value)) {
      if (wanted.has(key.toLowerCase()) && typeof child === "string" && child.length > 0) {
        return child;
      }
      if (child && typeof child === "object") pending.push(child);
    }
  }

  return undefined;
}

const apiUrl = findValue("API_URL", "api_url");
const anonKey = findValue("ANON_KEY", "anon_key", "PUBLISHABLE_KEY", "publishable_key");
const studioUrl = findValue("STUDIO_URL", "studio_url");
const mailUrl = findValue("INBUCKET_URL", "inbucket_url", "MAILPIT_URL", "mailpit_url");

if (!apiUrl || !anonKey) {
  fail("the local API URL or browser-safe key was missing from Supabase status.");
}

const externalAiKey = process.env.DESKOPS_SELF_HOST_OPENAI_API_KEY ?? "";
const externalAiModel = process.env.DESKOPS_SELF_HOST_OPENAI_MODEL ?? "gpt-5.6";

console.log("\nLocal services are ready:");
console.log("  DeskOps:         http://localhost:3000");
if (mailUrl) console.log(`  Login email:     ${mailUrl}`);
if (studioUrl) console.log(`  Database Studio: ${studioUrl}`);
console.log("\nUse email sign-in, then open the local login inbox to follow the magic link.");
console.log("Your app data remains in local Docker volumes and survives Ctrl+C.");
if (!externalAiKey) {
  console.log("External AI is off; the queue, streams, Wellness and simulated demo still work.\n");
} else {
  console.log(`External AI is enabled with ${externalAiModel}; draft text will be sent to OpenAI.\n`);
}

const app = spawn(npmCommand, ["--workspace", "@deskops/frontend", "run", "dev", "--", "--hostname", "127.0.0.1"], {
  cwd: projectRoot,
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    OPENAI_API_KEY: externalAiKey,
    OPENAI_MODEL: externalAiModel,
    DESKOPS_SELF_HOST: "true",
  },
  stdio: "inherit",
});

app.on("error", (error) => fail("the DeskOps development server could not start.", error.message));
app.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
