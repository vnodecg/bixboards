# Principles

Ordered by priority. When two conflict, the earlier one wins.

1. **Accessible by default.** Contrast, focus, keyboard, target size, reduced motion and forced colors are part of the definition of done, not a later pass. Users cannot opt out of accessibility, so components cannot make it optional.
2. **Adapts to its space.** Components respond to the container they are in, not the viewport. One scale token (`--bx-scale`) rescales everything; no breakpoints in component code.
3. **Correct at scale.** Enterprise data (100k+ rows, options, nodes) must not degrade layout, performance or accessibility. Virtualization is a built-in capability, not an add-on.
4. **Tokens, not values.** Every visual decision is a token. If a component needs a value that has no token, add the token first.
5. **One way to do it.** Prefer a small set of consistent variants (`appearance`, `variant`, `size`) over per-component options. New options need a reason that applies to more than one component.
6. **Themeable, not forkable.** Brands change seeds and semantic tokens. If a brand needs to change a component's structure, that is a component feature, not a theme.
7. **Native first.** Use platform features (`<dialog>`, Popover API, container queries, `ElementInternals`, `:focus-visible`) and degrade gracefully where support is partial.
8. **Small and predictable.** Tree-shakable per component, no work at import, no hidden global side effects.

## Voice and content

- Labels are short, sentence case, verb-first for actions ("Save changes", not "OK").
- Error text says what happened and what to do next; never rely on color alone.
- Components ship no user-facing strings without a localization hook.
