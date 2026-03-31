# Grammar Playground – Product Summary

## Intention
Create a playful, low-friction grammar learning tool that feels like a printed worksheet but behaves like a modern app on desktop and iPad.

## Design guidelines
- **Sentence-first layout:** words should read naturally as a sentence, not as detached chips.
- **Quiet instruction:** labels/supporting text should guide without visual noise.
- **Color consistency:** each grammar type uses one consistent color language.
- **Touch-first interactions:** all key actions must work with taps, not hover-only behavior.
- **Clear dismissal patterns:** transient UI (popover/drawer) must always be easy to close.
- **No dead controls:** every visible control should do something obvious and reliable.

## Feature boundaries
### Keep
- Sentence analysis canvas with connectors and POS labels.
- Word popover with child-friendly grammar explanation.
- Practice studio activities.
- Progress dashboard.
- Version badge + changelog drawer.

### Avoid
- Large framework rewrites.
- Major UX redesigns that break worksheet identity.
- Adding features that increase complexity before interaction reliability is solid.

## Quality checklist for future changes
1. Word popover opens on click/tap and never gets stranded.
2. Popover closes on outside click/tap and Escape.
3. Changelog drawer opens/closes predictably.
4. Sentence drag/drop remains functional after rerenders.
5. Practice interactions work with mouse and touch.
6. Version in UI matches `VERSION` file.
7. iPad landscape layout remains readable and uncluttered.

## Release hygiene
- Increment `VERSION` for every shipped update.
- Add a dated entry at top of `version-history.md`.
- Archive previous release under `versions/<previous-version>/`.
