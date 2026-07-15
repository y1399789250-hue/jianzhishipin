import {Composition} from 'remotion';
import type {FC} from 'react';
import {MainVideo} from './MainVideo';
import rawScript from './script.json';
import type {VideoScript} from './types';

const script = rawScript as VideoScript;

const fps = script.meta.fps;
const durationInFrames = Math.max(
  1,
  Math.ceil(script.scenes.reduce((total, scene) => total + scene.durationSec, 0) * fps),
);

export const RemotionRoot: FC = () => {
  return (
    <Composition
      id="PaperCutVideo"
      component={MainVideo}
      durationInFrames={durationInFrames}
      fps={fps}
      width={script.meta.width}
      height={script.meta.height}
    />
  );
};
