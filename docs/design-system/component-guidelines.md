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

## Definition of done for a component

- [ ] Feature doc requirements implemented and tested
- [ ] Styling uses only design-system tokens (roles for color, fluid tokens for size); no raw colors or px except hairlines
- [ ] Component-level custom properties (`--bx-<component>-*`) default to tokens, and every fg/bg pair the component produces passes 4.5:1 (3:1 for meaningful borders) in every theme, tested with `contrast()`
- [ ] Storybook: Playground, all-variants matrix, states, sizes; usage guidance in docs description
- [ ] Usage guidance written from the template
- [ ] axe clean; keyboard and screen-reader notes recorded
- [ ] Visual regression baselines at scale 0.85 / 1 / 1.25, widths 240 / 480 / 960, light and dark
- [ ] Changelog entry
