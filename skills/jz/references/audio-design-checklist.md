# Audio Design Checklist

Use this checklist before final `$jz` handoff.

## Planning

- [ ] An audio beat sheet exists, even if brief.
- [ ] SFX are chosen from narration cues and visible actions.
- [ ] Major visual actions such as landings, card taps, paper pops, transitions, and source reveals have considered SFX.
- [ ] Quiet scenes are allowed to stay quiet; SFX are not added mechanically.

## Timing

- [ ] `scene.sfxEvents[].atSec` matches the visible event timing.
- [ ] No SFX starts after its scene duration.
- [ ] SFX do not cover dense narration.
- [ ] SFX volume is restrained and consistent with the paper-cut style.

## Assets

- [ ] SFX files live under `public/audio/sfx/`.
- [ ] Missing SFX assets are reported in the final handoff.
- [ ] `npm run validate:audio` passes.
- [ ] `npm run validate:production` passes after real audio assets are present.
