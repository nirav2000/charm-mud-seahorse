# Version History

## 1.1.5 - 2026-03-31
- Improved **display settings layout** so each option renders cleanly with title + helper text.
- Added improved **curved-arrow annotation mode** with labels above words and curved pointers to each token.
- Shifted to a more playful visual style (soft gradients, glassmorphism cards, richer color tone) to avoid a sterile/blocky look.
- Updated markdown viewer to use `marked` for proper markdown rendering and made each version heading clickable.

## 1.1.4 - 2026-03-31
- Added real-time grammar tagging while users type in the sentence box.
- Added display settings: realtime on/off, color-text mode, inline labels, and curvy-arrow label row.
- Updated sentence rendering to feel more natural and less blocky by using flowing inline words with optional annotations.
- Added archived copy of `1.1.3` under `versions/1.1.3/`.

## 1.1.3 - 2026-03-31
- Refreshed the UI with card layouts, clearer controls, and improved readability.
- Added sentence input + analyze flow so users can paste/type any sentence and classify it.
- Added an always-visible color key and per-token labels to make part-of-speech output easier to understand.

## 1.1.2 - 2026-03-31
- Added direct links in the version modal so users can open any available version (not just previous/next).
- Archived and published `1.1.0` under `versions/1.1.0/` so it is accessible.
- Kept previous/next navigation and unified all version pages on the same shared `versioning.js` source.

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
