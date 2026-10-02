# Component guidelines

> **Not part of the design system.** The design system is tokens and theming; this page is a template for when component work starts, so components use the tokens consistently.

Each component has two documents: the feature document ([features](../features/README.md)) defines behavior, API and appearance options, and the usage guidance (this template) explains when and how to use it. Usage guidance appears as the Storybook docs description for the component.

## Template

```md
# <Component>

## When to use

- One or two sentences on the job it does.

## When not to use

- Alternatives ("For choosing between 2–4 options use radio group").

## Anatomy

1. Container 2. Label 3. Icon (optional) …

## Variants

| Attribute  | Values                                       | Guidance                                               |
| ---------- | -------------------------------------------- | ------------------------------------------------------ |
| appearance | accent, filled, outlined, plain              | accent = primary emphasis; at most one per view region |
| variant    | default, secondary, tertiary, error, warning | Semantic intent, not decoration                        |
| size       | small, medium, large                         | Match surrounding density                              |

## States

default, hover, active, focus, disabled (+ loading, invalid, checked where relevant). Show each once.

## Content

Label length, capitalization, truncation, empty and error text.

## Behavior

Keyboard model, focus management, responsive/container behavior.

## Accessibility

Role, name, states announced, contrast, target size, motion.

## Do / Don't

Two or three pairs with pictures (Storybook stories).
```

## Example: Button

**When to use.** Trigger an action or navigate. Use one `accent` button per region for the primary action; use `outlined` or `plain` for secondary actions.

**When not to use.** For navigation that is part of running text, use a link. For toggling state use a switch or checkbox.

**Variants.** `appearance`: accent, filled, outlined, plain. `variant`: default, secondary, tertiary, error, warning (error only for destructive or irreversible actions). `size`: small, medium (default), large.

**Content.** Verb-first, sentence case, 1–3 words. Icon-only buttons need an accessible name and a tooltip.

**Behavior.** Space/Enter activate; loading keeps width; disabled buttons are removed from the tab order and explained nearby when the reason is not obvious.

**Accessibility.** Focus ring color `focus.ring`, offset `focus.ring-offset`; touch target ≥ 44 px on coarse pointers; contrast of `role.<variant>.on-solid` on `role.<variant>.solid` (and its hover/active steps) ≥ 4.5:1 in every theme (guaranteed by the design system's build-time checks, provided the component uses roles).

**Look.** `outlined`/`plain` (bordered or borderless, no fill) read as shadcn-style secondary/ghost buttons and should be reached for over `filled` by default; reserve `accent`/`filled` for the one primary action per region. `radius.m` by default; a shadow only if the button visually floats (rare).

## Styling API (component hooks)

Complete appearance is customizable with CSS variables, at three levels (least to most invasive; use the lowest that works): a **theme** changes tokens for everything; a **region** sets `--bx-*` tokens or hooks on a wrapper; a **component hook** (`--bx-<component>-*`) restyles one component without forking it. Hooks are the public styling API, alongside `::part()` and slots.

**Naming.** `--bx-<tag>-[<part>-][<state>-]<property>`, where `<tag>` is the tag without `bx-`, `<part>` is the `part` name (omitted for the root surface / `base`), and `<state>` is one of `hover`, `active`, `focus`, `disabled`, `checked`, `selected`, `open`, `invalid`, … A semantic variant gets its own name rather than sharing the base one (`--bx-textarea-count-over-limit-fg`, `--bx-dropdown-item-error-fg`), so overriding the generic hook never recolors a danger state. Pseudo-elements are named for what they draw (`handle-knob`, `drop-indicator`), not `before`/`after`. An icon inside a control is `<part>-icon-size`; a pointer hit area is `<part>-hit-size`; never let one hook size two different elements.

**Vocabulary.** `bg`, `fg`, `border-color`, `border-width`, `radius`, `shadow`, `padding` (`-inline`/`-block`/`-*-start|end`), `gap`, `font-size`, `font-weight`, `line-height`, `width`/`height`/`min-height`/`size`, `icon-size`, `focus-ring-color`/`-width`/`-offset`, `opacity`.

**Defaults.** The fallback is a design-system token (or a fluid-unit expression): `var(--bx-button-radius, var(--bx-radius-m))`. Never a raw color, `px`, duration or global-scale `z-index`, and never a raw fallback behind a token (tokens are a hard dependency; `tokens.css` is loaded in every test page). Hairlines (1px), font-relative `em` icon sizes, viewport units and `@container` thresholds (custom properties are not allowed in container conditions, so use `rem`) are the exceptions; intrinsic color-space data (a hue ramp) is marked `ds-exempt: <reason>`.

**Never shadow a hook.** A hook is read with `var(--bx-x, <default>)`. Do not redeclare `--bx-x` on an element inside the shadow tree (for example in a `[size='small']` rule): that silently beats what the consumer set on the host. Variants set a private property instead, and the hook sits in front of it:

```css
:host([size='small']) {
  --_height: var(--bx-control-height-s);
}
.base {
  min-block-size: var(--bx-input-height, var(--_height));
}
```

Script-written runtime state (a fill percentage, a thumb position) is likewise a private `--_*` property, not a hook.

**Typography.** Text in a component comes from a design-system text style (see Foundations → Typography), through the shared helper in `packages/core/src/internal/text-style.ts`:

```ts
.title { ${textStyle('--bx-dialog-title', 'heading-s')} }   /* font-family, size, weight, line-height, letter-spacing */
:host  { ${textFamily('--bx-dialog', 'body')} }              /* family only, for hosts that inherit the rest */
```

The helper emits the five font declarations, each a hook (`--bx-dialog-title-font-family`, `-font-size`, `-font-weight`, `-line-height`, `-letter-spacing`) that defaults to the style's token. Pick the style by the _kind_ of text (a form label is `label-s`, a hint is `body-s`, a typed value is `field-m`), not by the size you happen to want. Where a size isn't a type step (an avatar's initials scale with their container), pass an override: `textStyle(hook, 'heading-xs', { size: '40cqi' })`. Using `--bx-font-*` tokens or literal font values in a component is rejected by the audit.

**Documentation.** Every hook is a `@cssprop` in the class JSDoc and every `part` a `@csspart`; the feature doc's tables are generated from them (`pnpm generate`).

**Enforcement.** `pnpm audit:design-system` (static: raw values, naming, shadowing, JSDoc drift), `packages/core/src/internal/css-hooks.test.ts` (runtime: every documented base-state hook visibly changes its component; the few it cannot exercise are listed with reasons) and `pnpm generate:check` all run in `pnpm check`.

**Recursive components.** Custom properties inherit, so a hook set on one `bx-tree-item` also reaches nested items; set hooks on the container (`bx-tree`) or scope with a selector.

## Definition of done for a component

- [ ] Feature doc requirements implemented and tested
- [ ] Styling uses only design-system tokens (roles for color, fluid tokens for size); no raw colors or px except hairlines
- [ ] Every themeable surface is a documented `--bx-<component>-*` hook per the Styling API above; `pnpm audit:design-system` and the hook-contract test pass
- [ ] Component-level custom properties (`--bx-<component>-*`) default to tokens, and every fg/bg pair the component produces passes 4.5:1 (3:1 for meaningful borders) in every theme, tested with `contrast()`
- [ ] Storybook: Playground, all-variants matrix, states, sizes; usage guidance in docs description
- [ ] Usage guidance written from the template
- [ ] axe clean; keyboard and screen-reader notes recorded
- [ ] Visual regression baselines at scale 0.85 / 1 / 1.25, widths 240 / 480 / 960, light and dark
- [ ] Changelog entry
