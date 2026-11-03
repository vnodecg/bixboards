export type ComponentStatus = 'available' | 'planned';

export interface ComponentEntry {
  name: string;
  tag: string;
  category: string;
  status: ComponentStatus;
}

const mk = (category: string, status: ComponentStatus, names: string[]): ComponentEntry[] =>
  names.map((name) => ({
    name,
    tag: `bx-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    category,
    status,
  }));

export const components: ComponentEntry[] = [
  ...mk('Actions', 'available', ['Button', 'Button Group', 'Copy Button']),
  ...mk('Actions', 'planned', ['Icon Button', 'Close Button', 'Link Button', 'Social Button']),
  ...mk('Forms', 'available', [
    'Input',
    'Number Input',
    'Textarea',
    'Checkbox',
    'Radio',
    'Radio Group',
    'Switch',
    'Select',
    'Slider',
    'Rating',
    'Color Picker',
  ]),
  ...mk('Forms', 'planned', [
    'Combobox',
    'Input OTP',
    'File Upload',
    'Search Field',
    'Segmented Control',
    'Date Picker',
    'Time Field',
  ]),
  ...mk('Display', 'available', [
    'Avatar',
    'Badge',
    'Card',
    'Callout',
    'Carousel',
    'Divider',
    'Skeleton',
    'Spinner',
    'Progress Bar',
    'Progress Ring',
    'Tree',
    'Details',
    'Comparison',
  ]),
  ...mk('Display', 'planned', ['Chip', 'Meter']),
  ...mk('Overlays', 'available', ['Dialog', 'Drawer', 'Dropdown', 'Popover', 'Tooltip']),
  ...mk('Overlays', 'planned', ['Toast', 'Notification', 'Command Palette', 'Context Menu']),
  ...mk('Navigation', 'available', ['Breadcrumb', 'Tab Group']),
  ...mk('Navigation', 'planned', ['Pagination', 'Sidebar']),
];

export const templates = [
  { slug: 'dashboard', name: 'Dashboard', blurb: 'KPI tiles, activity feed and a data table.' },
  { slug: 'auth', name: 'Auth & settings', blurb: 'Sign in, sign up and account settings.' },
  { slug: 'landing', name: 'Landing page', blurb: 'Hero, features, pricing and call to action.' },
  { slug: 'board', name: 'Project board', blurb: 'Kanban columns with task cards.' },
] as const;

export const features = [
  {
    title: 'Framework agnostic',
    body: 'Standards-based web components with wrappers for React, Angular and Svelte.',
  },
  {
    title: 'Token driven theming',
    body: 'Semantic tokens compiled from JSON. Switch light, dark or your brand with one attribute.',
  },
  {
    title: 'Accessible by default',
    body: 'Every component is tested with axe and keyboard navigation in a real browser.',
  },
  {
    title: 'Tree-shakeable',
    body: 'Import only the components you use, register under any tag prefix.',
  },
  {
    title: 'Data heavy ready',
    body: 'Virtualized data table and data list for large datasets.',
  },
  {
    title: 'Fully specified',
    body: 'Each component has a written feature spec and a test suite.',
  },
] as const;
