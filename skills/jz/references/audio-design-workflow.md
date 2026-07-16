# Audio Design Workflow

Use this reference whenever `$jz` creates or edits a video. The goal is to place sound effects where the script and visual action naturally need them, without covering narration.

## Audio Layers

Use four layers:

1. `voiceover`: narration, strongest priority.
2. `music`: low-volume bed, usually `0.08` to `0.16`.
3. `scene.sfxEvents`: timed sound effects based on script beats and visual events.
4. `layer.sfx`: legacy/simple layer-entry sound. Prefer `scene.sfxEvents` when timing matters.

## SFX Planning

Create an audio beat sheet before editing `src/script.json`:

```text
scene_id
time_sec
narration cue
visual cue
sfx type
asset path
volume
reason
```

Map common visual events:

- character lands or settles: soft landing, paper thump
- source card appears or sticks: paper tap, tape press
- key object pops in: soft pop, tick, click
- question or warning appears: light chime, muted tick
- scene transition: paper swipe, page turn
- data or official source reveal: restrained stamp, paper slide
- emotional soft beat: gentle cloth/paper rustle

## Timing Rules

1. Time SFX to the visible event, not just the start of the scene.
2. Use `scene.sfxEvents[].atSec` for precise timing inside the scene.
3. Keep most SFX volume between `0.12` and `0.45`. Use louder hits only for a major visual beat.
4. Do not place loud SFX on top of dense narration. Move it slightly before/after the spoken phrase or reduce volume.
5. Avoid constant noise. A 45-60 second explainer usually needs 6-14 deliberate SFX events, not one on every movement.
6. Prefer small paper/material sounds over cinematic impacts unless the style calls for a large hit.

## `sfxEvents` Contract

Add timed scene-level SFX like this:

```json
"sfxEvents": [
  {
    "id": "source-card-tap",
    "src": "audio/sfx/paper-tap.wav",
    "atSec": 1.2,
    "volume": 0.24,
    "durationSec": 1.2,
    "label": "Source card sticks to the board."
  }
]
```

Fields:

- `id`: unique within the scene.
- `src`: audio path relative to `public/`.
- `atSec`: seconds from the start of the scene.
- `volume`: optional, recommended `0.12` to `0.45`.
- `durationSec`: optional playback window, default is 2 seconds.
- `label`: optional reason tied to narration or visual action.

## Asset Rules

Save reusable SFX under:

```text
public/audio/sfx/
```

Use clear names:

```text
paper-tap.wav
paper-pop.wav
soft-land.wav
page-swipe.wav
small-tick.wav
```

If an exact SFX asset is missing, leave the planned `sfxEvents` entry and report the missing asset. Do not silently omit important audio beats.
