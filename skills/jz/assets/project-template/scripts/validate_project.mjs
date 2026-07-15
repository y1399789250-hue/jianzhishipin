import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const strictAssets = process.argv.includes('--strict-assets');
const withSources = process.argv.includes('--with-sources');
const withContinuity = process.argv.includes('--with-continuity');
const strictLayout = strictAssets || process.argv.includes('--strict-layout');
const scriptPath = path.join(cwd, 'src', 'script.json');
const sourceManifestPath = path.join(cwd, 'src', 'source-manifest.json');
const continuityManifestPath = path.join(cwd, 'src', 'continuity-manifest.json');
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
const sceneIds = new Set();
const layerAssetPaths = new Set();
const sceneLayerIds = new Map();

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

          if (!layer.src) {
            errors.push(`${layerLabel}.src is required`);
          } else {
            layerAssetPaths.add(layer.src);
          }
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

        if (scene.id) {
          sceneLayerIds.set(scene.id, layerIds);
        }

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

if (withContinuity) {
  const continuityManifest = readJson(continuityManifestPath);

  if (!continuityManifest) {
    errors.push('src/continuity-manifest.json is required when --with-continuity is used');
  } else {
    if (!continuityManifest.generatedAt || typeof continuityManifest.generatedAt !== 'string') {
      errors.push('continuity-manifest.generatedAt is required');
    }

    const characterIds = new Set();

    if (!Array.isArray(continuityManifest.characters) || continuityManifest.characters.length === 0) {
      errors.push('continuity-manifest.characters must be a non-empty array');
    } else {
      continuityManifest.characters.forEach((character, characterIndex) => {
        const characterLabel = `continuity-manifest.characters[${characterIndex}]`;

        if (!character || typeof character !== 'object') {
          errors.push(`${characterLabel} must be an object`);
          return;
        }

        if (!character.id || typeof character.id !== 'string') {
          errors.push(`${characterLabel}.id is required`);
        } else if (characterIds.has(character.id)) {
          errors.push(`continuity character id duplicated: ${character.id}`);
        } else {
          characterIds.add(character.id);
        }

        if (!character.displayName || typeof character.displayName !== 'string') {
          errors.push(`${characterLabel}.displayName is required`);
        }

        if (!character.referenceAsset || typeof character.referenceAsset !== 'string') {
          errors.push(`${characterLabel}.referenceAsset is required`);
        } else {
          checkAsset(`${characterLabel}.referenceAsset`, character.referenceAsset);
        }

        if (!Array.isArray(character.lockedTraits) || character.lockedTraits.length < 3) {
          errors.push(`${characterLabel}.lockedTraits must include at least 3 stable visual traits`);
        }

        if (!Array.isArray(character.forbiddenChanges) || character.forbiddenChanges.length === 0) {
          errors.push(`${characterLabel}.forbiddenChanges must list visual drift to reject`);
        }

        if (!Array.isArray(character.scenes) || character.scenes.length === 0) {
          errors.push(`${characterLabel}.scenes must be a non-empty array`);
        } else {
          character.scenes.forEach((sceneId) => {
            if (!sceneIds.has(sceneId)) {
              errors.push(`${characterLabel}.scenes references missing scene: ${sceneId}`);
            }
          });
        }
      });
    }

    if (!Array.isArray(continuityManifest.sceneContinuity) || continuityManifest.sceneContinuity.length === 0) {
      errors.push('continuity-manifest.sceneContinuity must be a non-empty array');
    } else {
      continuityManifest.sceneContinuity.forEach((entry, entryIndex) => {
        const entryLabel = `continuity-manifest.sceneContinuity[${entryIndex}]`;

        if (!entry || typeof entry !== 'object') {
          errors.push(`${entryLabel} must be an object`);
          return;
        }

        if (!entry.sceneId || typeof entry.sceneId !== 'string') {
          errors.push(`${entryLabel}.sceneId is required`);
        } else if (!sceneIds.has(entry.sceneId)) {
          errors.push(`${entryLabel}.sceneId does not match src/script.json: ${entry.sceneId}`);
        }

        if (!entry.characterId || typeof entry.characterId !== 'string') {
          errors.push(`${entryLabel}.characterId is required`);
        } else if (characterIds.size && !characterIds.has(entry.characterId)) {
          errors.push(`${entryLabel}.characterId does not match continuity-manifest.characters: ${entry.characterId}`);
        }

        if (!Array.isArray(entry.expectedLayerIds) || entry.expectedLayerIds.length === 0) {
          errors.push(`${entryLabel}.expectedLayerIds must list the character layer ids in the scene`);
        } else if (entry.sceneId && sceneLayerIds.has(entry.sceneId)) {
          const layerIds = sceneLayerIds.get(entry.sceneId);
          entry.expectedLayerIds.forEach((layerId) => {
            if (!layerIds.has(layerId)) {
              errors.push(`${entryLabel}.expectedLayerIds references missing layer in scene ${entry.sceneId}: ${layerId}`);
            }
          });
        }
      });
    }
  }
}

if (withSources) {
  const sourceManifest = readJson(sourceManifestPath);

  if (!sourceManifest) {
    errors.push('src/source-manifest.json is required when --with-sources is used');
  } else {
    if (!sourceManifest.generatedAt || typeof sourceManifest.generatedAt !== 'string') {
      errors.push('source-manifest.generatedAt is required');
    }

    if (!Array.isArray(sourceManifest.items) || sourceManifest.items.length === 0) {
      errors.push('source-manifest.items must be a non-empty array');
    } else {
      const sourceIds = new Set();
      let sourceCardLayers = 0;

      sourceManifest.items.forEach((item, itemIndex) => {
        const itemLabel = `source-manifest.items[${itemIndex}]`;

        if (!item || typeof item !== 'object') {
          errors.push(`${itemLabel} must be an object`);
          return;
        }

        if (!item.id || typeof item.id !== 'string') {
          errors.push(`${itemLabel}.id is required`);
        } else if (sourceIds.has(item.id)) {
          errors.push(`source manifest id duplicated: ${item.id}`);
        } else {
          sourceIds.add(item.id);
        }

        if (!item.sceneId || typeof item.sceneId !== 'string') {
          errors.push(`${itemLabel}.sceneId is required`);
        } else if (sceneIds.size && !sceneIds.has(item.sceneId)) {
          errors.push(`${itemLabel}.sceneId does not match src/script.json: ${item.sceneId}`);
        }

        if (!item.asset || typeof item.asset !== 'string') {
          errors.push(`${itemLabel}.asset is required`);
        } else {
          checkAsset(`${itemLabel}.asset`, item.asset);
          if (layerAssetPaths.has(item.asset)) {
            sourceCardLayers += 1;
          } else {
            errors.push(`${itemLabel}.asset is not used as a layer in src/script.json: ${item.asset}`);
          }
        }

        if (!item.sourceName || typeof item.sourceName !== 'string') errors.push(`${itemLabel}.sourceName is required`);
        if (!item.claim || typeof item.claim !== 'string') errors.push(`${itemLabel}.claim is required`);
        if (!item.url || typeof item.url !== 'string' || !/^https?:\/\//.test(item.url)) {
          errors.push(`${itemLabel}.url must be an http(s) URL`);
        }
        if (!item.accessedAt || typeof item.accessedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.accessedAt)) {
          errors.push(`${itemLabel}.accessedAt must use YYYY-MM-DD`);
        }
      });

      if (sourceCardLayers === 0) {
        errors.push('At least one source manifest asset must be inserted as a script layer');
      }
    }
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
