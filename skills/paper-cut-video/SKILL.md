---
name: paper-cut-video
description: Create reusable layered paper-cut and collage animation video workflows with Codex, Imagegen, Python cutout scripts, F5-TTS, Remotion, and FFmpeg. Use when the user asks to make, plan, scaffold, or iterate on paper-cut style videos, layered character animations, Codex + Remotion video pipelines, script-to-shot plans, character-sheet splitting, Remotion scene projects, or repeatable local video production workflows.
---

# Paper Cut Video

Use this skill to turn a topic or script into a repeatable layered paper-cut animation workflow and, when appropriate, a runnable Remotion episode project.

## Resource Map

- Read `references/workflow.md` when planning a new video, converting a script into shots, or deciding stage order.
- Read `references/data-contract.md` before creating or editing `src/script.json`.
- Read `references/acceptance-checklist.md` before final review, render verification, or handoff.
- Copy `assets/project-template/` when creating a new episode project.
- Run `scripts/new_episode.ps1` to scaffold an episode from the bundled Remotion template.

## Operating Rules

1. Start with the brief, script, target duration, aspect ratio, and intended style. If the user provides only an idea, draft a compact brief and proceed with reasonable assumptions.
2. Do not generate character or background assets before the shot plan and asset list exist.
3. Keep `src/script.json` as the single source of truth for scenes, layers, captions, audio paths, and timing.
4. Split every scene into background, rear, primary subject, foreground, captions, and audio. Avoid single flattened images for animated scenes.
5. Place moving characters and key props as independent transparent PNG layers under `public/assets/layers/`.
6. First build static layout in Remotion, then add motion. Do not tune animation before the scene composition is readable.
7. Validate after structural edits with `npm run validate`; use `npm run validate:strict` only after real assets and audio files are present.
8. For rendered work, verify with `npm run probe` and extracted frames, not only the final video playback.

## New Episode Workflow

When the user wants an actual project:

```powershell
powershell -ExecutionPolicy Bypass -File <skill-dir>\scripts\new_episode.ps1 -Name <episode-slug> -Destination <workspace>
cd <workspace>\episodes\<episode-slug>
npm install
npm run validate
```

Use a short lowercase slug such as `tang-collage-001`. If the user does not specify a destination, use the current workspace.

## Execution Sequence

1. Create or refine the brief.
2. Produce a shot table: `scene_id`, `durationSec`, narration, main subject, supporting subjects, background, foreground, transition.
3. Produce an asset list for backgrounds, character sheets, props, audio, music, and SFX.
4. Update `src/script.json` according to `references/data-contract.md`.
5. Generate or request background plates and character sheets. Use image generation only for bitmap assets; keep prompts specific about full-body characters, clean backgrounds, and no text/watermarks.
6. Split character sheets with the episode script:

```powershell
python .\scripts\split_sheet.py .\public\assets\source\sheet.png .\public\assets\layers scene 6
```

7. Run `npm run validate`, preview with `npm run start`, adjust layout and timing, then render.
8. Run QA using `references/acceptance-checklist.md`.

## Output Contract

When finishing a task, report:

- Episode path.
- Updated files.
- Commands run and whether they passed.
- Missing assets, if placeholders remain.
- Preview or render status.
- Next required human input, such as approving the shot plan or providing reference audio.
