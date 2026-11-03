# BoardUI reference: gap analysis

Reference: https://www.boardui.com/ (surveyed 2026-11-04). Approach: **inspired, original**. We mirror structure, categories and theme feel; copy, visuals and template code are our own. BoardUI is React + Tailwind and copy-in; Bixboards is framework-agnostic web components (Lit) with React/Angular/Svelte wrappers.

## 1. Base components

| BoardUI                                                                      | Bixboards status                                     |
| ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| Accordion                                                                    | have: `bx-details`                                   |
| Announcement                                                                 | have: `bx-callout` (banner variant TBD)              |
| Avatar, Badge, Breadcrumb, Button, Button Group, Carousel, Checkbox          | have                                                 |
| Color Picker, Divider, Drawer, Dropdown, Input, Number Field                 | have                                                 |
| Modal                                                                        | have: `bx-dialog`                                    |
| Popover, Radio, Select, Skeleton, Slider, Spinner, Switch, Textarea, Tooltip | have                                                 |
| Progress                                                                     | have: `bx-progress-bar`, `bx-progress-ring`          |
| Table                                                                        | have: `@bixboards/data-table`                        |
| Tabs                                                                         | have: `bx-tab-group`                                 |
| Tree View                                                                    | have: `bx-tree`                                      |
| **Chip / Tag Group**                                                         | **missing**                                          |
| **Close Button**                                                             | **missing** (small; can be `bx-icon-button` variant) |
| **Icon Button**                                                              | **missing**                                          |
| **Link Button**                                                              | **missing** (or `bx-button` href variant)            |
| **Combobox**                                                                 | **missing**                                          |
| **Command Palette**                                                          | **missing**                                          |
| **Context Menu**                                                             | **missing**                                          |
| **Date Calendar / Date Picker / Time Field**                                 | **missing**                                          |
| **File Upload**                                                              | **missing**                                          |
| **Input OTP**                                                                | **missing**                                          |
| **Meter**                                                                    | **missing**                                          |
| **Notification / Toast**                                                     | **missing**                                          |
| **Pagination**                                                               | **missing**                                          |
| **Search Field**                                                             | **missing** (input variant)                          |
| **Segmented Control**                                                        | **missing**                                          |
| **Social Button**                                                            | **missing**                                          |

## 2. Blocks

Sidebar, Stat Cards, Auth Card, Settings Modal, Notification Center, Data Grid, Data Table (partial via data-table). AI-specific blocks (Composer, Agent Progress/Thinking/Limits/Creator, Web Search, Task List, Questionnaire) are out of scope unless requested.

## 3. Charts (19)

None exist. Candidates: Line, Area, Bar List, Radial, Radar, Heatmap, Funnel, Sankey, Scatter, Combo, Contributions. Needs a charting decision (own SVG vs. library).

## 4. Templates (planned, original designs)

Dashboard (home/finance/marketing), Auth (login/signup/settings), Landing, Project Board. Each gets a markdown spec and a test.

## 5. Theme (observed, to be re-derived as Bixboards tokens)

- Two-tier tokens: primitives + semantic (`text-primary`, `background-secondary`, `border`); components use semantic only; dark via root class.
- Neutral scale with blue accent ramp (50..950), dark canvas near `#121212`, OKLCH.
- Inter; 13 composite type styles (Large Title 64/80 down to Caption 2 11/15).
- Pill-shaped controls, rounded cards, motion-forward (spring switch, animated checkbox).
- 8-colour categorical chart ramp.

## 6. Spec status of existing work

All 56 existing core components already have `*.test.ts` and `docs/features/core/*.md`. Spec docs exist for `qr-code`, `split-panel`, `zoomable-frame` with no implementation yet. New components/templates/site will each get a test and a markdown spec.

## 7. Specs written for the gaps

29 proposed components now have feature specs in `docs/features/core/` (indexed in `docs/features/README.md`, tracked in Tier 7 of `IMPLEMENTATION.md`):

- Actions: `icon-button`, `close-button`, `social-button`, `toggle-button`
- Form: `combobox`, `input-otp`, `file-upload`, `search-field`, `segmented-control`, `calendar`, `date-picker`, `time-field`, `tag-input`
- Feedback: `chip`, `meter`, `toast`, `notification-center`, `empty-state`, `stepper`
- Navigation: `pagination`, `sidebar`, `command-palette`, `context-menu`
- Display: `stat-card`, `kbd`, `timeline`, `code-block`
- Charts: `chart` (adapter over a charting library, ECharts by default), `sparkline`

Decisions: BoardUI's **Link Button** is covered by `bx-button` link mode (`href`), **Accordion** by `bx-details`, **Modal** by `bx-dialog`, **Announcement** by `bx-callout`. `avatar-group` already exists. Auth Card and Settings Modal are templates, not components. The AI-specific blocks (Composer, Agent Progress, etc.) remain out of scope.
