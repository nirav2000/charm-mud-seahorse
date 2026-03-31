# Version History

## 1.1.1 - 2026-03-31
- Added shared `versioning.js` so both current and archived pages use the same version-history modal behavior.
- Enabled version modal navigation from archived pages (e.g., `versions/1.0.0/index.html`) back to newer versions.
- Kept `version-history.md` as the single source of version history and improved markdown rendering robustness.

## 1.1.0 - 2026-03-31
- Added semantic versioning files (`VERSION` and this shared `version-history.md`).
- Added a footer version badge that opens a modal with rendered markdown history.
- Added previous/next version controls and click-to-switch behavior.
- Archived the original app as version `1.0.0` under `versions/1.0.0/`.

## 1.0.0 - 2026-03-31
- Original Grammar Highlighter baseline app.
