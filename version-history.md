# Version History

## 1.1.9 - 2026-03-31
- Fixed arrow/label overlap by re-anchoring labels close to their own words with shorter paths.
- Prevented far-away grammatical labels by constraining label placement near each token.
- Improved grammar key layout to compact pill chips to remove awkward empty slots.
- Archived `1.1.8` under `versions/1.1.8/`.

## 1.1.8 - 2026-03-31
- Added a **toggleable no-highlight mode** (`Highlight` off) so users can remove highlighting entirely.
- Improved label placement so labels appear directly under words (sub-label style).
- Reworked arrows and grammatical labels to appear around all sides of the sentence (top, bottom, left, right), with arrowheads and varied paths.
- Added floating hover glossary cards that appear near the hovered word.
- Replaced text title with a dedicated `logo.svg` logo and removed duplicate heading text.
- Updated key styles to remove “sample” wording and show grammatical terms with correct class colors.
- Reworked display settings into an auto-collapsing side panel with dark/on and light/off toggle buttons.
- Kept auto punctuation as a display setting and improved punctuation heuristics.
- Improved version-history markdown viewer formatting and removed top quick-link list.
- Fixed latest-version heading links to open current `index.html` rather than a missing archive directory.
- Archived `1.1.7` under `versions/1.1.7/`.

## 1.1.7 - 2026-03-31
- Fixed labels to render as true sub-labels beneath words instead of appearing beside them.
- Improved natural sentence mode so tokens flow like a real sentence without blocky spacing.
- Enhanced auto punctuation to handle capitalization, commas, full stops, question marks, exclamation marks, and simple quoted speech heuristics.
- Rebuilt curved arrows with arrowheads, varied direction/length, and less constrained layout.
- Added a simple Grammar Playground logo badge.
- Improved markdown version-history rendering (spacing, formatting) and removed the version quick-list at the top.
- Fixed version heading link behavior so clicking the latest version goes to the current app, not a missing archive path.
- Archived `1.1.6` under `versions/1.1.6/`.

## 1.1.6 - 2026-03-31
- Fixed settings card layout so toggles render cleanly and read clearly.
- Updated color key samples to match exactly the same classes used by highlighted words.
- Reworked labels to appear under words instead of inline superscript.
- Added natural sentence mode toggle for normal spacing/flow.
- Added improved curved-arrow rendering with SVG paths that sit above words and are not constrained by token boxes.
- Added hover glossary with definitions, examples, and common misconceptions.
- Added auto-punctuation capability (manual button + optional auto mode).
- Archived `1.1.5` under `versions/1.1.5/`.

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
