# Source Screenshot Workflow

Use this reference whenever `$jz` is invoked. Source-backed video is the default workflow.

## Source Selection

1. Extract factual claims before finalizing narration.
2. Prefer primary or accountable sources:
   - government and public-health agencies
   - official professional guidance
   - peer-reviewed papers or publisher pages
   - original datasets, standards, or named organization pages
3. Avoid using social posts, SEO articles, anonymous summaries, or content farms as evidence screenshots.
4. For medical, pregnancy, child, legal, finance, or public-policy claims, browse current sources instead of relying on memory.

## Screenshot Rules

1. Screenshot only the necessary evidence area: title, recommendation snippet, table row, chart, or source identity.
2. Do not screenshot a full article page or long copyrighted passage when a small crop is enough.
3. Save cropped source cards under:

```text
public/assets/source-shots/
```

4. Use clear file names:

```text
assets/source-shots/nih-dha-pregnancy-fetal-brain.png
assets/source-shots/fda-epa-low-mercury-fish-advice.png
```

5. Source-card layers go into `src/script.json` as normal `decor` layers. Keep them inside the safe frame, readable, and away from captions.

## Source Manifest

Create `src/source-manifest.json` for every source-backed project:

```json
{
  "generatedAt": "2026-07-15",
  "items": [
    {
      "id": "nih-dha-pregnancy",
      "sceneId": "scene-02",
      "asset": "assets/source-shots/nih-dha-pregnancy-fetal-brain.png",
      "sourceName": "NIH Office of Dietary Supplements",
      "url": "https://ods.od.nih.gov/factsheets/Pregnancy-HealthProfessional/",
      "accessedAt": "2026-07-15",
      "claim": "DHA is important for fetal brain and eye development.",
      "usage": "Small evidence card shown while explaining why DHA matters."
    }
  ]
}
```

Rules:

- `sceneId` must match a scene in `src/script.json`.
- `asset` must point under `public/`.
- Every manifest asset should appear as a layer in `src/script.json`.
- Every source card shown in video should have a manifest item.
- Include source URLs in the final handoff and QA report.

## Layout Rules

1. Treat source cards as paper objects: add a subtle paper edge, shadow, and small rotation if the project style supports it.
2. Keep source cards secondary to the main visual. They support the narration; they should not become a full-screen web page.
3. Avoid placing source cards over subtitles or character faces/hands.
4. On strict QA, source cards must stay inside the safe frame and remain legible in extracted frames.

## Validation

Run these commands after source screenshots are added:

```powershell
npm run validate:sources
npm run validate:sources:strict
```

Run final media checks after rendering:

```powershell
npm run probe
npm run frame:check
```
