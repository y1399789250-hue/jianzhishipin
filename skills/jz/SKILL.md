---
name: jz
description: Create source-backed layered paper-cut and collage animation videos with Codex, web research, evidence screenshots, Imagegen, Python cutout scripts, F5-TTS, Remotion, and FFmpeg. Use when the user asks $jz or asks to make, plan, scaffold, or iterate on paper-cut style videos that should search credible sources, capture/crop source screenshots, insert source cards as paper layers, and record source URLs in QA.
---

# JZ Paper Cut Video

Use this skill to turn a title, topic, or script into a source-backed layered paper-cut animation workflow and, when appropriate, a runnable Remotion episode project.

Treat source-backed mode as the default and only JZ workflow. `$jz` and `$jz --with-sources` mean the same thing: research credible sources, capture necessary evidence screenshots, insert them as paper-card layers, and record source metadata. Do not offer a plain no-source mode unless the user explicitly asks to disable sources.

## Resource Map

- Read `references/workflow.md` when planning a new video, converting a script into shots, or deciding stage order.
- Read `references/source-screenshot-workflow.md` before researching sources, taking screenshots, cropping source cards, or inserting source evidence layers.
- Read `references/data-contract.md` before creating or editing `src/script.json`.
- Read `references/acceptance-checklist.md` before final review, render verification, or handoff.
- Read `references/source-acceptance-checklist.md` before final review, render verification, or handoff for source-backed projects.
- Copy `assets/project-template/` when creating a new episode project.
- Run `scripts/new_episode.ps1` to scaffold an episode from the bundled Remotion template.

## Operating Rules

1. Start with the brief, script, target duration, aspect ratio, and intended style. If the user provides only an idea, draft a compact brief and proceed with reasonable assumptions.
2. Identify factual claims before writing final narration. For medical, pregnancy, child, legal, finance, public policy, data, or debunking topics, search current credible sources before treating claims as settled.
3. Prefer official, primary, or institutionally accountable sources for screenshots. Examples: government agencies, clinical/public-health bodies, standards bodies, peer-reviewed papers, original datasets, or the named organization itself.
4. Do not generate character or background assets before the shot plan, source plan, and asset list exist.
5. Keep `src/script.json` as the single source of truth for scenes, layers, captions, audio paths, and timing. Keep source metadata in `src/source-manifest.json`.
6. Split every scene into background, rear, primary subject, source-card, foreground, captions, and audio when a factual claim needs visual evidence. Avoid single flattened images for animated scenes.
7. Place moving characters and key props as independent transparent PNG layers under `public/assets/layers/`. Place cropped evidence screenshots under `public/assets/source-shots/`.
8. First build static layout in Remotion, then add motion. Do not tune animation before the scene composition and source cards are readable.
9. Validate after structural edits with `npm run validate:sources`; use `npm run validate:sources:strict` only after real assets and audio files are present.
10. For rendered work, verify with `npm run probe` and extracted frames, not only the final video playback.

## New Episode Workflow

When the user wants an actual project:

```powershell
powershell -ExecutionPolicy Bypass -File <skill-dir>\scripts\new_episode.ps1 -Name <episode-slug> -Destination <workspace>
cd <workspace>\episodes\<episode-slug>
npm install
npm run validate:sources
```

Use a short lowercase slug such as `dha-pregnancy-001`. If the user does not specify a destination, use the current workspace.

## Execution Sequence

1. Create or refine the brief.
2. Draft a claim table: claim, risk level, preferred source type, search query, candidate source, screenshot need.
3. Search and inspect credible sources. Capture only necessary local screenshots or cropped source cards. Save them under `public/assets/source-shots/`.
4. Produce `src/source-manifest.json` with source URL, source name, access date, claim, scene id, and screenshot asset path.
5. Produce a shot table: `scene_id`, `durationSec`, narration, main subject, source card, supporting subjects, background, foreground, transition.
6. Produce an asset list for backgrounds, character sheets, source screenshots, props, audio, music, and SFX.
7. Update `src/script.json` according to `references/data-contract.md`. Insert source screenshot cards as `decor` layers.
8. Generate or request background plates and character sheets. Use image generation only for bitmap assets; keep prompts specific about full-body characters, clean backgrounds, and no text/watermarks.
9. Split character sheets with the episode script:

```powershell
python .\scripts\split_sheet.py .\public\assets\source\sheet.png .\public\assets\layers scene 6
```

10. Run `npm run validate:sources`, preview with `npm run start`, adjust layout and timing, then render.
11. Run `npm run validate:sources:strict`, `npm run probe`, and QA using `references/acceptance-checklist.md` plus `references/source-acceptance-checklist.md`.

## Output Contract

When finishing a task, report:

- Episode path.
- Updated files.
- Source manifest path, source screenshot files, and source URLs used.
- Commands run and whether they passed.
- Missing assets, if placeholders remain.
- Preview or render status.
- Next required human input, such as approving the shot plan or providing reference audio.
