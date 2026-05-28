# Release Workflow (MANDATORY — enforced every deploy)

**NEVER run `vercel --prod` directly.**  
**ALWAYS deploy via the release script:**

```bash
pnpm release patch    # bug fix, copy/style change
pnpm release minor    # new feature, new page, new integration
pnpm release major    # breaking change, DB migration, full redesign
```

The script does everything automatically:
1. Validates `CHANGELOG.md` has `[Unreleased]` content (aborts if empty)
2. Computes new `MAJOR.MINOR.PATCH-beta.N` version
3. Bumps `package.json` version
4. Moves `[Unreleased]` entries → new dated version block in `CHANGELOG.md`
5. Runs `pnpm build` (aborts deploy if it fails)
6. Runs `vercel --prod`
7. Prints smoke test checklist

## Before every release

Add what changed under `## [Unreleased]` in `CHANGELOG.md` first.  
Use the standard Keep a Changelog subsections: `### Added`, `### Changed`, `### Fixed`, `### Removed`.  
If `[Unreleased]` is empty, the release script will abort.

## After every release

Once `pnpm release` finishes and the smoke test passes:

```bash
git add package.json CHANGELOG.md
git commit -m "release: v<new-version>"
git tag v<new-version>
```

## Version bump guide

| What changed | Command |
|---|---|
| Bug fix, wording, style tweak | `pnpm release patch` |
| New feature, new page, new filter | `pnpm release minor` |
| Breaking DB change, full redesign | `pnpm release major` |

---

@AGENTS.md
