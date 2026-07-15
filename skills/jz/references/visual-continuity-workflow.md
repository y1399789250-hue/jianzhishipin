# Visual Continuity Workflow

Use this reference whenever `$jz` includes recurring characters, recurring props, or a branded visual identity. This prevents character drift and visual punch-through across scenes.

## Root Causes To Prevent

1. Do not ask Imagegen to independently invent the same character in every scene.
2. Do not place main characters inside background plates when they need to move or recur.
3. Do not switch style systems mid-video, such as realistic paper-cut in one scene and abstract icon collage in the next, unless the shot plan explicitly marks it as a visual metaphor.
4. Do not accept a new scene image when the character hair, clothing, body shape, palette, face style, or script-defined state changes unintentionally.

## Protagonist Selection

Determine the protagonist from the current title, brief, and script before any image generation:

1. If the script names a person or group, make that person or group the protagonist.
2. If the script is about a product, food, place, document, data point, or concept, the protagonist can be that object or a visual metaphor instead of a human.
3. If there is no recurring protagonist, write `"continuityTarget": "recurring objects and style only"` in the continuity plan and do not create an invented human lead.
4. Do not reuse the protagonist from a previous episode. A pregnant mother, doctor, child, office worker, or elderly person appears only when the current script calls for it.
5. If the protagonist changes identity or life stage, require an explicit narration reason such as time passing, comparison, or a clearly labeled metaphor.

## Continuity Manifest

Create `src/continuity-manifest.json` before generating character assets:

```json
{
  "generatedAt": "2026-07-15",
  "characters": [
    {
      "id": "primary-protagonist",
      "displayName": "Primary protagonist determined from script",
      "referenceAsset": "assets/characters/primary-protagonist-reference.png",
      "lockedTraits": [
        "script-defined hair or silhouette",
        "script-defined clothing or object shape",
        "script-defined palette",
        "script-defined body, product, or object state",
        "same paper-cut face or object style"
      ],
      "allowedChanges": [
        "arm pose",
        "head turn",
        "small facial expression change"
      ],
      "forbiddenChanges": [
        "different identity",
        "different outfit or object color",
        "different life stage or product state unless narration says time has passed",
        "unlabeled switch to an unrelated abstract figure"
      ],
      "scenes": ["scene-01", "scene-02"]
    }
  ],
  "sceneContinuity": [
    {
      "sceneId": "scene-01",
      "characterId": "primary-protagonist",
      "expectedLayerIds": ["primary-protagonist-wide"],
      "continuityNote": "Establish the canonical protagonist selected from this script."
    }
  ]
}
```

## Asset Generation Rules

1. Generate a canonical character sheet first, then derive scene poses from it.
2. Keep background prompts character-free: "empty clinic desk", "paper collage room", "no people, no hands, no faces".
3. For every pose prompt, restate the locked traits exactly and include the reference asset when image generation supports image references.
4. If a later scene is a metaphor, label it in the shot plan and avoid presenting it as the same physical person.
5. If the character or object changes life stage, clothing, product state, or action state, require narration and shot-plan justification.

## Scene Acceptance Gate

Before inserting a generated scene/pose:

1. Compare it against the canonical reference and previous accepted scenes.
2. Reject if hair color, outfit, body shape, product state, story state, face/object style, or palette changed unintentionally.
3. Reject if the character is cropped, fused into the background, duplicated, missing hands, or buried behind source cards/captions.
4. Reject if the character is present in both the background plate and a foreground layer.
5. Save accepted reference frames or contact sheets in the project QA folder.

## Fix Strategy

If drift appears:

1. Do not patch around it with layout tweaks.
2. Regenerate the offending pose from the canonical character sheet.
3. If regeneration still drifts, use the previous accepted character cutout and animate it differently.
4. Update `src/continuity-manifest.json` only for intentional changes.
