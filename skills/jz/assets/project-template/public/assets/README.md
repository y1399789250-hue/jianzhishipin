# assets

把图片素材放在这里。

推荐结构：

```text
assets/
  plates/
    01-topic-wide-bg.png
    02-topic-close-bg.png
  source/
    close-six-alpha.png
  layers/
    wide-emperor.png
    wide-left-maid.png
    wide-right-crowd.png
```

所有路径在 `src/script.json` 中都要相对 `public/` 书写，例如：

```json
"assets/layers/wide-emperor.png"
```
