export type LayerRole = 'primary' | 'secondary' | 'tertiary' | 'decor';
export type EntryDirection = 'left' | 'right' | 'top' | 'bottom' | 'none';

export type VideoScript = {
  meta: {
    title: string;
    width: number;
    height: number;
    fps: number;
    music?: string;
    musicVolume?: number;
  };
  scenes: Scene[];
};

export type Scene = {
  id: string;
  title: string;
  durationSec: number;
  voiceover?: string;
  voiceVolume?: number;
  background: {
    src: string;
    color?: string;
    parallax?: number;
  };
  captions?: Caption[];
  sfxEvents?: SfxEvent[];
  layers: Layer[];
};

export type Caption = {
  start: number;
  end: number;
  text: string;
};

export type SfxEvent = {
  id: string;
  src: string;
  atSec: number;
  volume?: number;
  durationSec?: number;
  label?: string;
};

export type Layer = {
  id: string;
  src: string;
  role: LayerRole;
  x: number;
  y: number;
  width: number;
  z: number;
  delay?: number;
  from?: EntryDirection;
  opacity?: number;
  sfx?: string;
  filter?: string;
  paperEdge?: boolean;
};
