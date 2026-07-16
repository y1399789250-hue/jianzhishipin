import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {FC} from 'react';
import type {Layer, Scene} from './types';

const roleMotion = {
  primary: {distance: 78, rise: 55, startScale: 0.86, volume: 0.55},
  secondary: {distance: 58, rise: 38, startScale: 0.9, volume: 0.34},
  tertiary: {distance: 38, rise: 22, startScale: 0.95, volume: 0.22},
  decor: {distance: 18, rise: 12, startScale: 1, volume: 0.18},
} as const;

const paperEdge = `
  drop-shadow(4px 0 #f5eedc)
  drop-shadow(-4px 0 #f5eedc)
  drop-shadow(0 4px #f5eedc)
  drop-shadow(0 18px 9px rgba(20,15,12,.32))
`;

const directionOffset = (layer: Layer, distance: number, rise: number) => {
  switch (layer.from ?? 'bottom') {
    case 'left':
      return {x: -distance, y: 0};
    case 'right':
      return {x: distance, y: 0};
    case 'top':
      return {x: 0, y: -rise};
    case 'none':
      return {x: 0, y: 0};
    case 'bottom':
    default:
      return {x: 0, y: rise};
  }
};

const LayerImage: FC<{layer: Layer}> = ({layer}) => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const motion = roleMotion[layer.role];
  const delay = layer.delay ?? 0;
  const localFrame = Math.max(0, frame - delay);
  const enter = spring({
    fps,
    frame: localFrame,
    config: {damping: 18, stiffness: 80, mass: 0.9},
    durationInFrames: 24,
  });
  const opacity = interpolate(localFrame, [0, 10], [0, layer.opacity ?? 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const offset = directionOffset(layer, motion.distance, motion.rise);
  const idle = Math.sin((frame + delay) / 24) * (layer.role === 'primary' ? 4 : 2);
  const wobble = Math.sin((frame + delay) / 38) * (layer.role === 'decor' ? 1.4 : 0.45);
  const translateX = offset.x * (1 - enter);
  const translateY = offset.y * (1 - enter) + idle;
  const scale = motion.startScale + (1 - motion.startScale) * enter;

  return (
    <Img
      src={staticFile(layer.src)}
      style={{
        position: 'absolute',
        left: layer.x - layer.width / 2,
        bottom: height - layer.y,
        width: layer.width,
        zIndex: layer.z,
        opacity,
        filter: layer.paperEdge === false ? layer.filter : layer.filter ?? paperEdge,
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${wobble}deg)`,
        transformOrigin: '50% 100%',
      }}
    />
  );
};

const Caption: FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const now = frame / fps;
  const caption = scene.captions?.find((item) => now >= item.start && now <= item.end);

  if (!caption) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 270,
        right: 270,
        bottom: 58,
        zIndex: 100,
        textAlign: 'center',
        color: '#fff6df',
        fontSize: 46,
        lineHeight: 1.24,
        fontWeight: 700,
        textShadow: '0 3px 10px rgba(30, 18, 12, .82)',
        letterSpacing: 0,
      }}
    >
      {caption.text}
    </div>
  );
};

export const ReplicaChapterScene: FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const bgParallax = scene.background.parallax ?? 0.01;
  const bgScale = 1 + bgParallax * (frame / Math.max(1, durationInFrames));
  const sortedLayers = [...scene.layers].sort((a, b) => a.z - b.z);

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: scene.background.color ?? '#efe0c3'}}>
      <Img
        src={staticFile(scene.background.src)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${bgScale}) translateX(${Math.sin(frame / 70) * 6}px)`,
          transformOrigin: '50% 50%',
        }}
      />

      {scene.voiceover ? <Audio src={staticFile(scene.voiceover)} volume={scene.voiceVolume ?? 1} /> : null}

      {scene.sfxEvents?.map((event) => {
        const from = Math.max(0, Math.round(event.atSec * fps));
        const duration = Math.max(1, Math.min(durationInFrames - from, Math.ceil((event.durationSec ?? 2) * fps)));

        return (
          <Sequence key={`scene-sfx-${event.id}`} from={from} durationInFrames={duration}>
            <Audio src={staticFile(event.src)} volume={event.volume ?? 0.28} />
          </Sequence>
        );
      })}

      {sortedLayers.map((layer) => (
        <LayerImage key={layer.id} layer={layer} />
      ))}

      {sortedLayers.map((layer) =>
        layer.sfx ? (
          <Sequence key={`${layer.id}-sfx`} from={layer.delay ?? 0} durationInFrames={Math.min(90, durationInFrames)}>
            <Audio src={staticFile(layer.sfx)} volume={roleMotion[layer.role].volume} />
          </Sequence>
        ) : null,
      )}

      <Caption scene={scene} />
    </AbsoluteFill>
  );
};
