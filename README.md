# Grammar Playground

Grammar Playground is a framework-free, browser-based grammar learning app designed for children and struggling learners.

## What it is
- A colorful worksheet-style sentence analyzer.
- Click/tap any word to see a friendly explanation.
- Practice studio with rebuild/sort/fix/phrase/compare activities.
- Version badge + changelog drawer so releases are easy to browse.

## Core experience
1. Type or load a sentence.
2. Analyze it into interactive grammar words.
3. Tap words for plain-English help.
4. Reorder words in the sentence canvas by drag/drop.
5. Use practice tabs to reinforce understanding.

## Interaction notes
- Word detail appears as a floating popover (or bottom sheet on smaller layouts).
- Popovers and drawer close via close button, outside click/tap, or Escape.
- Practice drag/drop supports both mouse drag and touch-friendly tap fallback.

## Project files
- `index.html` – app structure and UI regions.
- `style.css` – visual design system and responsive behavior.
- `script.js` – analysis logic, interactions, and UI state.
- `VERSION` – canonical app version.
- `version-history.md` – changelog source.
- `versions/` – archived release snapshots.

## Local run
Open `index.html` in a browser (or use any static server).

## QA smoke tests (Playwright)
- Install deps: `npm install`
- Run tests: `npm run test:e2e`

### Checklist covered automatically
- App loads and sample sentence is present.
- Glossary Show/Hide toggles correctly.
- Word popover opens and closes correctly.
- Version badge opens/closes changelog drawer.
- Rebuild exercise place/check/reset works.
- Sort exercise tap-place/check/reset works.
- Optional desktop drag path check (non-blocking in CI).
