/**
 * One entry per documented component: its category, the sub-elements it is documented together
 * with (`parts`), and a live demo. `html` is rendered as-is on the component's page and shown as
 * the copyable source; `js` (optional) runs once with `stage` bound to the demo container, for
 * what attributes cannot express (object properties, imperative APIs).
 *
 * Every element in the three custom-elements manifests must be a `tag` or a `part` here;
 * tests/site.test.ts enforces it, so a new component cannot ship without a docs page.
 */

export const categories = [
  'Actions',
  'Form',
  'Feedback',
  'Display',
  'Overlays',
  'Navigation',
  'Organization',
  'Imagery',
  'Charts',
  'Data',
  'Utilities',
] as const;
export type Category = (typeof categories)[number];

export interface Demo {
  html: string;
  js?: string;
}
export interface Entry {
  tag: string;
  category: Category;
  /** Sub-elements documented on the same page. */
  parts: string[];
  demo: Demo;
}

const entry = (
  tag: string,
  category: Category,
  html: string,
  js?: string,
  parts: string[] = [],
): Entry => ({
  tag,
  category,
  parts,
  demo: { html: html.trim(), ...(js ? { js: js.trim() } : {}) },
});

const row = (html: string) =>
  `<div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center">${html}</div>`;

export const registry: Entry[] = [
  // ─── Actions ────────────────────────────────────────────────────────────────
  entry(
    'bx-button',
    'Actions',
    row(`
  <bx-button>Default</bx-button>
  <bx-button variant="secondary">Secondary</bx-button>
  <bx-button variant="error">Delete</bx-button>
  <bx-button appearance="outlined">Outlined</bx-button>
  <bx-button appearance="plain">Plain</bx-button>
  <bx-button loading>Saving</bx-button>
  <bx-button disabled>Disabled</bx-button>
  <bx-button pill with-caret>Menu</bx-button>`),
  ),
  entry(
    'bx-button-group',
    'Actions',
    `<bx-button-group label="View">
  <bx-button variant="secondary" appearance="outlined">Day</bx-button>
  <bx-button variant="secondary" appearance="outlined">Week</bx-button>
  <bx-button variant="secondary" appearance="outlined">Month</bx-button>
</bx-button-group>`,
  ),
  entry(
    'bx-copy-button',
    'Actions',
    row(`
  <code id="copy-src">pnpm add @bixboards/core</code>
  <bx-copy-button from="copy-src"></bx-copy-button>
  <bx-copy-button value="Copied literal value"></bx-copy-button>`),
  ),
  entry(
    'bx-icon-button',
    'Actions',
    row(`
  <bx-icon-button name="copy" label="Copy"></bx-icon-button>
  <bx-icon-button name="info" label="Info" appearance="filled"></bx-icon-button>
  <bx-icon-button name="check" label="Done" appearance="filled" shape="circle" variant="secondary"></bx-icon-button>
  <bx-icon-button name="warning" label="Warning" appearance="outlined" variant="warning"></bx-icon-button>`),
  ),
  entry(
    'bx-close-button',
    'Actions',
    row(`
  <bx-close-button size="s"></bx-close-button>
  <bx-close-button></bx-close-button>
  <bx-close-button size="l" appearance="filled"></bx-close-button>`),
  ),
  entry(
    'bx-social-button',
    'Actions',
    row(`
  <bx-social-button provider="github"></bx-social-button>
  <bx-social-button provider="google" mode="signin"></bx-social-button>
  <bx-social-button provider="github" mode="share"></bx-social-button>`),
  ),
  entry(
    'bx-toggle-button',
    'Actions',
    row(`
  <bx-toggle-button>Bold</bx-toggle-button>
  <bx-toggle-button pressed>Italic (pressed)</bx-toggle-button>
  <bx-toggle-button appearance="filled">Filled</bx-toggle-button>
  <bx-toggle-button disabled>Disabled</bx-toggle-button>`),
  ),
  entry(
    'bx-dropdown',
    'Actions',
    `<bx-dropdown>
  <bx-button slot="trigger" with-caret>Actions</bx-button>
  <bx-dropdown-item value="rename">Rename</bx-dropdown-item>
  <bx-dropdown-item value="duplicate">Duplicate<span slot="details">⌘D</span></bx-dropdown-item>
  <bx-dropdown-item value="move" disabled>Move</bx-dropdown-item>
  <bx-divider></bx-divider>
  <bx-dropdown-item value="delete" variant="error">Delete</bx-dropdown-item>
</bx-dropdown>`,
    undefined,
    ['bx-dropdown-item'],
  ),

  // ─── Form ───────────────────────────────────────────────────────────────────
  entry(
    'bx-input',
    'Form',
    `<div style="display:grid;gap:1rem;max-inline-size:22rem">
  <bx-input label="Email" type="email" placeholder="you@example.com" hint="We never share it"></bx-input>
  <bx-input label="Password" type="password" password-toggle></bx-input>
  <bx-input label="Search" clearable value="Clear me"></bx-input>
</div>`,
  ),
  entry(
    'bx-number-input',
    'Form',
    `<div style="display:grid;gap:1rem;max-inline-size:16rem">
  <bx-number-input label="Quantity" value="3" min="0" max="10"></bx-number-input>
  <bx-number-input label="Price" value="19.99" locale="en-US" id="price"></bx-number-input>
</div>`,
    `stage.querySelector('#price').format = { style: 'currency', currency: 'USD' };`,
  ),
  entry(
    'bx-textarea',
    'Form',
    `<bx-textarea label="Message" placeholder="Say something" rows="3" show-count maxlength="140" style="max-inline-size:24rem"></bx-textarea>`,
  ),
  entry(
    'bx-checkbox',
    'Form',
    `<div style="display:grid;gap:.5rem">
  <bx-checkbox>Unchecked</bx-checkbox>
  <bx-checkbox checked>Checked</bx-checkbox>
  <bx-checkbox indeterminate>Indeterminate</bx-checkbox>
  <bx-checkbox disabled>Disabled</bx-checkbox>
</div>`,
  ),
  entry(
    'bx-switch',
    'Form',
    `<div style="display:grid;gap:.5rem">
  <bx-switch>Notifications</bx-switch>
  <bx-switch checked>Dark mode</bx-switch>
  <bx-switch disabled>Disabled</bx-switch>
</div>`,
  ),
  entry(
    'bx-radio-group',
    'Form',
    `<div style="display:grid;gap:1.5rem">
  <bx-radio-group name="plan" label="Plan">
    <bx-radio value="free" checked>Free</bx-radio>
    <bx-radio value="pro">Pro</bx-radio>
    <bx-radio value="team">Team</bx-radio>
  </bx-radio-group>
  <bx-radio-group name="size" label="Size">
    <bx-radio appearance="button" value="s">Small</bx-radio>
    <bx-radio appearance="button" value="m" checked>Medium</bx-radio>
    <bx-radio appearance="button" value="l">Large</bx-radio>
  </bx-radio-group>
</div>`,
    undefined,
    ['bx-radio'],
  ),
  entry(
    'bx-select',
    'Form',
    `<bx-select label="Country" placeholder="Choose…" searchable clearable style="inline-size:min(22rem,100%)">
  <bx-option value="us">United States</bx-option>
  <bx-option value="ca">Canada</bx-option>
  <bx-option value="br" disabled>Brazil (unavailable)</bx-option>
  <bx-option value="de">Germany</bx-option>
  <bx-option value="jp">Japan</bx-option>
</bx-select>`,
    undefined,
    ['bx-option'],
  ),
  entry(
    'bx-combobox',
    'Form',
    `<bx-combobox label="Fruit" placeholder="Search…" style="max-inline-size:20rem">
  <bx-option value="apple">Apple</bx-option>
  <bx-option value="apricot">Apricot</bx-option>
  <bx-option value="banana">Banana</bx-option>
  <bx-option value="cherry">Cherry</bx-option>
</bx-combobox>`,
  ),
  entry(
    'bx-slider',
    'Form',
    `<div style="display:grid;gap:1.5rem;inline-size:min(22rem,100%)">
  <bx-slider value="40" with-tooltip><span slot="label">Volume</span></bx-slider>
  <bx-slider range with-markers min="0" max="100" step="10"><span slot="label">Range</span></bx-slider>
</div>`,
    `const range = stage.querySelectorAll('bx-slider')[1]; range.value = [20, 70];`,
  ),
  entry(
    'bx-rating',
    'Form',
    `<div style="display:grid;gap:.75rem">
  <bx-rating value="3" label="Rating"></bx-rating>
  <bx-rating value="3.5" precision="0.5" label="Half stars"></bx-rating>
  <bx-rating value="4" readonly label="Read only"></bx-rating>
</div>`,
  ),
  entry(
    'bx-color-picker',
    'Form',
    `<bx-color-picker value="#3b82f6"></bx-color-picker>`,
    `stage.querySelector('bx-color-picker').presets = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];`,
  ),
  entry(
    'bx-input-otp',
    'Form',
    `<bx-input-otp label="Verification code" length="6" group-size="3"></bx-input-otp>`,
  ),
  entry(
    'bx-file-upload',
    'Form',
    `<bx-file-upload label="Attachments" multiple max-size="2000000" accept="image/*,.pdf" style="max-inline-size:28rem">
  <span slot="hint">Images or PDF up to 2 MB</span>
</bx-file-upload>`,
  ),
  entry(
    'bx-search-field',
    'Form',
    `<bx-search-field label="Search" shortcut="mod+k" style="max-inline-size:24rem"></bx-search-field>`,
  ),
  entry(
    'bx-segmented-control',
    'Form',
    `<bx-segmented-control label="View" value="week">
  <bx-segment value="day" label="Day"></bx-segment>
  <bx-segment value="week" label="Week"></bx-segment>
  <bx-segment value="month" label="Month"></bx-segment>
</bx-segmented-control>`,
    undefined,
    ['bx-segment'],
  ),
  entry(
    'bx-calendar',
    'Form',
    `<bx-calendar value="2026-11-12" month="2026-11" locale="en-US"></bx-calendar>`,
  ),
  entry(
    'bx-date-picker',
    'Form',
    `<div style="display:grid;gap:1rem;max-inline-size:24rem">
  <bx-date-picker label="Due date" locale="en-US"></bx-date-picker>
  <bx-date-picker label="Stay" range locale="en-US"></bx-date-picker>
</div>`,
  ),
  entry(
    'bx-time-field',
    'Form',
    `<div style="display:flex;gap:1.5rem;flex-wrap:wrap">
  <bx-time-field label="Start" value="09:30" hour-cycle="h12"></bx-time-field>
  <bx-time-field label="Precise" value="14:05:30" hour-cycle="h23" granularity="second"></bx-time-field>
</div>`,
  ),
  entry(
    'bx-tag-input',
    'Form',
    `<bx-tag-input label="Keywords" value="web,components" style="max-inline-size:24rem"></bx-tag-input>`,
  ),

  // ─── Feedback ───────────────────────────────────────────────────────────────
  entry(
    'bx-badge',
    'Feedback',
    row(`
  <bx-badge>Default</bx-badge>
  <bx-badge variant="secondary">Secondary</bx-badge>
  <bx-badge variant="error">Error</bx-badge>
  <bx-badge variant="warning" pill>Warning</bx-badge>
  <bx-badge appearance="accent" attention="pulse">Live</bx-badge>
  <bx-badge with-remove>Removable</bx-badge>`),
  ),
  entry(
    'bx-callout',
    'Feedback',
    `<div style="display:grid;gap:.75rem;max-inline-size:32rem">
  <bx-callout>Your changes have been saved.</bx-callout>
  <bx-callout variant="warning" dismissible>Storage is almost full.</bx-callout>
  <bx-callout variant="error">Payment failed. Update your card.</bx-callout>
</div>`,
  ),
  entry(
    'bx-chip',
    'Feedback',
    row(`
  <bx-chip>Design</bx-chip>
  <bx-chip selectable>Selectable</bx-chip>
  <bx-chip selectable selected>Selected</bx-chip>
  <bx-chip removable>Removable</bx-chip>
  <bx-chip appearance="outlined" clickable>Clickable</bx-chip>`),
  ),
  entry(
    'bx-meter',
    'Feedback',
    `<div style="display:grid;gap:.75rem;max-inline-size:24rem">
  <bx-meter label="Disk usage" value="15" low="40" high="80" optimum="10" show-value></bx-meter>
  <bx-meter label="CPU" value="55" low="40" high="80" optimum="10" show-value></bx-meter>
  <bx-meter label="Memory" value="92" low="40" high="80" optimum="10" show-value></bx-meter>
</div>`,
  ),
  entry(
    'bx-progress-bar',
    'Feedback',
    `<div style="display:grid;gap:1rem;max-inline-size:24rem">
  <bx-progress-bar value="64" label="Upload">64%</bx-progress-bar>
  <bx-progress-bar indeterminate label="Working"></bx-progress-bar>
</div>`,
  ),
  entry(
    'bx-progress-ring',
    'Feedback',
    row(`
  <bx-progress-ring value="30" label="30%">30%</bx-progress-ring>
  <bx-progress-ring value="65" label="65%">65%</bx-progress-ring>
  <bx-progress-ring value="90" label="90%">90%</bx-progress-ring>`),
  ),
  entry(
    'bx-skeleton',
    'Feedback',
    `<div style="display:flex;align-items:center;gap:1rem;max-inline-size:24rem" aria-busy="true">
  <bx-skeleton effect="sheen" style="inline-size:2.5rem;block-size:2.5rem;border-radius:50%"></bx-skeleton>
  <div style="display:grid;gap:.5rem;flex:1">
    <bx-skeleton effect="sheen"></bx-skeleton>
    <bx-skeleton effect="sheen" style="inline-size:60%"></bx-skeleton>
  </div>
</div>`,
  ),
  entry(
    'bx-spinner',
    'Feedback',
    row(`
  <bx-spinner style="font-size:1rem" aria-label="Loading"></bx-spinner>
  <bx-spinner style="font-size:2rem" aria-label="Loading"></bx-spinner>
  <bx-spinner style="font-size:3rem" aria-label="Loading"></bx-spinner>`),
  ),
  entry(
    'bx-toast',
    'Feedback',
    `<bx-button id="show-toast">Show toast</bx-button>`,
    `stage.querySelector('#show-toast').addEventListener('click', async () => {
  const { BxToast } = await import('@bixboards/core/toast');
  BxToast.toast({ message: 'Saved', variant: 'success' });
});`,
    ['bx-toast-region'],
  ),
  entry(
    'bx-notification-center',
    'Feedback',
    `<div style="min-block-size:22rem;text-align:end"><bx-notification-center></bx-notification-center></div>`,
    `const now = Date.now();
stage.querySelector('bx-notification-center').items = [
  { id: '1', title: 'Build finished', body: 'main passed', time: new Date(now - 60000).toISOString() },
  { id: '2', title: 'New comment', body: 'Sam replied', time: new Date(now - 3600000).toISOString(), read: true },
];`,
  ),
  entry(
    'bx-empty-state',
    'Feedback',
    `<bx-empty-state variant="no-results"><bx-button slot="actions" size="small">Clear filters</bx-button></bx-empty-state>`,
  ),
  entry(
    'bx-stepper',
    'Feedback',
    `<bx-stepper current="1">
  <bx-step label="Account" description="Create login"></bx-step>
  <bx-step label="Profile" description="Tell us more"></bx-step>
  <bx-step label="Billing"></bx-step>
  <bx-step label="Done"></bx-step>
</bx-stepper>`,
    undefined,
    ['bx-step'],
  ),
  entry(
    'bx-tooltip',
    'Feedback',
    `<bx-button id="tip-anchor" variant="secondary" appearance="outlined">Hover or focus me</bx-button>
<bx-tooltip for="tip-anchor" placement="bottom">Saved to your library</bx-tooltip>`,
  ),

  // ─── Display ────────────────────────────────────────────────────────────────
  entry(
    'bx-avatar',
    'Display',
    `<div style="display:flex;gap:1rem;align-items:center;font-size:2.5rem">
  <bx-avatar initials="AB" label="Ada B"></bx-avatar>
  <bx-avatar shape="rounded" initials="CD" label="Cy D"></bx-avatar>
  <bx-avatar shape="square" initials="EF" label="Eve F"></bx-avatar>
  <bx-avatar-group>
    <bx-avatar initials="A" label="A"></bx-avatar>
    <bx-avatar initials="B" label="B"></bx-avatar>
    <bx-avatar initials="C" label="C"></bx-avatar>
  </bx-avatar-group>
</div>`,
    undefined,
    ['bx-avatar-group'],
  ),
  entry(
    'bx-card',
    'Display',
    `<bx-card with-header with-footer style="max-inline-size:22rem">
  <span slot="header">Project Nova</span>
  <p style="margin:0">A short summary of the card body that wraps naturally.</p>
  <bx-button slot="footer" size="s">Open</bx-button>
</bx-card>`,
  ),
  entry(
    'bx-stat-card',
    'Display',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1rem">
  <bx-stat-card label="Revenue" value="128400" delta="12.5" id="rev">
    <bx-sparkline slot="chart" label="Trend" values="3,5,4,8,6,9,12"></bx-sparkline>
    <span slot="footer">vs last month</span>
  </bx-stat-card>
  <bx-stat-card label="Churn" value="3.2" delta="-0.4" trend-is-good="down"></bx-stat-card>
</div>`,
    `stage.querySelector('#rev').format = { style: 'currency', currency: 'USD', maximumFractionDigits: 0 };`,
  ),
  entry(
    'bx-kbd',
    'Display',
    row(`
  <bx-kbd keys="mod+k"></bx-kbd>
  <bx-kbd keys="mod+shift+p"></bx-kbd>
  <bx-kbd keys="alt+enter"></bx-kbd>
  <bx-kbd>Esc</bx-kbd>`),
  ),
  entry(
    'bx-timeline',
    'Display',
    `<bx-timeline>
  <bx-timeline-item heading="Order placed" time="2026-05-01T10:00:00Z" icon="check"></bx-timeline-item>
  <bx-timeline-item heading="Shipped" time="2026-05-02T09:30:00Z" description="Left the warehouse"></bx-timeline-item>
  <bx-timeline-item heading="Delivered" time="2026-05-04T16:10:00Z"></bx-timeline-item>
</bx-timeline>`,
    undefined,
    ['bx-timeline-item'],
  ),
  entry(
    'bx-code-block',
    'Display',
    `<bx-code-block filename="hello.ts" line-numbers highlight-lines="2"></bx-code-block>`,
    `stage.querySelector('bx-code-block').code = "const greeting = 'hi';\\nconsole.log(greeting);\\n";`,
  ),
  entry(
    'bx-tree',
    'Display',
    `<bx-tree selection="single" style="max-inline-size:20rem">
  <bx-tree-item expanded>
    Documents
    <bx-tree-item slot="children">Resume.pdf</bx-tree-item>
    <bx-tree-item slot="children" expanded>
      Projects
      <bx-tree-item slot="children">bixboards</bx-tree-item>
      <bx-tree-item slot="children">notes.md</bx-tree-item>
    </bx-tree-item>
  </bx-tree-item>
  <bx-tree-item>Pictures</bx-tree-item>
</bx-tree>`,
    undefined,
    ['bx-tree-item'],
  ),

  // ─── Overlays ───────────────────────────────────────────────────────────────
  entry(
    'bx-dialog',
    'Overlays',
    `<bx-button id="open-dialog">Open dialog</bx-button>
<bx-dialog id="demo-dialog" label="Delete project?">
  This action cannot be undone. All project data will be permanently removed.
  <bx-button slot="footer" variant="secondary" appearance="outlined" data-dialog="close">Cancel</bx-button>
  <bx-button slot="footer" variant="error" data-dialog="close">Delete</bx-button>
</bx-dialog>`,
    `stage.querySelector('#open-dialog').addEventListener('click', () => stage.querySelector('#demo-dialog').show());`,
  ),
  entry(
    'bx-drawer',
    'Overlays',
    `<bx-button id="open-drawer">Open drawer</bx-button>
<bx-drawer id="demo-drawer" label="Settings" placement="end">
  <div style="display:grid;gap:1rem">
    <bx-input label="Project name" value="Bixboards"></bx-input>
    <bx-input label="Slug" value="bixboards"></bx-input>
  </div>
  <bx-button slot="footer" data-drawer="close">Save</bx-button>
</bx-drawer>`,
    `stage.querySelector('#open-drawer').addEventListener('click', () => stage.querySelector('#demo-drawer').show());`,
  ),
  entry(
    'bx-popover',
    'Overlays',
    `<bx-popover label="Dimensions" placement="bottom">
  <bx-button slot="anchor" variant="secondary" appearance="outlined" with-caret>Dimensions</bx-button>
  <div style="display:grid;gap:.5rem;max-inline-size:16rem">
    <strong>Set the dimensions</strong>
    <span>Rich, interactive content can live here.</span>
    <bx-input label="Width" value="100"></bx-input>
  </div>
</bx-popover>`,
  ),
  entry(
    'bx-popup',
    'Overlays',
    `<bx-button id="popup-anchor" variant="secondary" appearance="outlined">Anchor</bx-button>
<bx-popup anchor="popup-anchor" placement="bottom" active arrow distance="8">
  <div style="padding:.5rem .75rem;background:var(--bx-surface-raised);border:1px solid var(--bx-border-subtle);border-radius:var(--bx-radius-m)">Positioned popup</div>
</bx-popup>`,
  ),
  entry(
    'bx-context-menu',
    'Overlays',
    `<div style="padding:2rem;border:1px dashed var(--bx-border-strong);border-radius:.5rem">
  Right-click (or long-press) anywhere in this box
  <bx-context-menu>
    <bx-dropdown-item value="cut">Cut</bx-dropdown-item>
    <bx-dropdown-item value="copy">Copy</bx-dropdown-item>
    <bx-dropdown-item value="paste">Paste</bx-dropdown-item>
  </bx-context-menu>
</div>`,
  ),
  entry(
    'bx-command-palette',
    'Overlays',
    `<bx-button id="open-palette">Open palette (⌘K)</bx-button>
<bx-command-palette></bx-command-palette>`,
    `const palette = stage.querySelector('bx-command-palette');
palette.commands = [
  { id: 'new', label: 'New document', group: 'File', shortcut: 'mod+n', handler: () => {} },
  { id: 'open', label: 'Open settings', group: 'Navigation', shortcut: 'mod+,', handler: () => {} },
  { id: 'theme', label: 'Toggle theme', group: 'Navigation', keywords: ['dark', 'light'], handler: () => {} },
];
stage.querySelector('#open-palette').addEventListener('click', () => palette.show());`,
  ),

  // ─── Navigation ─────────────────────────────────────────────────────────────
  entry(
    'bx-breadcrumb',
    'Navigation',
    `<bx-breadcrumb label="Breadcrumb">
  <bx-breadcrumb-item href="#">Home</bx-breadcrumb-item>
  <bx-breadcrumb-item href="#">Products</bx-breadcrumb-item>
  <bx-breadcrumb-item>Widget</bx-breadcrumb-item>
</bx-breadcrumb>`,
    undefined,
    ['bx-breadcrumb-item'],
  ),
  entry(
    'bx-pagination',
    'Navigation',
    `<div style="display:grid;gap:1rem">
  <bx-pagination page="5" page-count="20"></bx-pagination>
  <bx-pagination compact page="3" page-count="20"></bx-pagination>
</div>`,
  ),
  entry(
    'bx-sidebar',
    'Navigation',
    `<div style="block-size:20rem;border:1px solid var(--bx-border-subtle)">
  <bx-sidebar mode="inline">
    <strong slot="header">Acme</strong>
    <bx-sidebar-group label="Main">
      <bx-sidebar-item href="#home" icon="info" active>Home</bx-sidebar-item>
      <bx-sidebar-item icon="check" badge="3">Inbox</bx-sidebar-item>
      <bx-sidebar-item icon="copy">Reports
        <bx-sidebar-item slot="children" href="#weekly">Weekly</bx-sidebar-item>
      </bx-sidebar-item>
    </bx-sidebar-group>
    <span slot="footer">Signed in</span>
  </bx-sidebar>
</div>`,
    undefined,
    ['bx-sidebar-group', 'bx-sidebar-item'],
  ),

  // ─── Organization ───────────────────────────────────────────────────────────
  entry(
    'bx-tab-group',
    'Organization',
    `<bx-tab-group>
  <bx-tab slot="nav" panel="overview">Overview</bx-tab>
  <bx-tab slot="nav" panel="activity">Activity</bx-tab>
  <bx-tab slot="nav" panel="settings">Settings</bx-tab>
  <bx-tab slot="nav" panel="off" disabled>Disabled</bx-tab>
  <bx-tab-panel name="overview">Overview content.</bx-tab-panel>
  <bx-tab-panel name="activity">Activity content.</bx-tab-panel>
  <bx-tab-panel name="settings">Settings content.</bx-tab-panel>
  <bx-tab-panel name="off">Disabled content.</bx-tab-panel>
</bx-tab-group>`,
    undefined,
    ['bx-tab', 'bx-tab-panel'],
  ),
  entry(
    'bx-details',
    'Organization',
    `<div style="display:grid;gap:.5rem;max-inline-size:28rem">
  <bx-details summary="What is Bixboards?" open>A fluid-scale, accessible web component library built on Lit and design tokens.</bx-details>
  <bx-details summary="Does it work with React?">Yes. Wrappers for React, Angular and Svelte ship alongside the elements.</bx-details>
</div>`,
  ),
  entry(
    'bx-divider',
    'Organization',
    `<div style="max-inline-size:20rem">
  <p>Above the divider.</p>
  <bx-divider></bx-divider>
  <p>Below the divider.</p>
</div>`,
  ),
  entry(
    'bx-scroller',
    'Organization',
    `<bx-scroller aria-label="Items" style="max-inline-size:28rem;max-block-size:10rem">
  <div style="display:grid;gap:.5rem;padding:.25rem">
    ${Array.from({ length: 12 }, (_, i) => `<div style="padding:.5rem .75rem;background:var(--bx-surface-subtle);border-radius:var(--bx-radius-m)">Item ${i + 1}</div>`).join('\n    ')}
  </div>
</bx-scroller>`,
  ),
  entry(
    'bx-split-panel',
    'Organization',
    `<bx-split-panel style="block-size:10rem;border:1px solid var(--bx-border-subtle)">
  <div slot="start" style="padding:1rem">Start</div>
  <div slot="end" style="padding:1rem">End</div>
</bx-split-panel>`,
  ),
  entry(
    'bx-page',
    'Organization',
    `<div style="block-size:24rem;border:1px solid var(--bx-border-subtle);overflow:hidden">
  <bx-page style="block-size:100%">
    <strong slot="header">Bixboards</strong>
    <span slot="subheader">Projects / Overview</span>
    <ul slot="navigation" style="list-style:none;margin:0;padding:1rem;display:grid;gap:.5rem">
      <li><a href="#overview">Overview</a></li>
      <li><a href="#tasks">Tasks</a></li>
      <li><a href="#settings">Settings</a></li>
    </ul>
    <h3 style="margin-block-start:0">Overview</h3>
    <p>The application shell collapses its navigation into a drawer on narrow containers.</p>
  </bx-page>
</div>`,
  ),

  // ─── Imagery ────────────────────────────────────────────────────────────────
  entry(
    'bx-icon',
    'Imagery',
    row(`
  <bx-icon name="check" label="Check" style="font-size:2rem"></bx-icon>
  <bx-icon name="info" label="Info" style="font-size:2rem"></bx-icon>
  <bx-icon name="warning" label="Warning" style="font-size:2rem"></bx-icon>
  <bx-icon name="copy" label="Copy" style="font-size:2rem"></bx-icon>
  <bx-icon name="close" label="Close" style="font-size:2rem"></bx-icon>`),
  ),
  entry(
    'bx-animated-image',
    'Imagery',
    `<div style="inline-size:10rem;block-size:10rem">
  <bx-animated-image
    alt="An animated gradient"
    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
  ></bx-animated-image>
</div>`,
  ),
  entry(
    'bx-carousel',
    'Imagery',
    `<bx-carousel navigation pagination loop aria-label="Colors" style="inline-size:min(24rem,100%)">
  ${['#6366f1', '#0ea5e9', '#10b981', '#f59e0b']
    .map(
      (c, i) =>
        `<bx-carousel-item style="inline-size:100%;aspect-ratio:16/9;background:${c};display:flex;align-items:center;justify-content:center;color:#fff;font:600 1.5rem system-ui;border-radius:var(--bx-radius-m)">Slide ${i + 1}</bx-carousel-item>`,
    )
    .join('\n  ')}
</bx-carousel>`,
    undefined,
    ['bx-carousel-item'],
  ),
  entry(
    'bx-comparison',
    'Imagery',
    `<bx-comparison position="50" style="max-inline-size:28rem">
  <div slot="before" style="aspect-ratio:16/9;background:linear-gradient(135deg,#475569,#94a3b8);display:flex;align-items:center;justify-content:center;color:#fff;font:600 1.25rem system-ui">Before</div>
  <div slot="after" style="aspect-ratio:16/9;background:linear-gradient(135deg,#6366f1,#ec4899);display:flex;align-items:center;justify-content:center;color:#fff;font:600 1.25rem system-ui">After</div>
</bx-comparison>`,
  ),
  entry(
    'bx-qr-code',
    'Imagery',
    `<bx-qr-code value="https://github.com/vnodecg/bixboards" label="Bixboards repository" background="#fff" fill="#000"></bx-qr-code>`,
  ),
  entry(
    'bx-zoomable-frame',
    'Imagery',
    `<bx-zoomable-frame label="Preview" style="inline-size:100%;block-size:14rem"
  srcdoc="<body style='font:16px system-ui;padding:1rem'><h2>Zoomable frame</h2><p>Use the controls to zoom the embedded document.</p></body>"></bx-zoomable-frame>`,
  ),

  // ─── Charts ─────────────────────────────────────────────────────────────────
  entry(
    'bx-chart',
    'Charts',
    `<div style="display:grid;gap:1.5rem;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr))">
  <bx-chart id="line" label="Sales" x="month"><span slot="title">Sales vs cost</span></bx-chart>
  <bx-chart id="bar" label="Sales" type="bar" x="month"></bx-chart>
</div>`,
    `const data = [
  { month: 'Jan', sales: 10, cost: 4 },
  { month: 'Feb', sales: 25, cost: 9 },
  { month: 'Mar', sales: 18, cost: 12 },
  { month: 'Apr', sales: 32, cost: 10 },
];
for (const chart of stage.querySelectorAll('bx-chart')) {
  chart.series = ['sales', 'cost'];
  chart.data = data;
}`,
  ),
  entry(
    'bx-sparkline',
    'Charts',
    `<div style="display:grid;gap:1rem;inline-size:12rem">
  <bx-sparkline label="Line" type="line" values="3,5,4,8,6,9,12"></bx-sparkline>
  <bx-sparkline label="Area" type="area" values="3,5,4,8,6,9,12"></bx-sparkline>
  <bx-sparkline label="Bar" type="bar" values="3,5,4,8,6,9,12"></bx-sparkline>
</div>`,
  ),

  // ─── Data ───────────────────────────────────────────────────────────────────
  entry(
    'bx-data-table',
    'Data',
    `<bx-data-table aria-label="Accounts" selection="multiple" style="block-size:22rem"></bx-data-table>`,
    `const TEAMS = ['Platform', 'Design', 'Growth', 'Support', 'Finance'];
const STATUS = ['Open', 'Review', 'Done'];
const table = stage.querySelector('bx-data-table');
table.columns = [
  { field: 'id', header: 'ID', width: 90, sortable: true },
  { field: 'name', header: 'Name', flex: 1, sortable: true, filter: true },
  { field: 'team', header: 'Team', width: 140, sortable: true },
  { field: 'amount', header: 'Amount', width: 130, align: 'end', sortable: true, render: (r) => '$' + r.amount.toFixed(2) },
  { field: 'status', header: 'Status', width: 120, sortable: true },
];
table.data = Array.from({ length: 100000 }, (_, i) => ({
  id: i,
  name: 'Account ' + (i + 1),
  team: TEAMS[i % TEAMS.length],
  amount: ((i * 7919) % 100000) / 100,
  status: STATUS[i % STATUS.length],
}));`,
    ['bx-column'],
  ),
  entry(
    'bx-data-list',
    'Data',
    `<bx-data-list aria-label="Messages" item-label="title" style="block-size:20rem;border:1px solid var(--bx-border-subtle)"></bx-data-list>`,
    `const WORDS = 'virtualized list item feed inbox gallery message reply thread'.split(' ');
const list = stage.querySelector('bx-data-list');
list.items = Array.from({ length: 100000 }, (_, i) => ({
  id: i,
  title: 'Item ' + (i + 1),
  body: Array.from({ length: 4 + ((i * 7) % 24) }, (_, w) => WORDS[(i + w) % WORDS.length]).join(' '),
}));
list.renderItem = (m) => {
  const div = document.createElement('div');
  div.style.padding = 'var(--bx-space-s) var(--bx-space-m)';
  div.innerHTML = '<strong></strong><div style="color:var(--bx-text-secondary)"></div>';
  div.firstChild.textContent = m.title;
  div.lastChild.textContent = m.body;
  return div;
};`,
  ),
  entry(
    'bx-virtual-tree',
    'Data',
    `<bx-virtual-tree aria-label="Files" selection="multiple" show-guides style="block-size:20rem;border:1px solid var(--bx-border-subtle)"></bx-virtual-tree>`,
    `const tree = stage.querySelector('bx-virtual-tree');
tree.nodes = [{
  id: 'root',
  label: 'Everything',
  children: Array.from({ length: 200 }, (_, b) => ({
    id: 'b' + b,
    label: 'Folder ' + (b + 1),
    children: Array.from({ length: 1000 }, (_, l) => ({ id: 'b' + b + '-l' + l, label: 'File ' + (b + 1) + '.' + (l + 1) })),
  })),
}];
tree.expandedKeys = ['root'];`,
  ),

  // ─── Utilities ──────────────────────────────────────────────────────────────
  entry(
    'bx-animation',
    'Utilities',
    row(`
  ${['bounce', 'fadeIn', 'pulse', 'shake', 'spin', 'zoomIn']
    .map(
      (n) =>
        `<bx-animation name="${n}" play iterations="Infinity" duration="1200"><div style="padding:.5rem .75rem;background:var(--bx-surface-subtle);border-radius:var(--bx-radius-m)">${n}</div></bx-animation>`,
    )
    .join('\n  ')}`),
  ),
  entry(
    'bx-format-bytes',
    'Utilities',
    row(`
  <bx-format-bytes value="512"></bx-format-bytes>
  <bx-format-bytes value="15360"></bx-format-bytes>
  <bx-format-bytes value="5242880"></bx-format-bytes>
  <bx-format-bytes value="3221225472"></bx-format-bytes>`),
  ),
  entry(
    'bx-format-date',
    'Utilities',
    row(`
  <bx-format-date date="2026-09-29" year="numeric" month="short" day="numeric" lang="en-US" time-zone="UTC"></bx-format-date>
  <bx-format-date date="2026-09-29" weekday="long" lang="fr-FR" time-zone="UTC"></bx-format-date>`),
  ),
  entry(
    'bx-format-number',
    'Utilities',
    row(`
  <bx-format-number value="1234567.891" lang="en-US"></bx-format-number>
  <bx-format-number value="1234.5" type="currency" currency="EUR" lang="de-DE"></bx-format-number>
  <bx-format-number value="0.256" type="percent" lang="en-US"></bx-format-number>`),
  ),
  entry(
    'bx-relative-time',
    'Utilities',
    row(`
  <bx-relative-time date="${new Date(Date.UTC(2026, 0, 1)).toISOString()}" lang="en-US"></bx-relative-time>
  <span>·</span>
  <bx-relative-time id="rt-now" sync lang="en-US"></bx-relative-time>`),
    `stage.querySelector('#rt-now').date = new Date(Date.now() - 5 * 60000).toISOString();`,
  ),
  entry(
    'bx-include',
    'Utilities',
    `<bx-include id="inc"></bx-include>`,
    `const src = URL.createObjectURL(new Blob(['<p>This fragment was fetched and inlined.</p>'], { type: 'text/html' }));
stage.querySelector('#inc').src = src;`,
  ),
  entry(
    'bx-intersection-observer',
    'Utilities',
    `<div style="block-size:9rem;overflow-y:auto;border:1px dashed var(--bx-border-subtle);padding:.5rem">
  <p>Scroll down inside this box.</p>
  <div style="block-size:10rem"></div>
  <bx-intersection-observer id="io" intersect-class="seen">
    <div class="io-target" style="padding:1rem;background:var(--bx-surface-subtle);border-radius:var(--bx-radius-m);opacity:.4;transition:opacity .3s">I fade in when visible.</div>
  </bx-intersection-observer>
</div>
<style>bx-intersection-observer.seen .io-target { opacity: 1 !important; }</style>`,
  ),
  entry(
    'bx-mutation-observer',
    'Utilities',
    `<bx-mutation-observer child-list id="mo"><ul id="mo-list" style="margin:0;padding-inline-start:1.25rem"><li>First</li></ul></bx-mutation-observer>
<div style="display:flex;gap:.5rem;align-items:center;margin-block-start:.5rem">
  <bx-button id="mo-add" size="s">Add item</bx-button>
  <span id="mo-log" style="color:var(--bx-text-secondary)">No mutations yet</span>
</div>`,
    `let n = 1;
stage.querySelector('#mo').addEventListener('bx-mutation', (e) => {
  stage.querySelector('#mo-log').textContent = e.detail.mutationList.length + ' mutation(s)';
});
stage.querySelector('#mo-add').addEventListener('click', () => {
  const li = document.createElement('li');
  li.textContent = 'Item ' + ++n;
  stage.querySelector('#mo-list').append(li);
});`,
  ),
  entry(
    'bx-resize-observer',
    'Utilities',
    `<bx-resize-observer id="ro">
  <div style="resize:both;overflow:auto;inline-size:14rem;block-size:6rem;border:1px dashed var(--bx-border-subtle);border-radius:var(--bx-radius-m);padding:.5rem">Drag the bottom-right corner.</div>
</bx-resize-observer>
<div style="margin-block-start:.5rem">Size: <span id="ro-size">—</span></div>`,
    `stage.querySelector('#ro').addEventListener('bx-resize', (e) => {
  const r = e.detail.entries[0].contentRect;
  stage.querySelector('#ro-size').textContent = Math.round(r.width) + ' × ' + Math.round(r.height);
});`,
  ),
];
