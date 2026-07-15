# Source Acceptance Checklist

Use this checklist for every `$jz` project before final handoff.

## Research

- [ ] Every factual claim that needs support has a credible source URL.
- [ ] Medical, pregnancy, child, legal, finance, public-policy, data, and debunking claims use current source checks.
- [ ] Sources are official, primary, peer-reviewed, or institutionally accountable where possible.
- [ ] Weak sources such as social posts, anonymous summaries, SEO pages, or copied aggregators were avoided or clearly excluded.

## Screenshots

- [ ] Source screenshots are cropped to the necessary evidence area only.
- [ ] Screenshot crops do not reproduce a full article or long copyrighted passage.
- [ ] Source screenshots are saved under `public/assets/source-shots/`.
- [ ] Crops are readable at final video resolution.

## Manifest

- [ ] `src/source-manifest.json` exists.
- [ ] Every manifest item has `id`, `sceneId`, `asset`, `sourceName`, `url`, `accessedAt`, and `claim`.
- [ ] Every `sceneId` matches `src/script.json`.
- [ ] Every manifest `asset` is inserted as a layer in `src/script.json`.
- [ ] Every source card shown in video has a manifest item.

## Layout

- [ ] Source cards stay inside the safe frame.
- [ ] Source cards do not cover captions, faces, hands, or key props.
- [ ] Source cards support the narration and do not become full-page website screenshots.
- [ ] Extracted frames show source cards aligned and uncropped.

## Validation

- [ ] `npm run validate:sources` passes.
- [ ] `npm run validate:sources:strict` passes after real assets and audio are present.
- [ ] Final QA report includes source URLs, access dates, screenshot asset paths, and the claim each source supports.
