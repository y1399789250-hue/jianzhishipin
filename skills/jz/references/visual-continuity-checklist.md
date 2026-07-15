# Visual Continuity Checklist

Use this checklist for every `$jz` project with recurring characters or objects.

## Character Lock

- [ ] `src/continuity-manifest.json` exists.
- [ ] Every recurring character has a canonical `referenceAsset`.
- [ ] Locked traits include hair, face style, skin tone, clothing, palette, body shape, and state such as pregnant/not pregnant.
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
