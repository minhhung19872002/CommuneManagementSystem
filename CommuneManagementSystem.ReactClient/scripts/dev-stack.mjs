import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const clientDir = process.cwd();
const rootDir = path.resolve(clientDir, '..');
const apiDir = path.join(rootDir, 'CommuneManagementSystem.API');
const frontendPort = process.env.DEV_FRONTEND_PORT ?? '5178';
const frontendUrl = process.env.DEV_FRONTEND_READY_URL ?? `http://127.0.0.1:${frontendPort}/login`;
const apiBindUrl = process.env.DEV_API_BIND_URL ?? 'http://127.0.0.1:5068';
const apiReadyUrl = process.env.DEV_API_READY_URL ?? `${apiBindUrl}/openapi/v1.json`;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [];
let shuttingDown = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function isUrlReady(url) {
  try {
    const response = await fetch(url, { redirect: 'manual' });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForUrl(url, label, timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await isUrlReady(url)) {
      console.log(`[dev] ${label} ready: ${url}`);
      return;
    }

    await sleep(1_000);
  }

  throw new Error(`[dev] Timed out waiting for ${label}: ${url}`);
}

function spawnManaged(command, args, cwd, label, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  child.on('exit', code => {
    if (!shuttingDown && code !== 0) {
      console.error(`[dev] ${label} exited unexpectedly with code ${code ?? 'null'}.`);
      void shutdown(1);
    }
  });

  children.push(child);
  console.log(`[dev] Started ${label} (pid: ${child.pid ?? 'unknown'}).`);
}

async function terminateChild(child) {
  if (!child.pid || child.exitCode !== null) {
    return;
  }

  if (process.platform === 'win32') {
    await new Promise(resolve => {
      const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
      });

      killer.on('exit', () => resolve());
      killer.on('error', () => resolve());
    });

    return;
  }

  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    return;
  }

  await sleep(1_000);

  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {
    // Ignore missing process groups.
  }
}

async function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  await Promise.all(children.reverse().map(terminateChild));
  process.exit(code);
}

async function ensureStack() {
  const apiReady = await isUrlReady(apiReadyUrl);
  const frontendReady = await isUrlReady(frontendUrl);

  if (!apiReady) {
    spawnManaged('dotnet', ['run', '--urls', apiBindUrl], apiDir, 'backend');
  } else {
    console.log(`[dev] Reusing backend at ${apiReadyUrl}.`);
  }

  if (!frontendReady) {
    spawnManaged(
      npmCommand,
      ['run', 'dev:frontend', '--', '--host', '127.0.0.1', '--port', frontendPort],
      clientDir,
      'frontend',
      { BROWSER: 'none' },
    );
  } else {
    console.log(`[dev] Reusing frontend at ${frontendUrl}.`);
  }

  await waitForUrl(apiReadyUrl, 'backend');
  await waitForUrl(frontendUrl, 'frontend');
  console.log('[dev] Stack is ready.');
}

async function main() {
  process.on('SIGINT', () => { void shutdown(0); });
  process.on('SIGTERM', () => { void shutdown(0); });

  await ensureStack();
  await new Promise(() => {
    // Keep the process alive until the user stops it.
  });
}

main().catch(async error => {
  console.error(error instanceof Error ? error.message : error);
  await shutdown(1);
});
