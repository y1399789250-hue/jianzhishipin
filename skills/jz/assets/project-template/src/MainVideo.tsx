import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import type {FC} from 'react';
import {ReplicaChapterScene} from './ReplicaChapterScene';
import rawScript from './script.json';
import type {VideoScript} from './types';

const script = rawScript as VideoScript;

export const MainVideo: FC = () => {
  const fps = script.meta.fps;
  let cursor = 0;

  return (
    <AbsoluteFill style={{backgroundColor: '#15110d', overflow: 'hidden'}}>
      {script.meta.music ? (
        <Audio src={staticFile(script.meta.music)} volume={script.meta.musicVolume ?? 0.12} />
      ) : null}

      {script.scenes.map((scene) => {
        const durationInFrames = Math.max(1, Math.ceil(scene.durationSec * fps));
        const from = cursor;
        cursor += durationInFrames;

        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
            <ReplicaChapterScene scene={scene} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
