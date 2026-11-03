import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixboards/core/page';

interface Args {
  navPlacement: 'start' | 'end';
  mobileBreakpoint: string;
  disableNavigationToggle: boolean;
  width: string;
}

const links = Array.from(
  { length: 24 },
  (_, i) => html`<li><a href="#section-${i}">Section ${i + 1}</a></li>`,
);

const meta = {
  title: 'Core/Page',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "`<bx-page>`: application shell with banner, header, subheader, navigation, main, aside and footer landmarks. The layout switches between desktop and mobile on the **page element's own width** (not the viewport), so it works embedded in a micro-frontend; in the mobile view the navigation is an off-canvas drawer with focus management. Spec: docs/features/core/page.md.",
      },
    },
  },
  argTypes: {
    navPlacement: {
      control: 'radio',
      options: ['start', 'end'],
      name: 'nav-placement',
    },
    mobileBreakpoint: { control: 'text', name: 'mobile-breakpoint' },
    disableNavigationToggle: {
      control: 'boolean',
      name: 'disable-navigation-toggle',
    },
    width: {
      control: 'text',
      description: 'Width of the embedding container (drives the view).',
    },
  },
  args: {
    navPlacement: 'start',
    mobileBreakpoint: '768px',
    disableNavigationToggle: false,
    width: '100%',
  },
  render: (args) => html`
    <div
      style="inline-size: ${args.width}; block-size: 28rem; border: 1px solid var(--bx-border-subtle); resize: horizontal; overflow: hidden"
    >
      <bx-page
        style="block-size: 100%"
        nav-placement=${args.navPlacement}
        mobile-breakpoint=${args.mobileBreakpoint}
        ?disable-navigation-toggle=${args.disableNavigationToggle}
      >
        <strong slot="header">Bixboards</strong>
        <span slot="subheader">Projects / Overview</span>
        <ul
          slot="navigation"
          style="list-style: none; margin: 0; padding: 1rem"
        >
          ${links}
        </ul>
        <h1 style="margin-block-start: 0">Overview</h1>
        <p>
          Drag the bottom-right corner of the frame to resize it: below the
          mobile breakpoint the navigation becomes a drawer and the aside drops
          below this content.
        </p>
        <aside slot="aside">Related links</aside>
        <small slot="footer">© Bixboards</small>
      </bx-page>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Mobile: Story = {
  name: 'Mobile view (drawer navigation)',
  args: { width: '24rem' },
  parameters: {
    docs: {
      description: {
        story:
          'Open the menu button: focus moves into the navigation, the rest of the page is inert, and Escape, the scrim or the close button return focus to the menu button.',
      },
    },
  },
};

export const NavigationAtEnd: Story = {
  name: 'Navigation at the end',
  args: { navPlacement: 'end' },
};
