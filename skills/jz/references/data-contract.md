# 数据契约

`src/script.json` 是每条视频的唯一内容源。Remotion、校验脚本和人工验收都围绕它工作。

## 顶层结构

```json
{
  "meta": {
    "title": "Tang Collage Demo",
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "music": "audio/music/bed.wav"
  },
  "scenes": []
}
```

## scene

```json
{
  "id": "wide",
  "title": "盛唐长安全景",
  "durationSec": 5.2,
  "voiceover": "audio/voice/01-wide.wav",
  "background": {
    "src": "assets/plates/01-tang-wide-bg.png",
    "parallax": 0.012
  },
  "captions": [
    { "start": 0.4, "end": 4.8, "text": "万国衣冠拜冕旒，盛唐气象在此展开。" }
  ],
  "layers": []
}
```

规则：

- `id` 必须唯一。
- `durationSec` 必须大于 0。
- `voiceover` 可为空，但正式渲染建议填写。
- `background.src` 必须指向 `public/` 下的图片。
- `captions[].start` 和 `captions[].end` 以镜头内秒数计算。

## layer

```json
{
  "id": "emperor",
  "src": "assets/layers/wide-emperor.png",
  "role": "primary",
  "x": 960,
  "y": 675,
  "width": 650,
  "z": 5,
  "delay": 4,
  "from": "bottom",
  "sfx": "audio/sfx/impact.wav"
}
```

字段说明：

- `id`：同一镜头内唯一。
- `src`：相对 `public/` 的 PNG 路径。
- `role`：`primary`、`secondary`、`tertiary`、`decor`。
- `x`、`y`：图层底部中心点坐标。
- `width`：目标显示宽度。
- `z`：层级，数值越大越靠前。
- `delay`：镜头开始后的入场延迟，单位为帧。
- `from`：入场方向，`left`、`right`、`bottom`、`top`、`none`。
- `sfx`：可选入场音效，相对 `public/`。

## 命名约定

```text
assets/plates/01-topic-wide-bg.png
assets/plates/02-topic-close-bg.png
assets/layers/wide-emperor.png
assets/layers/wide-left-maid.png
assets/layers/close-gift-man.png
audio/voice/01-wide.wav
audio/sfx/impact.wav
audio/music/bed.wav
```

## scene.sfxEvents

Use `scene.sfxEvents` for sound effects that are chosen from the narration meaning and visible action, not merely from layer entrance. These events are timed in seconds from the start of the scene.

```json
{
  "sfxEvents": [
    {
      "id": "primary-soft-land",
      "src": "audio/sfx/soft-land.wav",
      "atSec": 0.35,
      "volume": 0.28,
      "durationSec": 1.1,
      "label": "Primary subject settles into place."
    }
  ]
}
```

Rules:
- `id` must be unique within the scene.
- `src` is relative to `public/` and should point to a short WAV/MP3 sound effect.
- `atSec` must be `>= 0` and must not exceed `scene.durationSec`.
- `volume` is optional and must stay between `0` and `1`; use low values under narration.
- `durationSec` is optional, but must be `> 0` when provided.
- Add events only where the viewer can connect the sound to an action: paper tap, layer landing, source card reveal, page swipe, soft pop, notification tick, or subtle room tone change.

## 失败条件

以下情况必须先修复，再进入渲染：

- 同一镜头 layer id 重复。
- `durationSec <= 0`。
- `role` 不在允许范围内。
- `width <= 0`。
- `z` 缺失。
- `validate:strict` 报素材缺失。
