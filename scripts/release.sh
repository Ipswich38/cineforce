#!/usr/bin/env bash
# scripts/release.sh — CineVerse release workflow
#
# Usage:
#   pnpm release patch    bug fix, copy change, style tweak
#   pnpm release minor    new feature, new page, new integration
#   pnpm release major    breaking change, DB migration, full redesign
#
# What it does (in order):
#   1. Validates [Unreleased] section in CHANGELOG.md has content
#   2. Computes new semver  (MAJOR.MINOR.PATCH-beta.1)
#   3. Bumps version in package.json
#   4. Moves [Unreleased] entries → new dated version block in CHANGELOG.md
#   5. Runs pnpm build  (aborts on failure — nothing is deployed)
#   6. Runs vercel --prod
#   7. Prints smoke test checklist
#
# After the script finishes:
#   - Run the smoke test (docs/04_TESTING.md)
#   - Then: git add package.json CHANGELOG.md && git commit -m "release: vX.Y.Z-beta.N"

set -euo pipefail

BUMP=${1:-patch}
DATE=$(date +%Y-%m-%d)

echo ""
echo "══════════════════════════════════════════"
echo "  CineVerse — Release ($BUMP)"
echo "══════════════════════════════════════════"

# ── Step 1: Compute new version ──────────────────────────────────────────────

CURRENT=$(node -p "require('./package.json').version")

# Strip -beta.N suffix to get bare semver
BASE=$(echo "$CURRENT" | sed 's/-beta\.[0-9]*//')
IFS='.' read -r MAJOR MINOR PATCH <<< "$BASE"

case "$BUMP" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
  *)
    echo ""
    echo "  ERROR: Unknown bump type '$BUMP'"
    echo "  Usage: pnpm release [patch|minor|major]"
    exit 1
    ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}-beta.1"
echo ""
echo "  Current:  $CURRENT"
echo "  New:      $NEW_VERSION  ($BUMP bump)"

# ── Step 2: Validate CHANGELOG [Unreleased] has content ─────────────────────

echo ""
echo "── Checking CHANGELOG.md ──────────────────────────────────"

VALIDATE_JS=$(mktemp /tmp/ync-validate.XXXXXX.js)
cat > "$VALIDATE_JS" << 'JSEOF'
const fs = require('fs');
const cl = fs.readFileSync('CHANGELOG.md', 'utf8');
const m = cl.match(/## \[Unreleased\]([\s\S]*?)\n---/);
if (!m) {
  console.error('  ERROR: Could not find [Unreleased] section in CHANGELOG.md');
  process.exit(1);
}
const body = m[1]
  .replace(/>\s*Work in progress[^\n]*/g, '')
  .trim();
if (!body) {
  console.error('  ERROR: [Unreleased] section is empty.');
  console.error('  Add your changes under ## [Unreleased] in CHANGELOG.md before releasing.');
  process.exit(1);
}
console.log('  [Unreleased] has content — OK');
JSEOF
node "$VALIDATE_JS"
rm "$VALIDATE_JS"

# ── Step 3: Bump package.json ────────────────────────────────────────────────

echo ""
echo "── Updating package.json ──────────────────────────────────"

node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.version = '$NEW_VERSION';
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
console.log('  version: $CURRENT → $NEW_VERSION');
"

# ── Step 4: Update CHANGELOG.md ─────────────────────────────────────────────

echo ""
echo "── Updating CHANGELOG.md ──────────────────────────────────"

CHANGELOG_JS=$(mktemp /tmp/ync-changelog.XXXXXX.js)
cat > "$CHANGELOG_JS" << JSEOF
const fs = require('fs');
const cl = fs.readFileSync('CHANGELOG.md', 'utf8');
const ver  = '${NEW_VERSION}';
const date = '${DATE}';

const m = cl.match(/## \[Unreleased\]([\s\S]*?)\n---/);
if (!m) { console.error('No [Unreleased] section'); process.exit(1); }

// Extract actual changes (strip boilerplate placeholder line)
const body = m[1]
  .replace(/>\s*Work in progress[^\n]*\n?/g, '')
  .trim();

const freshUnreleased =
  '## [Unreleased]\n\n' +
  '> Work in progress — not yet tagged.\n\n' +
  '---';

const newEntry =
  '## [' + ver + '] — ' + date +
  (body ? '\n\n' + body : '');

const updated = cl.replace(
  /## \[Unreleased\][\s\S]*?\n---/,
  freshUnreleased + '\n\n' + newEntry + '\n\n---'
);

fs.writeFileSync('CHANGELOG.md', updated);
console.log('  [Unreleased] → [' + ver + '] ' + date);
JSEOF
node "$CHANGELOG_JS"
rm "$CHANGELOG_JS"

# ── Step 5: Build ────────────────────────────────────────────────────────────

echo ""
echo "── Building ────────────────────────────────────────────────"
echo ""
pnpm build

# ── Step 6: Deploy ───────────────────────────────────────────────────────────

echo ""
echo "── Deploying v$NEW_VERSION ─────────────────────────────────"
echo ""
vercel --prod

# ── Step 7: Post-deploy checklist ───────────────────────────────────────────

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  v$NEW_VERSION → https://cineverse.vercel.app"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "Smoke test — run docs/04_TESTING.md, minimum:"
echo ""
echo "  [ ] Homepage loads; role suggestions dropdown works"
echo "  [ ] /search — 0 crew or real results; no Sample badge"
echo "  [ ] /crew/<slug> — profile renders; unknown slug → 404"
echo "  [ ] /auth — Google button + email OTP form present"
echo "  [ ] Auth flow — Google OAuth redirects to cineverse.vercel.app"
echo "  [ ] Mobile — viewport fits on 375px width"
echo ""
echo "After smoke test passes, commit and tag:"
echo ""
echo "  git add package.json CHANGELOG.md"
echo "  git commit -m \"release: v$NEW_VERSION\""
echo "  git tag v$NEW_VERSION"
echo ""
