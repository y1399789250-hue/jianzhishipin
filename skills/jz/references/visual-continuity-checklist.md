# Visual Continuity Checklist

Use this checklist for every `$jz` project with recurring characters or objects.

## Character Lock

- [ ] `src/continuity-manifest.json` exists.
- [ ] The protagonist or continuity target was selected from the current title, brief, and script, not copied from a previous episode.
- [ ] Every recurring character, object, product, mascot, or visual metaphor has a canonical `referenceAsset` when it appears in multiple scenes.
- [ ] Locked traits include script-defined identity, face/object style, palette, shape, clothing or surface details, and story state.
- [ ] Allowed and forbidden changes are explicit.

## Asset Generation

- [ ] Character sheet or canonical reference was accepted before scene poses were generated.
- [ ] Background plates do not contain the main character unless explicitly marked as a non-moving printed/photo element.
- [ ] Pose prompts reuse the same locked traits and reference asset.
- [ ] Metaphor scenes are labeled as metaphors and not treated as the same physical character.

## Scene QA

- [ ] Every scene using a recurring character matches the canonical reference.
- [ ] Hair, outfit, body shape, face style, and color palette stay consistent unless intentionally changed.
- [ ] No character is cropped, duplicated, fused into the background, or hidden behind captions/source cards.
- [ ] No scene has both a background-baked character and a foreground character layer.
- [ ] Extracted frames or contact sheets were reviewed before final handoff.

## Validation

- [ ] `npm run validate:continuity` passes.
- [ ] `npm run validate:production` passes after real assets and audio are present.
- [ ] QA report lists accepted continuity exceptions, if any.
