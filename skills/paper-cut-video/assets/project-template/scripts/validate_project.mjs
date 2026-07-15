import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const strictAssets = process.argv.includes('--strict-assets');
const strictLayout = strictAssets || process.argv.includes('--strict-layout');
const scriptPath = path.join(cwd, 'src', 'script.json');
const publicDir = path.join(cwd, 'public');
const allowedRoles = new Set(['primary', 'secondary', 'tertiary', 'decor']);
const allowedDirections = new Set(['left', 'right', 'top', 'bottom', 'none', undefined]);
const layoutMargin = 24;

const errors = [];
const warnings = [];

const readJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`Cannot read JSON: ${filePath}\n${error.message}`);
    return null;
  }
};

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const publicAssetPath = (relativePath) => {
  if (!relativePath || typeof relativePath !== 'string') {
    return null;
  }

  const normalized = relativePath.split('/').join(path.sep);
  const fullPath = path.resolve(publicDir, normalized);

  if (!fullPath.startsWith(path.resolve(publicDir))) {
    errors.push(`Asset path escapes public/: ${relativePath}`);
    return null;
  }

  return fullPath;
};

const publicPathExists = (relativePath) => {
  const fullPath = publicAssetPath(relativePath);
  return Boolean(fullPath && fs.existsSync(fullPath));
};

const readPngSize = (relativePath) => {
  const fullPath = publicAssetPath(relativePath);
  if (!fullPath || !fs.existsSync(fullPath) || path.extname(fullPath).toLowerCase() !== '.png') {
    return null;
  }

  const buffer = fs.readFileSync(fullPath);
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') {
    warnings.push(`Cannot read PNG dimensions: public/${relativePath}`);
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
};

const checkAsset = (label, relativePath) => {
  if (!relativePath) {
    return;
  }

  if (!publicPathExists(relativePath)) {
    const message = `${label} missing: public/${relativePath}`;
    if (strictAssets) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }
};

const script = readJson(scriptPath);

if (script) {
  if (!script.meta || typeof script.meta !== 'object') {
    errors.push('meta is required');
  } else {
    if (!script.meta.title) errors.push('meta.title is required');
    if (!Number.isInteger(script.meta.width) || script.meta.width <= 0) errors.push('meta.width must be a positive integer');
    if (!Number.isInteger(script.meta.height) || script.meta.height <= 0) errors.push('meta.height must be a positive integer');
    if (!Number.isInteger(script.meta.fps) || script.meta.fps <= 0) errors.push('meta.fps must be a positive integer');
    checkAsset('music', script.meta.music);
  }

  if (!Array.isArray(script.scenes) || script.scenes.length === 0) {
    errors.push('scenes must be a non-empty array');
  } else {
    const sceneIds = new Set();

    script.scenes.forEach((scene, sceneIndex) => {
      const sceneLabel = `scene[${sceneIndex}]`;

      if (!scene.id) {
        errors.push(`${sceneLabel}.id is required`);
      } else if (sceneIds.has(scene.id)) {
        errors.push(`scene id duplicated: ${scene.id}`);
      } else {
        sceneIds.add(scene.id);
      }

      if (!scene.title) warnings.push(`${sceneLabel}.title is empty`);
      if (!isNumber(scene.durationSec) || scene.durationSec <= 0) errors.push(`${sceneLabel}.durationSec must be > 0`);
      if (!scene.background || !scene.background.src) errors.push(`${sceneLabel}.background.src is required`);
      checkAsset(`${sceneLabel}.background`, scene.background?.src);
      checkAsset(`${sceneLabel}.voiceover`, scene.voiceover);

      if (scene.captions !== undefined) {
        if (!Array.isArray(scene.captions)) {
          errors.push(`${sceneLabel}.captions must be an array`);
        } else {
          scene.captions.forEach((caption, captionIndex) => {
            const captionLabel = `${sceneLabel}.captions[${captionIndex}]`;
            if (!isNumber(caption.start) || !isNumber(caption.end)) errors.push(`${captionLabel} start/end must be numbers`);
            if (caption.end <= caption.start) errors.push(`${captionLabel}.end must be greater than start`);
            if (caption.end > scene.durationSec) warnings.push(`${captionLabel}.end exceeds scene.durationSec`);
            if (!caption.text) errors.push(`${captionLabel}.text is required`);
          });
        }
      }

      if (!Array.isArray(scene.layers) || scene.layers.length === 0) {
        errors.push(`${sceneLabel}.layers must be a non-empty array`);
      } else {
        const layerIds = new Set();
        const layerBounds = [];
        scene.layers.forEach((layer, layerIndex) => {
          const layerLabel = `${sceneLabel}.layers[${layerIndex}]`;

          if (!layer.id) {
            errors.push(`${layerLabel}.id is required`);
          } else if (layerIds.has(layer.id)) {
            errors.push(`${sceneLabel} layer id duplicated: ${layer.id}`);
          } else {
            layerIds.add(layer.id);
          }

          if (!layer.src) errors.push(`${layerLabel}.src is required`);
          checkAsset(`${layerLabel}.src`, layer.src);
          checkAsset(`${layerLabel}.sfx`, layer.sfx);

          if (!allowedRoles.has(layer.role)) errors.push(`${layerLabel}.role must be primary, secondary, tertiary, or decor`);
          if (!allowedDirections.has(layer.from)) errors.push(`${layerLabel}.from is invalid`);
          if (!isNumber(layer.x)) errors.push(`${layerLabel}.x must be a number`);
          if (!isNumber(layer.y)) errors.push(`${layerLabel}.y must be a number`);
          if (!isNumber(layer.width) || layer.width <= 0) errors.push(`${layerLabel}.width must be > 0`);
          if (!isNumber(layer.z)) errors.push(`${layerLabel}.z must be a number`);
          if (layer.delay !== undefined && (!isNumber(layer.delay) || layer.delay < 0)) errors.push(`${layerLabel}.delay must be >= 0`);

          const dimensions = readPngSize(layer.src);
          if (
            dimensions &&
            Number.isInteger(script.meta?.width) &&
            Number.isInteger(script.meta?.height) &&
            isNumber(layer.x) &&
            isNumber(layer.y) &&
            isNumber(layer.width) &&
            layer.width > 0
          ) {
            const renderHeight = (dimensions.height * layer.width) / dimensions.width;
            const bounds = {
              id: layer.id ?? `${layerIndex}`,
              role: layer.role,
              left: layer.x - layer.width / 2,
              top: layer.y - renderHeight,
              right: layer.x + layer.width / 2,
              bottom: layer.y,
              area: layer.width * renderHeight,
            };
            layerBounds.push(bounds);

            const overflow = [];
            if (bounds.left < layoutMargin) overflow.push(`left=${bounds.left.toFixed(1)}`);
            if (bounds.top < layoutMargin) overflow.push(`top=${bounds.top.toFixed(1)}`);
            if (bounds.right > script.meta.width - layoutMargin) overflow.push(`right=${bounds.right.toFixed(1)}`);
            if (bounds.bottom > script.meta.height - layoutMargin) overflow.push(`bottom=${bounds.bottom.toFixed(1)}`);

            if (overflow.length) {
              const message = `${layerLabel} (${bounds.id}) is outside the ${layoutMargin}px safe frame: ${overflow.join(', ')}`;
              if (strictLayout) {
                errors.push(message);
              } else {
                warnings.push(message);
              }
            }
          }
        });

        for (let firstIndex = 0; firstIndex < layerBounds.length; firstIndex += 1) {
          for (let secondIndex = firstIndex + 1; secondIndex < layerBounds.length; secondIndex += 1) {
            const first = layerBounds[firstIndex];
            const second = layerBounds[secondIndex];
            const overlapWidth = Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left));
            const overlapHeight = Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));
            const overlapArea = overlapWidth * overlapHeight;
            const smallerArea = Math.min(first.area, second.area);
            const overlapRatio = smallerArea > 0 ? overlapArea / smallerArea : 0;

            if (overlapRatio >= 0.35 && first.role !== 'decor' && second.role !== 'decor') {
              warnings.push(
                `${sceneLabel} large layer overlap: ${first.id} / ${second.id} overlap ${(overlapRatio * 100).toFixed(0)}% of the smaller layer; verify alignment`,
              );
            }
          }
        }
      }
    });
  }
}

if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (errors.length) {
  console.error('\nErrors:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Project contract OK${strictAssets ? ' with strict asset checks' : ''}.`);
