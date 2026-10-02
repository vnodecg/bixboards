import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/badge';
import '@bixant/core/button';
import '@bixant/core/callout';
import '@bixant/core/card';
import '@bixant/core/checkbox';
import '@bixant/core/input';
import '@bixant/core/progress-bar';
import '@bixant/core/radio';
import '@bixant/core/radio-group';
import '@bixant/core/slider';
import '@bixant/core/switch';
import '@bixant/core/tab';
import '@bixant/core/tab-group';
import '@bixant/core/tab-panel';
import '@bixant/core/textarea';

type Skin = 'default' | 'flat' | 'soft' | 'mono' | 'editorial';

interface Args {
  skin: Skin;
}

/**
 * Whole-appearance skins built from component hooks alone: no tokens are changed and no
 * component CSS is overridden. Every name below is a documented `@cssprop` (feature docs →
 * "CSS custom properties"); each skin is just a block of declarations on a wrapper, so the same
 * mechanism restyles one subtree, one page or one component.
 */
const SKINS: Record<Exclude<Skin, 'default'>, string> = {
  // Square, hard-edged, ink-on-paper.
  flat: `
    --bx-button-radius: 0;
    --bx-button-border: var(--bx-text-primary);
    --bx-input-radius: 0;
    --bx-input-border-color: var(--bx-text-primary);
    --bx-input-border-width: 2px;
    --bx-textarea-radius: 0;
    --bx-textarea-border-color: var(--bx-text-primary);
    --bx-textarea-border-width: 2px;
    --bx-checkbox-control-radius: 0;
    --bx-checkbox-control-border-color: var(--bx-text-primary);
    --bx-radio-control-border-color: var(--bx-text-primary);
    --bx-switch-control-radius: 0;
    --bx-switch-control-border-color: var(--bx-text-primary);
    --bx-badge-radius: 0;
    --bx-callout-radius: 0;
    --bx-callout-border-width: 2px;
    --bx-progress-bar-radius: 0;
    --bx-progress-bar-height: calc(var(--bx-unit) * 0.75);
    --bx-slider-track-radius: 0;
    --bx-slider-thumb-knob-border-color: var(--bx-text-primary);
    --bx-tab-radius: 0;
    --bx-tab-font-weight: var(--bx-font-weight-bold);
  `,
  // Generous radii, airy spacing, soft rings.
  soft: `
    --bx-button-radius: var(--bx-radius-pill);
    --bx-button-padding-inline: var(--bx-space-l);
    --bx-input-radius: var(--bx-radius-pill);
    --bx-input-padding-inline: var(--bx-space-m);
    --bx-textarea-radius: var(--bx-radius-l);
    --bx-checkbox-control-radius: 50%;
    --bx-badge-radius: var(--bx-radius-pill);
    --bx-badge-padding-inline: var(--bx-space-s);
    --bx-callout-radius: var(--bx-radius-l);
    --bx-callout-padding: var(--bx-space-m) var(--bx-space-l);
    --bx-progress-bar-height: var(--bx-space-s);
    --bx-slider-track-radius: var(--bx-radius-pill);
    --bx-tab-radius: var(--bx-radius-pill);
    --bx-tab-padding-inline: var(--bx-space-l);
  `,
  // Retypes whole text types through the design-system text styles: serif headings and
  // labels, a larger body, tracked-out small labels. No component CSS is involved.
  editorial: `
    --bx-type-heading-family: Georgia, 'Times New Roman', serif;
    --bx-type-label-family: Georgia, 'Times New Roman', serif;
    --bx-type-body-m-size: var(--bx-font-l);
    --bx-type-field-m-size: var(--bx-font-l);
    --bx-type-label-s-weight: var(--bx-font-weight-semibold);
    --bx-type-label-s-tracking: 0.04em;
  `,
  // One accent color; everything else neutral.
  mono: `
    --bx-button-bg: var(--bx-text-primary);
    --bx-button-fg: var(--bx-surface-base);
    --bx-button-border: var(--bx-text-primary);
    --bx-input-focus-border-color: var(--bx-text-primary);
    --bx-textarea-focus-border-color: var(--bx-text-primary);
    --bx-switch-control-checked-bg: var(--bx-text-primary);
    --bx-switch-control-checked-border-color: var(--bx-text-primary);
    --bx-badge-bg: var(--bx-text-primary);
    --bx-badge-fg: var(--bx-surface-base);
    --bx-progress-bar-indicator: var(--bx-text-primary);
    --bx-slider-indicator-bg: var(--bx-text-primary);
    --bx-slider-thumb-knob-border-color: var(--bx-text-primary);
    --bx-tab-group-indicator-color: var(--bx-text-primary);
  `,
};

const meta = {
  title: 'Theming/Component variables',
  parameters: {
    docs: {
      description: {
        component:
          'Every component exposes its whole appearance as `--bx-<component>-<part>-<property>` custom properties with design-system tokens as defaults. These skins change nothing but hook values on a wrapper, so they follow the Storybook theme and `--bx-scale` toolbars like any other content. See Docs → Design system → Component guidelines → Styling API.',
      },
    },
  },
  argTypes: {
    skin: {
      control: 'inline-radio',
      options: ['default', 'flat', 'soft', 'mono', 'editorial'],
      description: 'Hook set applied to the wrapper',
    },
  },
  args: { skin: 'flat' },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const showcase = () => html`
  <div style="display:grid;gap:var(--bx-space-m);max-inline-size:34rem">
    <div
      style="display:flex;gap:var(--bx-space-s);flex-wrap:wrap;align-items:center"
    >
      <bx-button>Primary</bx-button>
      <bx-button appearance="outlined">Outlined</bx-button>
      <bx-button appearance="plain">Plain</bx-button>
      <bx-button variant="error">Delete</bx-button>
      <bx-badge>New</bx-badge>
      <bx-badge variant="warning" appearance="outlined">Beta</bx-badge>
    </div>
    <bx-card with-header>
      <span slot="header">Card heading</span>
      Body text in the card.
    </bx-card>
    <bx-input
      label="Email"
      placeholder="you@example.com"
      hint="We never share it"
    ></bx-input>
    <bx-textarea label="Message" rows="2"></bx-textarea>
    <div style="display:flex;gap:var(--bx-space-l);flex-wrap:wrap">
      <bx-checkbox checked>Remember me</bx-checkbox>
      <bx-switch checked>Notifications</bx-switch>
      <bx-radio-group value="b" orientation="horizontal">
        <bx-radio value="a">A</bx-radio>
        <bx-radio value="b">B</bx-radio>
      </bx-radio-group>
    </div>
    <bx-slider label="Volume" value="40"></bx-slider>
    <bx-progress-bar value="60" label="60%"></bx-progress-bar>
    <bx-callout variant="warning">
      Heads up: this callout is restyled by hooks only.
    </bx-callout>
    <bx-tab-group>
      <bx-tab slot="nav" panel="one" active>Overview</bx-tab>
      <bx-tab slot="nav" panel="two">Activity</bx-tab>
      <bx-tab-panel name="one">First panel</bx-tab-panel>
      <bx-tab-panel name="two">Second panel</bx-tab-panel>
    </bx-tab-group>
  </div>
`;

const frame = (skin: Skin, body = showcase()) => html`
  <section
    style="${skin === 'default' ? '' : SKINS[skin]}; padding: var(--bx-space-m); border: var(--bx-border-width) dashed var(--bx-border-base); border-radius: var(--bx-radius-l)"
  >
    ${body}
  </section>
`;

export const Skins: Story = {
  render: ({ skin }) => frame(skin),
};

export const SideBySide: Story = {
  name: 'Default vs. skin',
  parameters: {
    docs: {
      description: {
        story:
          'The same markup twice: left with defaults (design-system tokens), right with the selected hook set.',
      },
    },
  },
  render: ({ skin }) => html`
    <div
      style="display:grid;grid-template-columns:repeat(auto-fit,minmax(20rem,1fr));gap:var(--bx-space-l)"
    >
      ${frame('default')} ${frame(skin)}
    </div>
  `,
};

export const SingleElement: Story = {
  name: 'One component, one override',
  parameters: {
    docs: {
      description: {
        story:
          'Hooks work on a single element as well: here only the middle button is restyled (inline `style`), its siblings keep the theme.',
      },
    },
  },
  render: () => html`
    <div style="display:flex;gap:var(--bx-space-s);align-items:center">
      <bx-button appearance="outlined">Theme default</bx-button>
      <bx-button
        appearance="outlined"
        style="--bx-button-radius: var(--bx-radius-pill); --bx-button-border: var(--bx-role-danger-border); --bx-button-fg: var(--bx-role-danger-fg); --bx-button-padding-inline: var(--bx-space-l)"
        >Hooks on this one</bx-button
      >
      <bx-button appearance="outlined">Theme default</bx-button>
    </div>
  `,
};
