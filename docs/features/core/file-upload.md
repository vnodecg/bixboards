# `<bx-file-upload>`

> Drop zone and picker with file list, validation, progress and removal.

|                     |                                                  |
| ------------------- | ------------------------------------------------ |
| **Package**         | `@bixboards/core`                                |
| **Category**        | Form                                             |
| **Tag**             | `bx-file-upload`                                 |
| **Status**          | Implemented                                      |
| **Form-associated** | Yes (ElementInternals)                           |
| **Depends on**      | `button`, `progress-bar`, `format-bytes`, `icon` |

See [conventions](../_conventions.md) for shared rules (tokens, container queries, events, wrappers, virtualization).

## 1. Overview

Drop zone and picker with file list, validation, progress and removal. Specified for the Bixboards token system (fluid sizing, container-query reflow) and enterprise data volumes. Reference: the equivalent component category in BoardUI informed the scope; the API, copy and visuals are original.

## 2. API

### Properties / attributes

| Name        | Type                                    | Default | Description                                   |
| ----------- | --------------------------------------- | ------- | --------------------------------------------- |
| `label`     | string                                  | ""      | -                                             |
| `accept`    | string                                  | ""      | Same grammar as native `accept`.              |
| `multiple`  | boolean                                 | false   | -                                             |
| `max-size`  | number                                  | 0       | Per-file bytes limit (0 = none).              |
| `max-files` | number                                  | 0       | -                                             |
| `directory` | boolean                                 | false   | Folder selection.                             |
| `disabled`  | boolean                                 | false   | -                                             |
| `required`  | boolean                                 | false   | -                                             |
| `files`     | File[] (property)                       | []      | Current selection.                            |
| `upload`    | (file, {onProgress, signal}) => Promise | -       | Optional uploader; enables per-file progress. |

### Slots

| Name        | Description                 |
| ----------- | --------------------------- |
| `(default)` | Drop zone content.          |
| `trigger`   | Replaces the browse button. |
| `file`      | Per-file row template.      |
| `hint`      | Accepted types and limits.  |

### Events

| Event                | Detail / notes                            |
| -------------------- | ----------------------------------------- |
| `change`             | Selection changed (detail.files).         |
| `bx-reject`          | Files failed validation (detail.reasons). |
| `bx-upload-progress` | detail.file, detail.loaded, detail.total. |
| `bx-upload-complete` | -                                         |
| `bx-upload-error`    | -                                         |
| `bx-remove`          | detail.file.                              |

### CSS parts

| Part        | Description        |
| ----------- | ------------------ |
| `dropzone`  | Drop target.       |
| `trigger`   | Browse button.     |
| `file-list` | The list of files. |
| `file`      | One file row.      |

### CSS custom properties

| Property                        | Description             |
| ------------------------------- | ----------------------- |
| `--bx-file-upload-bg`           | Drop zone background.   |
| `--bx-file-upload-border-color` | Drop zone border color. |
| `--bx-file-upload-radius`       | Drop zone radius.       |

### Methods

`focus()`, `browse()`, `clear()`, `remove(file)`, `checkValidity()`

## 3. Functional requirements

- **FR-FILEUPLOAD-01** Form-associated; files are supplied to FormData through `ElementInternals.setFormValue`.
- **FR-FILEUPLOAD-02** Drag-and-drop, paste and click all route through one validation path.
- **FR-FILEUPLOAD-03** Uploads are cancellable via `AbortSignal`; the component never uploads unless `upload` is set.
- **FR-FILEUPLOAD-04** File sizes are displayed with `bx-format-bytes`.

## 4. Fluid scaling

Padding from the space ramp.

All dimensions are expressed via `--bx-space-*`, `--bx-font-*`, `--bx-radius-*` tokens that resolve through `clamp()` and the single `--bx-scale` multiplier. No media queries or fixed px sizes (except 1 px hairlines).

## 5. Container-query behavior

Rows reflow to stacked layout in narrow containers.

## 6. Accessibility

- The drop zone is a labelled button that opens the picker; drag state is also announced; per-file removal buttons carry the file name.
- Meets WCAG 2.2 AA: keyboard operable, visible focus, 4.5:1 text / 3:1 UI contrast, target size ≥ 24 px (44 px on coarse pointers), respects `prefers-reduced-motion` and forced-colors.
- Fully operable at 200% zoom and with user text-spacing overrides without loss of content.

## 7. Performance & reliability

- Render cost O(1) per instance: no work in `connectedCallback` beyond scheduling; observers are created lazily and shared where possible.
- Styles are shared via constructable stylesheets (`adoptedStyleSheets`); no per-instance `<style>` cloning.
- No forced synchronous layout in hot paths; reads and writes are batched.
- Safe to upgrade/define lazily; safe to move between documents and re-connect (no leaked listeners/observers).
- SSR: renders declarative shadow DOM (Lit SSR) without touching browser-only APIs at import time.

## 8. Framework wrapper notes

- React: thin wrapper generated from the custom-elements manifest; props are set as properties, events map to `onBxEvent` handlers, refs forward to the element.
- Angular: standalone directive/component wrapper with `@Input`/`@Output`; ships a `ControlValueAccessor` (`ngModel`, reactive forms).
- Svelte: typed component wrapper exposing props and callback events, and `bind:value`.

## 9. Acceptance criteria

- [ ] All FR-FILEUPLOAD-* requirements covered by unit/component tests (`file-upload.test.ts`, Web Test Runner, real browsers).
- [ ] axe-core: zero violations in every meaningful state; manual screen-reader pass documented.
- [ ] Keyboard-only walkthrough covered by tests.
- [ ] Form integration tests: submit, reset, state restore, `required`/custom validity, disabled/readonly semantics.
- [ ] Light + dark themes and scale 0.85 / 1 / 1.25 verified in Storybook (visual regression once tooling covers it).
- [ ] Wrapper smoke tests (React, Angular, Svelte) render and round-trip props/events.

## 10. Notes and open questions

- Naming prefix is `bx-`; CSS hooks use `--bx-*`.
- Proposed API: confirm names against real usage and the custom-elements manifest during implementation.
