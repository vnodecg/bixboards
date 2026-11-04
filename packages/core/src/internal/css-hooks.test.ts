import { expect, fixture } from '@open-wc/testing';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';

/**
 * Styling-API contract (docs/design-system/component-guidelines.md, "Styling API"): every
 * `@cssprop` a component documents is a live hook — setting it on the host visibly changes the
 * rendered component. Driven by the generated Custom Elements Manifest, so a hook that is
 * documented but mis-wired (typo'd name, shadowed by an internal declaration, applied to
 * nothing) fails here instead of silently doing nothing for consumers.
 *
 * Each hook is tried against the component's default markup and a set of variants (`appearance`,
 * `open`, ...); it passes if the sentinel lands on any element in any of them. Hooks scoped to a
 * state (`-hover-`, `-checked-`, ...) or pseudo-element need that state to exist and are covered
 * by the component's own tests; the few hooks that need richer runtime context than a static
 * fixture can give are listed in `NOT_EXERCISED`, each with its reason.
 */

interface Entry {
  name: string;
}
interface Declaration {
  tagName?: string;
  cssProperties?: Entry[];
}
interface Module {
  path: string;
  declarations?: Declaration[];
}

const COLOR = 'rgb(1, 2, 3)';
const BORDER_SIDES = ['Top', 'Right', 'Bottom', 'Left'];
const CORNERS = ['TopLeft', 'TopRight', 'BottomLeft', 'BottomRight'];

// The first matching kind wins, so order from most to least specific suffix.
const KINDS: {
  suffix: RegExp;
  value: string;
  props: string[];
  expect: (v: string) => boolean;
}[] = [
  {
    suffix: /-(bg|background)$/,
    value: COLOR,
    props: ['backgroundColor'],
    expect: (v) => v === COLOR,
  },
  {
    suffix: /-border-color$/,
    value: COLOR,
    props: [...BORDER_SIDES.map((s) => `border${s}Color`), 'outlineColor'],
    expect: (v) => v === COLOR,
  },
  {
    suffix: /-(fg|color)$/,
    value: COLOR,
    props: [
      'color',
      'fill',
      'stroke',
      'backgroundColor',
      'borderTopColor',
      'borderLeftColor',
    ],
    expect: (v) => v === COLOR,
  },
  {
    suffix: /-border-width$/,
    value: '7px',
    props: BORDER_SIDES.map((s) => `border${s}Width`),
    expect: (v) => v === '7px',
  },
  {
    suffix: /-radius$/,
    value: '13px',
    props: CORNERS.map((c) => `border${c}Radius`),
    expect: (v) => v === '13px',
  },
  {
    suffix: /-gap$/,
    value: '9px',
    props: ['columnGap', 'rowGap'],
    expect: (v) => v === '9px',
  },
  {
    suffix: /-padding(-inline|-block)?(-start|-end)?$/,
    value: '11px',
    props: BORDER_SIDES.map((s) => `padding${s}`),
    expect: (v) => v === '11px',
  },
  {
    suffix: /-font-family$/,
    value: 'Georgia',
    props: ['fontFamily'],
    expect: (v) => v === 'Georgia',
  },
  {
    suffix: /-letter-spacing$/,
    value: '3px',
    props: ['letterSpacing'],
    expect: (v) => v === '3px',
  },
  {
    suffix: /-font-size$/,
    value: '17px',
    props: ['fontSize'],
    expect: (v) => v === '17px',
  },
  {
    suffix: /-font-weight$/,
    value: '333',
    props: ['fontWeight'],
    expect: (v) => v === '333',
  },
  {
    suffix: /-line-height$/,
    value: '41px',
    props: ['lineHeight'],
    expect: (v) => v === '41px',
  },
  {
    suffix: /-shadow$/,
    value: `0 0 0 5px ${COLOR}`,
    props: ['boxShadow'],
    expect: (v) => v.includes(COLOR),
  },
  {
    suffix: /-focus-ring-color$/,
    value: COLOR,
    props: ['outlineColor'],
    expect: (v) => v === COLOR,
  },
  {
    suffix: /-(size|width|min-width|max-width|height|min-height|max-height)$/,
    value: '123px',
    props: [
      'width',
      'height',
      'minWidth',
      'maxWidth',
      'minHeight',
      'maxHeight',
      'strokeWidth',
    ],
    expect: (v) => v === '123px',
  },
];

// Hooks that only apply in a state, a pseudo-element, or a focus-ring geometry we don't probe.
const NEEDS_STATE =
  /-(hover|active|focus|focus-within|disabled|checked|selected|open|expanded|invalid|indeterminate|readonly|loading|current|pressed|dragging|sticky|pinned|placeholder)-|-(backdrop|before|after|marker|thumb-min|thumb-max)-|-focus-ring-(width|offset)$/;

// Variants tried for every component, on top of its default markup.
const VARIANTS = [
  '',
  'appearance="filled"',
  'appearance="outlined"',
  'appearance="accent"',
  'orientation="vertical"',
  'effect="sheen"',
  'open',
  'with-caret',
  'loading',
  'appearance="button"',
  'contained open',
  'current',
  'variant="error"',
  'lazy-error',
  'value="0123456789012345678901234567890123456789"',
];

// Markup that makes a component render the parts its hooks style.
const MARKUP: Record<string, string | string[]> = {
  'bx-avatar-group':
    '<bx-avatar-group max="1"><bx-avatar label="A"></bx-avatar><bx-avatar label="B"></bx-avatar></bx-avatar-group>',
  'bx-badge': '<bx-badge with-remove>3</bx-badge>',
  'bx-breadcrumb-item': [
    '<bx-breadcrumb-item href="/">Home</bx-breadcrumb-item>',
    '<bx-breadcrumb-item>Current</bx-breadcrumb-item>',
  ],
  'bx-button-group':
    '<bx-button-group><bx-button>A</bx-button><bx-button>B</bx-button></bx-button-group>',
  'bx-callout': '<bx-callout dismissible>Message</bx-callout>',
  'bx-card':
    '<bx-card with-header with-footer><div slot="header">Head</div>Body<div slot="footer">Foot</div></bx-card>',
  'bx-carousel':
    '<bx-carousel navigation pagination><bx-carousel-item>1</bx-carousel-item><bx-carousel-item>2</bx-carousel-item></bx-carousel>',
  'bx-checkbox': '<bx-checkbox hint="Hint">Label</bx-checkbox>',
  'bx-color-picker': [
    '<bx-color-picker inline opacity value="#336699" swatches="#336699;#993366"></bx-color-picker>',
    '<bx-color-picker opacity value="#336699"></bx-color-picker>',
  ],
  'bx-details': '<bx-details summary="Summary">Content</bx-details>',
  'bx-dialog':
    '<bx-dialog label="Title">Body<div slot="footer">F</div></bx-dialog>',
  'bx-drawer':
    '<bx-drawer label="Title">Body<div slot="footer">F</div></bx-drawer>',
  'bx-dropdown':
    '<bx-dropdown><bx-button slot="trigger">T</bx-button><bx-dropdown-item>A</bx-dropdown-item></bx-dropdown>',
  'bx-dropdown-item': '<bx-dropdown-item>Item</bx-dropdown-item>',
  'bx-icon-button': '<bx-icon-button label="Go" name="check"></bx-icon-button>',
  'bx-kbd': '<bx-kbd keys="mod+k"></bx-kbd>',
  'bx-chip': '<bx-chip selectable removable>Tag</bx-chip>',
  'bx-sparkline': '<bx-sparkline values="1,3,2,5"></bx-sparkline>',
  'bx-timeline':
    '<bx-timeline><bx-timeline-item heading="A" icon="check"></bx-timeline-item><bx-timeline-item heading="B"></bx-timeline-item></bx-timeline>',
  'bx-input':
    '<bx-input label="Label" hint="Hint" clearable value="x"></bx-input>',
  'bx-number-input':
    '<bx-number-input label="Label" hint="Hint"></bx-number-input>',
  'bx-option': '<bx-option value="a">Option</bx-option>',
  'bx-radio': '<bx-radio value="a">Label</bx-radio>',
  'bx-radio-group':
    '<bx-radio-group label="Label" hint="Hint"><bx-radio value="a">A</bx-radio></bx-radio-group>',
  'bx-select':
    '<bx-select label="Label" hint="Hint" clearable value="a"><bx-option value="a">A</bx-option></bx-select>',
  'bx-slider': '<bx-slider label="Label" hint="Hint"></bx-slider>',
  'bx-switch': '<bx-switch hint="Hint">Label</bx-switch>',
  'bx-tab': '<bx-tab panel="p" closable>Tab</bx-tab>',
  'bx-tab-group':
    '<bx-tab-group><bx-tab slot="nav" panel="a">A</bx-tab><bx-tab-panel name="a">Panel</bx-tab-panel></bx-tab-group>',
  'bx-textarea':
    '<bx-textarea label="Label" hint="Hint" show-count maxlength="20"></bx-textarea>',
  'bx-tree':
    '<bx-tree selection="multiple"><bx-tree-item with-checkbox>One</bx-tree-item></bx-tree>',
  'bx-tree-item':
    '<bx-tree selection="multiple"><bx-tree-item expanded with-checkbox>One<bx-tree-item with-checkbox>Two</bx-tree-item></bx-tree-item></bx-tree>',
};

// Hooks a static fixture cannot exercise. Keep this list short and give a reason for each.
const NOT_EXERCISED: [RegExp, string][] = [
  [
    /^bx-color-picker --bx-color-picker-format-select-line-height$/,
    'a native <select> ignores line-height',
  ],
  [
    /^bx-color-picker --bx-color-picker-(custom-gap|grid-)/,
    'the custom grid renders only after the custom section is expanded',
  ],
  [
    /^bx-button-group --bx-button-group-gap$/,
    'offsets slotted items with a negative margin, not a flex gap',
  ],
  [
    /^bx-skeleton --bx-skeleton-sheen-color$/,
    'consumed inside a gradient (background-image), not observable as a color',
  ],
  [
    /^bx-color-picker --bx-color-picker-(checker-|handle-shadow)/,
    'consumed inside gradients / a box-shadow color, not observable as a plain color',
  ],
  [
    /^bx-page --bx-page-aside-block-start-/,
    'applies only in the narrow stacked view',
  ],
  [
    /^bx-rating --bx-rating-symbol-line-height$/,
    'applies to text symbols; the default symbols are SVG',
  ],
  [
    /^bx-tab-group --bx-tab-group-(track|scroll-button)/,
    'scroll controls and the track render only when the tabs overflow',
  ],
  [
    /^bx-(dropdown|select) --bx-(dropdown|select)-(heading|group-label|hr)-/,
    'rendered from data rows (headings, groups, dividers) inside the open popup',
  ],
  [
    /^bx-tree-item --bx-tree-item-spinner-size$/,
    'spinner shows only while lazily loading children',
  ],
  [
    /^bx-dialog --bx-dialog-width$/,
    'it is the max bound of a clamp(); at the sentinel the min bound wins',
  ],
  [
    /^bx-scroller --bx-scroller-shadow-color$/,
    'edge shadows only render once content overflows and scrolls',
  ],
  [
    /^bx-popup --bx-popup-/,
    'popup arrow/auto-size values are runtime outputs of positioning',
  ],
  [
    /^bx-(select|dropdown|dropdown-item|popover|tooltip) .*-(menu|panel|submenu|listbox|body|arrow)-/,
    'rendered inside a top-layer popup that only exists while open and anchored',
  ],
  [
    /^bx-page --bx-page-(scrim|navigation)/,
    'mobile off-canvas navigation exists only in the narrow `view`',
  ],
  [
    /^bx-slider --bx-slider-tooltip-/,
    'value tooltip renders only while the thumb is pressed or focused',
  ],
  [
    /^bx-carousel --bx-carousel-(bar|bars|triangle|play)/,
    'autoplay controls render only with `autoplay`',
  ],
];

function* withShadowTrees(root: ParentNode): Generator<Element> {
  for (const el of root.querySelectorAll('*')) {
    yield el;
    if (el.shadowRoot) yield* withShadowTrees(el.shadowRoot);
  }
}

const cssName = (p: string) =>
  p.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

describe('component styling API (CSS custom properties)', () => {
  let modules: Module[] = [];

  before(async () => {
    const manifest = (await (await fetch('/custom-elements.json')).json()) as {
      modules: Module[];
    };
    modules = manifest.modules;
    const dirs = new Set(
      modules.map((m) => m.path.split('/').slice(0, 2).join('/')),
    );
    await Promise.all(
      [...dirs].map((dir) => import(`/${dir}/index.ts`).catch(() => undefined)),
    );
  });

  it('every base-state hook visibly changes its component', async function () {
    this.timeout(180_000);
    const unwired: string[] = [];
    let verified = 0;

    for (const decl of modules.flatMap((m) => m.declarations ?? [])) {
      const tag = decl.tagName;
      if (!tag || !customElements.get(tag)) continue;
      const pending = (decl.cssProperties ?? [])
        .map((h) => h.name)
        .filter(
          (name) =>
            name.startsWith(`--${tag}-`) &&
            !NEEDS_STATE.test(name) &&
            !NOT_EXERCISED.some(([re]) => re.test(`${tag} ${name}`)) &&
            KINDS.some((k) => k.suffix.test(name)),
        );
      const remaining = new Set(pending);
      if (!remaining.size) continue;

      for (const variant of VARIANTS) {
        if (!remaining.size) break;
        for (const base of [MARKUP[tag] ?? `<${tag}></${tag}>`].flat()) {
          if (!remaining.size) break;
          const markup = unsafeStatic(
            base.replace(`<${tag}`, `<${tag} ${variant}`),
          );
          // Zero motion so transitions don't leave computed values mid-flight.
          const wrapper = await fixture<HTMLElement>(
            staticHtml`<div style="inline-size: 40rem; --bx-motion-duration-fast: 0s; --bx-motion-duration-base: 0s; --bx-motion-duration-slow: 0s">${markup}</div>`,
          );
          const host = wrapper.firstElementChild as HTMLElement;
          await (host as unknown as { updateComplete?: Promise<unknown> })
            .updateComplete;
          const scope = [...withShadowTrees(wrapper)];

          for (const name of [...remaining]) {
            const kind = KINDS.find((k) => k.suffix.test(name))!;
            const read = () =>
              scope.flatMap((el) => {
                return [undefined, '::before', '::after'].flatMap((pseudo) => {
                  const cs = getComputedStyle(el, pseudo);
                  return kind.props.map((p) => cs.getPropertyValue(cssName(p)));
                });
              });
            const before = read();
            host.style.setProperty(name, kind.value);
            const after = read();
            host.style.removeProperty(name);
            if (after.some((v, i) => v !== before[i] && kind.expect(v)))
              remaining.delete(name);
          }
          wrapper.remove();
        }
      }

      verified += pending.length - remaining.size;
      for (const name of remaining) unwired.push(`${tag} ${name}`);
    }

    expect(
      unwired.join(' ; '),
      `unwired hooks (${verified} verified)`,
    ).to.equal('');
    expect(verified).to.be.greaterThan(400);
  });
});
