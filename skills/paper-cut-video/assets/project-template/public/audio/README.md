# audio

把旁白、音乐和音效放在这里。

推荐结构：

```text
audio/
  voice/
    01-wide.wav
    02-close.wav
  music/
    bed.wav
  sfx/
    impact.wav
    whoosh.wav
    tick.wav
```

所有路径在 `src/script.json` 中都要相对 `public/` 书写，例如：

```json
"audio/voice/01-wide.wav"
```
