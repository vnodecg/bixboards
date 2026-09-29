import { expect } from '@open-wc/testing';
import { getPreset } from './registry.ts';
import './bounce.ts';
import './fade-in.ts';
import './fade-out.ts';
import './flip.ts';
import './pulse.ts';
import './shake.ts';
import './slide-in-down.ts';
import './slide-in-left.ts';
import './slide-in-right.ts';
import './slide-in-up.ts';
import './spin.ts';
import './zoom-in.ts';
import './zoom-out.ts';

const NAMES = [
  'bounce',
  'fadeIn',
  'fadeOut',
  'flip',
  'pulse',
  'shake',
  'slideInDown',
  'slideInLeft',
  'slideInRight',
  'slideInUp',
  'spin',
  'zoomIn',
  'zoomOut',
];

describe('animation presets', () => {
  for (const name of NAMES) {
    it(`registers "${name}" with at least two non-empty keyframes`, () => {
      const factory = getPreset(name);
      expect(factory, `preset "${name}" not registered`).to.exist;
      const keyframes = factory!();
      expect(Array.isArray(keyframes), `"${name}" must be a Keyframe[]`).to.be
        .true;
      expect((keyframes as Keyframe[]).length).to.be.greaterThanOrEqual(2);
      for (const frame of keyframes as Keyframe[])
        expect(Object.keys(frame).length).to.be.greaterThan(0);
    });
  }

  it('is a no-op for an unregistered name', () => {
    expect(getPreset('does-not-exist')).to.be.undefined;
  });
});
