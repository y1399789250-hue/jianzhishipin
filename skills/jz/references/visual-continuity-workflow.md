# Visual Continuity Workflow

Use this reference whenever `$jz` includes recurring characters, recurring props, or a branded visual identity. This prevents character drift and visual punch-through across scenes.

## Root Causes To Prevent

1. Do not ask Imagegen to independently invent the same character in every scene.
2. Do not place main characters inside background plates when they need to move or recur.
3. Do not switch style systems mid-video, such as realistic paper-cut in one scene and abstract icon collage in the next, unless the shot plan explicitly marks it as a visual metaphor.
4. Do not accept a new scene image when the character hair, clothing, body shape, palette, face style, or pregnancy/baby state changes unintentionally.

## Continuity Manifest

Create `src/continuity-manifest.json` before generating character assets:

```json
{
  "generatedAt": "2026-07-15",
  "characters": [
    {
      "id": "pregnant-mother",
      "displayName": "Pregnant mother",
      "referenceAsset": "assets/characters/pregnant-mother-reference.png",
      "lockedTraits": [
        "warm brown wavy shoulder-length hair",
        "teal maternity dress",
        "mint green cardigan",
        "round pregnant belly",
        "same paper-cut face style and skin tone"
      ],
      "allowedChanges": [
        "arm pose",
        "head turn",
        "small facial expression change"
      ],
      "forbiddenChanges": [
        "blue hair",
        "different outfit color",
        "switching to baby-holding mother unless narration says time has passed",
        "silhouette-only abstract figure"
      ],
      "scenes": ["scene-01", "scene-02"]
    }
  ],
  "sceneContinuity": [
    {
      "sceneId": "scene-01",
      "characterId": "pregnant-mother",
      "expectedLayerIds": ["pregnant-mother-wide"],
      "continuityNote": "Establish the canonical pregnant mother."
    }
  ]
}
```

## Asset Generation Rules

1. Generate a canonical character sheet first, then derive scene poses from it.
2. Keep background prompts character-free: "empty clinic desk", "paper collage room", "no people, no hands, no faces".
3. For every pose prompt, restate the locked traits exactly and include the reference asset when image generation supports image references.
4. If a later scene is a metaphor, label it in the shot plan and avoid presenting it as the same physical person.
5. If the character changes life stage, clothing, or action state, require narration and shot-plan justification.

## Scene Acceptance Gate

Before inserting a generated scene/pose:

1. Compare it against the canonical reference and previous accepted scenes.
2. Reject if hair color, outfit, body shape, pregnancy state, face style, or palette changed unintentionally.
3. Reject if the character is cropped, fused into the background, duplicated, missing hands, or buried behind source cards/captions.
4. Reject if the character is present in both the background plate and a foreground layer.
5. Save accepted reference frames or contact sheets in the project QA folder.

## Fix Strategy

If drift appears:

1. Do not patch around it with layout tweaks.
2. Regenerate the offending pose from the canonical character sheet.
3. If regeneration still drifts, use the previous accepted character cutout and animate it differently.
4. Update `src/continuity-manifest.json` only for intentional changes.
