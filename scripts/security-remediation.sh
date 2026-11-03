#!/usr/bin/env bash
set -Eeuo pipefail

MODE="${1:-audit}"
OWNER="${GITHUB_OWNER:-jsuazof}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKDIR="$(mktemp -d "${TMPDIR:-/tmp}/security-remediation.XXXXXX")"
REPORT="$ROOT_DIR/security-audit-report.txt"

cleanup() {
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 2
  }
}

require_command gh
require_command git
require_command jq
require_command rg

case "$MODE" in
  audit|fix|prs|all) ;;
  *)
    echo "Usage: scripts/security-remediation.sh [audit|fix|prs|all]" >&2
    echo "Default is read-only audit. 'fix' and 'all' require --apply." >&2
    exit 2
    ;;
esac

AUDIT_ONLY=false
APPLY=false
for arg in "${@:2}"; do
  case "$arg" in
    --apply) APPLY=true ;;
    --audit-only) AUDIT_ONLY=true ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

if [[ "$MODE" == "fix" || "$MODE" == "prs" || "$MODE" == "all" ]] && [[ "$APPLY" != "true" ]]; then
  echo "Refusing to modify repositories without --apply." >&2
  exit 2
fi

AUDIT() {
  echo "Security audit for public repositories owned by $OWNER"
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo

  local repos_file="$WORKDIR/repos.tsv"
  gh repo list "$OWNER" --limit 100 --json name,isPrivate,isArchived,pushedAt,defaultBranchRef \
    | jq -r '.[] | select(.isPrivate == false) | [.name,.isArchived,(.pushedAt // "<none>"),(.defaultBranchRef.name // "<none>")] | @tsv' > "$repos_file"

  echo "PUBLIC_REPOSITORIES=$(wc -l < "$repos_file")"
  echo "REPOSITORIES_WITHOUT_ENV_IGNORE:"
  while IFS=$'\t' read -r repo archived pushed branch; do
    [[ -n "$repo" ]] || continue
    [[ "$repo" =~ ^[A-Za-z0-9_.-]+$ ]] || continue
    local dir="$WORKDIR/$repo"
    if ! git clone --quiet --depth 1 "https://github.com/$OWNER/$repo.git" "$dir" 2>/dev/null; then
      echo "  $repo (clone failed)"
      continue
    fi

    if [[ ! -f "$dir/.gitignore" ]] || ! rg -q '^\.env\*?$|^\.env' "$dir/.gitignore" 2>/dev/null; then
      echo "  $repo"
    fi

    local secret_matches
    secret_matches=$(rg --hidden -l \
      -e '-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----' \
      -e 'AKIA[0-Z]{16}' \
      -e 'gh[pousr]_[A-Za-z0-9]{20,}' \
      -e 'github_pat_[A-Za-z0-9_]{20,}' \
      -e 'AIza[0-9A-Za-z_-]{35}' \
      "$dir" -g '!/.git/**' 2>/dev/null || true)
    if [[ -n "$secret_matches" ]]; then
      echo "POTENTIAL_SECRETS=$repo"
      while IFS= read -r file; do
        echo "  ${file#"$dir/"}"
      done <<< "$secret_matches"
    fi

    if find "$dir/.github/workflows" -type f \( -name '*.yml' -o -name '*.yaml' \) -print -quit 2>/dev/null | rg -q .; then
      if rg -n '^permissions:\s*(write-all|\{)|permissions:\s*$|uses:.*@latest' "$dir/.github/workflows" >/dev/null 2>&1; then
        echo "WORKFLOW_FLAGS=$repo"
      fi
    fi
  done < "$repos_file"

  echo
  echo "CRITICAL RULE: rotate any real credential before cleaning Git history."
  echo "CRITICAL RULE: never run history-rewrite operations automatically."
}

FIX_PORTFOLIO() {
  cd "$ROOT_DIR"
  git switch -c "fix/security-hardening-$(date +%Y%m%d)" 2>/dev/null || git switch "fix/security-hardening-$(date +%Y%m%d)"

  if [[ -f package.json ]] && ! rg -q '"packageManager"' package.json; then
    python3 - <<'PY'
import json
from pathlib import Path
path = Path('package.json')
data = json.loads(path.read_text())
data.setdefault('packageManager', 'pnpm@11.21.0')
path.write_text(json.dumps(data, indent=2) + '\n')
PY
  fi

  python3 - <<'PY'
from pathlib import Path
path = Path('.gitignore')
text = path.read_text() if path.exists() else ''
text = text.replace('# environment variables\n.env\n.env.production\n', '# environment variables\n.env*\n!.env.example\n')
if '# environment variables' not in text:
    text += '\n# environment variables\n.env*\n!.env.example\n'
path.write_text(text)
PY

  pnpm build
}

FIX_KNOWN_REPOSITORIES() {
  local repo dir branch
  for repo in AlkeWallet_JSP formServlet -CursosAlfaWeb; do
    dir="$WORKDIR/fix-$repo"
    if ! git clone --quiet "https://github.com/$OWNER/$repo.git" "$dir" 2>/dev/null; then
      echo "Could not clone $repo"
      continue
    fi
    cd "$dir"
    branch="fix/security-hardening-$(date +%Y%m%d)"
    git switch -c "$branch" 2>/dev/null || git switch "$branch"

    case "$repo" in
      AlkeWallet_JSP)
        python3 - <<'PY'
from pathlib import Path
for path in Path('.').rglob('DBConnection.java'):
    text = path.read_text()
    text = text.replace('private static final String password = "@Mysql2020";', 'private static final String password = System.getenv("DB_PASSWORD");')
    text = text.replace('private static final String url = "jdbc:mysql://localhost:3306/alkewallet_jsp";', 'private static final String url = System.getenv("DB_URL");')
    text = text.replace('private static final String user = "root";', 'private static final String user = System.getenv("DB_USER");')
    path.write_text(text)
PY
        cat > .gitignore <<'EOF'
.env*
!.env.example
*.class
.idea/
.vscode/
target/
EOF
        cat > .env.example <<'EOF'
DB_URL=jdbc:mysql://localhost:3306/alkewallet_jsp
DB_USER=<DATABASE_USER>
DB_PASSWORD=<ROTATED_DATABASE_PASSWORD>
EOF
        ;;
      formServlet)
        python3 - <<'PY'
from pathlib import Path
for path in Path('.').rglob('*.java'):
    text = path.read_text()
    text = text.replace('out.println("<li>Password: " + password + "</li>");', '')
    path.write_text(text)
PY
        cat > .gitignore <<'EOF'
.env*
!.env.example
*.class
.idea/
.vscode/
target/
EOF
        ;;
      -CursosAlfaWeb)
        python3 - <<'PY'
from pathlib import Path
for path in Path('.').rglob('main.js'):
    text = path.read_text()
    if 'const firebaseConfig' in text:
        start = text.find('const firebaseConfig = {')
        end = text.find('};', start)
        if start >= 0 and end >= 0:
            replacement = '''const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};'''
            text = text[:start] + replacement + text[end + 2:]
            path.write_text(text)
PY
        cat > .gitignore <<'EOF'
node_modules/
dist/
.env*
!.env.example
*.log
.DS_Store
EOF
        [[ -f .env.example ]] || cat > .env.example <<'EOF'
VITE_FIREBASE_API_KEY=<FIREBASE_API_KEY>
VITE_FIREBASE_AUTH_DOMAIN=<PROJECT_ID>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<PROJECT_ID>
VITE_FIREBASE_STORAGE_BUCKET=<PROJECT_ID>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<MESSAGING_SENDER_ID>
VITE_FIREBASE_APP_ID=<APP_ID>
EOF
        ;;
    esac

    git add -A
    if git diff --cached --quiet; then
      echo "No changes for $repo"
      continue
    fi
    git -c user.name="Jorge Suazo" -c user.email="jsuazof@gmail.com" commit -m "fix: remediate public repository security configuration"
    git push -u origin "$branch"

    gh pr create \
      --repo "$OWNER/$repo" \
      --title "fix: remediate security configuration" \
      --body $'## Summary\n- Adds environment-file protection\n- Removes confirmed insecure configuration\n\n## Required before merge\n- Rotate exposed credentials\n- Review repository rules and environment variables' \
      --base "$(git remote show origin | sed -n 's/.*HEAD branch: //p')" \
      --head "$branch" >/dev/null || true
  done
}

OPEN_PRS() {
  echo "Review open security branches and pull requests with:"
  echo "gh pr list --repo $OWNER/<repo> --state open"
}

if [[ "$MODE" == "audit" ]]; then
  AUDIT | tee "$REPORT"
  exit 0
fi

if [[ "$MODE" == "fix" || "$MODE" == "all" ]]; then
  FIX_PORTFOLIO
  FIX_KNOWN_REPOSITORIES
fi

if [[ "$MODE" == "prs" || "$MODE" == "all" ]]; then
  OPEN_PRS
fi

AUDIT | tee -a "$REPORT"
