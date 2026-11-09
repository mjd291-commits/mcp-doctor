#!/usr/bin/env bash
# MCP Doctor Worker 3: safe, one-shot, read-only development bootstrap.
# Does not install services, configure credentials, or touch other projects.
set -Eeuo pipefail
umask 077

REPO_URL="https://github.com/mjd291-commits/mcp-doctor.git"
BASE="${HOME}/mcp-doctor-worker3"
SOURCE="${BASE}/source"
STATUS="${BASE}/last-bootstrap-status.txt"

for command in git node npm; do
  if ! command -v "${command}" >/dev/null 2>&1; then
    echo "Missing required command: ${command}" >&2
    exit 1
  fi
done

node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
if (( node_major < 20 )); then
  echo "Node.js 20+ required; found $(node --version)" >&2
  exit 1
fi

mkdir -p "${BASE}"
if [[ -e "${SOURCE}" && ! -d "${SOURCE}/.git" ]]; then
  echo "Refusing to alter an existing non-Git directory: ${SOURCE}" >&2
  exit 1
fi

if [[ ! -d "${SOURCE}/.git" ]]; then
  echo "Cloning public MCP Doctor repository into its isolated directory..."
  git clone --depth 1 --branch main "${REPO_URL}" "${SOURCE}"
else
  origin="$(git -C "${SOURCE}" remote get-url origin)"
  if [[ "${origin}" != "${REPO_URL}" ]]; then
    echo "Unexpected Git origin in ${SOURCE}; refusing to continue." >&2
    exit 1
  fi
  echo "Using existing MCP Doctor checkout. No pull/reset will be performed."
fi

cd "${SOURCE}"
echo "MCP Doctor revision: $(git rev-parse --short HEAD)"
echo "Node: $(node --version); npm: $(npm --version)"

# Installation hooks are disabled during bootstrap. Never invoke discovered MCP tools.
if [[ -f package-lock.json ]]; then
  npm ci --ignore-scripts --no-audit --no-fund
else
  npm install --ignore-scripts --no-audit --no-fund --package-lock=false
fi
npm run typecheck

{
  printf 'result=local-validation-passed\n'
  printf 'checked_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'revision=%s\n' "$(git rev-parse --short HEAD)"
  printf 'node=%s\n' "$(node --version)"
  printf 'mode=manual-only-no-remote-heartbeat-no-job-dispatch\n'
} > "${STATUS}"

echo
echo "PASS: MCP Doctor local checkout and typecheck validated."
echo "Local result: ${STATUS}"
echo "This does NOT yet mean Worker 3 is an authenticated, online MCP Doctor agent."
