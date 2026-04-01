## 1.3.10 - 2026-03-31
- Improved word-popover placement logic so it never overlaps the sentence and stays on-screen by using available viewport space above/below the sentence region.
- Added dynamic popover height clamping with internal scroll fallback when space is tight.
- Added touch drag fallback for token reordering on iPad/Chrome via touch gesture handling and drop target detection.
- Archived `1.3.9` under `versions/1.3.9/`.
- Bumped runtime/app version metadata to `1.3.10`.

## 1.3.9 - 2026-03-31
- Refined word popover placement so it never overlaps the sentence line: desktop positioning now forces the panel fully above or fully below the sentence region.
- Upgraded popover visuals with gradient card styling, stronger border/shadow, improved close button, and structured field rows for readability.
- Added popover measuring mode for accurate dynamic height placement.
- Archived `1.3.8` under `versions/1.3.8/`.
- Bumped runtime/app version metadata to `1.3.9`.

## 1.3.8 - 2026-03-31
- Follow-up release after review feedback on `1.3.7`.
- Added one-time token-line container listener binding and kept token-level listener rebinding per render.
- Switched practice sorting to stable token IDs for accurate handling of repeated words.
- Archived `1.3.7` under `versions/1.3.7/`.
- Bumped runtime/app version metadata to `1.3.8`.

## 1.3.7 - 2026-03-31
- Follow-up release after review feedback on `1.3.6`.
- Archived `1.3.6` under `versions/1.3.6/`.
- Bumped runtime/app version metadata to `1.3.7`.

# Version History

## 1.3.6 - 2026-03-31
- Restored archived-version history reliability by hardening `versioning.js` element guards and button bindings.
- Added missing archived `1.1.0` page snapshot so changelog links no longer dead-end.
- Added smoke tests for archived version modal open/close and `1.1.0` availability.
- Archived `1.3.5` under `versions/1.3.5/`.

## 1.3.5 - 2026-03-31
- Fixed popover placement so the word detail panel prefers appearing above the tapped word instead of covering it.
- Hardened rebuild/sort placement state updates with shared helpers for tap and drop paths.
- Added stronger drop-target guards and drag payload fallback handling in practice interactions.
- Extended smoke coverage docs and kept desktop drag as a documented non-blocking check in CI.
- Archived `1.3.4` under `versions/1.3.4/`.

## 1.3.4 - 2026-03-31
- Added Playwright smoke tests for core app interactions (load/sample, glossary toggle, popover, drawer, rebuild, sort).
- Added dual test projects for desktop interaction and touch-style fallback paths.
- Added GitHub Actions workflow to run smoke tests on pushes to `main` and pull requests.
- Added README QA checklist and local Playwright run instructions.
- Archived `1.3.3` under `versions/1.3.3/`.

## 1.3.3 - 2026-03-31
- Repair-first stability pass: refactored practice interactions to be state-driven with delegated listeners.
- Fixed glossary collapse toggle consistency and kept it predictable across repeated analyses.
- Improved popover/drawer guard behaviour to avoid stuck UI after repeated interactions.
- Reworked practice tasks with explicit check/reset controls and reliable response feedback.
- Shifted touch-first interactions away from native drag as the primary path (tap-select/tap-place), while keeping desktop drag support.
- Archived `1.3.2` under `versions/1.3.2/`.

## 1.3.2 - 2026-03-31
- Fixed Practice Studio drag/drop reliability and added clearer drag behavior wiring.
- Removed fixed word-detail card from layout and kept contextual popover-only word guidance.
- Added collapsible grammar glossary panel.
- Enabled sentence token drag/drop reordering directly in the analysis canvas.
- Updated worksheet title and simplified status copy.
- Added product docs (`README.md`, `APP_SUMMARY.md`) for intention, scope, and design guardrails.
- Archived `1.3.1` under `versions/1.3.1/`.

## 1.3.1 - 2026-03-31
- Polished worksheet interactions for production-readiness: robust popover open/close state, Escape handling, and outside-click/tap dismissal.
- Improved sentence analysis spacing, focus styles, and touch/keyboard interaction consistency for desktop + iPad layouts.
- Upgraded changelog drawer behaviour with cleaner close interactions and improved timeline scan readability.
- Synced visible UI badge version with `VERSION` source file at runtime.
- Archived `1.3.0` under `versions/1.3.0/`.

## 1.3.0 - 2026-03-31
- Reimagined Grammar Playground as a playful worksheet-style learning experience with natural colorful sentence analysis.
- Added richer child-friendly word detail card with role, phrase membership, confusion notes, and extra examples.
- Added full built-in glossary with simple definitions, spotting tips, mistakes, and linked terms.
- Added five interactive practice modes: rebuild sentence, sort by grammar type, fix mistakes, identify phrases, and adjective-vs-adverb compare.
- Added fast visual progress dashboard with confidence, confusions, recent progress, and next recommendation.
- Added calm educational micro-animations for connector draw-in and interaction feedback.
- Archived `1.2.1` under `versions/1.2.1/`.

## 1.2.1 - 2026-03-31
- Refined analysis canvas presentation to a lighter, calmer educational board.
- Removed top grammar labels and standardized labels below words only.
- Added robust token interaction for desktop hover + iPad/touch tap.
- Added rich per-word detail popover/bottom-sheet with role, explanation, phrase membership, alternative uses, and extra example.
- Kept connector lines behind tokens with cleaner auto-positioning and no floating top labels.
- Archived `1.2.0` under `versions/1.2.0/`.

## 1.2.0 - 2026-03-31
- Refactored app into a production-ready iPad-first structure with exactly 5 sections: app bar, sentence input card, analysis canvas card, single-word checker card, and version-history drawer.
- Rebuilt UI architecture with a clean design system (soft background, white cards, consistent spacing/radius/shadow, restrained accent colors).
- Simplified controls to a primary analyze action + secondary sample action and moved compact settings into a subtle icon-driven side drawer.
- Rebuilt analysis canvas as a diagram board with separated label/token layers and connector SVG lines behind tokens to avoid collisions.
- Redesigned version history into a polished right-side timeline drawer with version, date, summary, and direct navigation.
- Archived `1.1.9` under `versions/1.1.9/`.

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
