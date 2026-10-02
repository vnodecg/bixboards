import { beforeAll, expect } from 'vitest';
import { page } from 'vitest/browser';
import { setProjectAnnotations } from '@storybook/web-components-vite';
import * as a11yAnnotations from '@storybook/addon-a11y/preview';
import * as projectAnnotations from './preview.ts';

// Visual regression: after each story's play function, screenshot the story and compare it with
// the committed baseline. Opt a story out with `parameters: { visual: false }` (e.g. random or
// time-dependent content).
// Remote images (picsum seeds are deterministic) change layout when they arrive; wait for every
// <img> in the story, including inside shadow roots, to settle before capturing.
const imagesSettled = async (root: ParentNode): Promise<void> => {
  const images: HTMLImageElement[] = [];
  const walk = (node: ParentNode) => {
    for (const el of node.querySelectorAll('*')) {
      if (el instanceof HTMLImageElement) images.push(el);
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(root);
  await Promise.all(
    images
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
            setTimeout(done, 4000);
          }),
      ),
  );
};

const visualRegression = {
  afterEach: async (context: {
    id: string;
    canvasElement: HTMLElement;
    parameters: Record<string, unknown>;
  }) => {
    if (context.parameters['visual'] === false) return;
    await imagesSettled(context.canvasElement);
    await document.fonts.ready;
    await expect(page.elementLocator(context.canvasElement)).toMatchScreenshot(
      context.id,
    );
  },
};

const annotations = setProjectAnnotations([
  a11yAnnotations,
  projectAnnotations,
  visualRegression,
]);

beforeAll(annotations.beforeAll);
