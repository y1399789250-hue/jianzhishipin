# 纸片分层动画工作流

## 0. 固定输入

每条视频开始前，先填写 `prompts/01-story-brief.md`，不要直接生成图片。

必须确认：

- 题材和核心观点。
- 目标时长，例如 10 秒、30 秒、60 秒。
- 横屏或竖屏，本模板默认 `1920x1080`。
- 镜头数量和每个镜头的叙事功能。
- 主角、配角、后排、前景分别是谁。
- 是否需要声音克隆，是否已有干净参考音频。

阶段产物：

```text
brief.md
shot-plan.md
asset-list.md
```

## 1. 文案和镜头

先让 Codex 把文案拆成镜头，而不是让绘图模型直接出画面。

推荐镜头表：

```text
scene_id
scene_title
durationSec
narration
main_subject
supporting_subjects
background
foreground
emotion
transition
```

判断标准：

- 每个镜头只表达一个叙事动作。
- 主体必须明确，不能所有人物一样重要。
- 镜头之间要有推进关系，例如「建立场景 -> 主角动作 -> 群像完成」。
- 同一人物在全景和特写中可以使用不同素材，不强行复用错误比例。

## 2. 分层设计

每个镜头至少拆四层：

| 层级 | 内容 | 动画特点 |
| --- | --- | --- |
| 背景层 | 山水、建筑、纸张纹理、城市环境 | 最慢，只做轻微漂移和推镜 |
| 后排层 | 远处群臣、侍从、建筑边角 | 小幅移动，透明度可略低 |
| 主体层 | 关键人物、关键道具 | 最大，入场最有力量 |
| 前景层 | 近处人物、纸屑、胶带、遮挡物 | 稍快，用来制造纵深 |

不要让主要人物出现在背景底板里。背景底板只保留环境。

## 3. 图片生成

背景提示词使用 `prompts/02-background-imagegen.md`。

角色素材提示词使用 `prompts/03-character-sheet-imagegen.md`。

角色素材必须约束：

- 朝向明确。
- 全身完整，不裁头、手、脚。
- 服饰、发冠、道具明确。
- 白色剪纸描边。
- 纯绿色或纯白背景，方便抠图。
- 不要文字、水印、复杂场景和多余阴影。

建议先生成素材表，再用脚本拆成单个 PNG：

```powershell
python .\scripts\split_sheet.py .\public\assets\source\close-six-alpha.png .\public\assets\layers close 6
```

## 4. 静态排版

把素材放进 `src/script.json` 后，先只看静态排版。

检查顺序：

1. 主角是不是最大、最醒目。
2. 配角有没有挡住主角的脸、手、关键道具。
3. 人物脚底是否落在合理地面。
4. 朝向是否符合场景关系。
5. 前景是否能制造纵深，而不是遮住画面重点。

参考比例：

```text
primary:   画面核心，宽度通常 520-720
secondary: 次要人物，宽度通常 240-380
tertiary:  后排人物，宽度通常 140-220
decor:     装饰物，按画面需要控制
```

## 5. 动画规则

角色类型对应默认运动：

```text
primary:   distance 78, rise 55, startScale 0.86
secondary: distance 58, rise 38, startScale 0.90
tertiary:  distance 38, rise 22, startScale 0.95
decor:     distance 18, rise 12, startScale 1.00
```

同一镜头不要让所有人物同时出现。用 `delay` 错开入场：

```json
{ "id": "emperor", "role": "primary", "delay": 4 }
{ "id": "wide-left-1", "role": "secondary", "delay": 18 }
{ "id": "wide-right-1", "role": "tertiary", "delay": 34 }
```

推荐顺序：

```text
背景先动
主角入场
次要人物补充
后排群像完成
前景和装饰轻微漂浮
```

## 6. 音频和字幕

旁白是镜头时长的依据。先生成旁白，再回填 `durationSec`。

音频分四层：

- `voice`：旁白，决定镜头时长。
- `music`：背景音乐，音量低于人声。
- `scene sfx`：镜头切换音效。
- `layer sfx`：人物入场音效。

字幕只保留一层，固定在底部。不要把字幕、画面文字和人物关键道具堆在同一区域。

## 7. 验收

每次渲染后至少做三件事：

```powershell
npm run probe
npm run frame:check
npm run validate:strict
```

看抽帧时重点检查：

- 头、手、脚是否被裁。
- 主角是否足够突出。
- 遮挡关系是否正确。
- 字幕是否挡住脚部和道具。
- 关键人物入场是否错峰。
- 音效是否贴合人物出现的帧。

## 8. 复盘

每条视频完成后，在项目里记录：

```text
final duration
final render command
asset prompts that worked
asset prompts that failed
layout corrections
audio corrections
screenshots of accepted frames
```

这些复盘会让下一条视频更快，而不是每次重新摸索。
