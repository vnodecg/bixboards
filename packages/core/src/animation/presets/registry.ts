/**
 * Tree-shakable preset registry (docs/features/core/animation.md FR-ANIMATION-01).
 *
 * Presets are opt-in: importing `@bixant/core/animation` alone registers no preset. Each preset
 * lives in its own subpath (`@bixant/core/animation/presets/<name>`) and registers itself as a
 * side effect on import, so a bundler only ships the presets an app actually imports.
 */

export type Preset = Keyframe[] | PropertyIndexedKeyframes;
type PresetFactory = () => Preset;

const registry = new Map<string, PresetFactory>();

/** Registers `factory` under `name`. Re-registering the same name overwrites the previous entry. */
export function registerPreset(name: string, factory: PresetFactory): void {
  registry.set(name, factory);
}

/** Looks up a preset by name; `undefined` if nothing registered that name (or it was never imported). */
export function getPreset(name: string): PresetFactory | undefined {
  return registry.get(name);
}
