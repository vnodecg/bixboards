import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';

type Size = 'small' | 'medium' | 'large';
type Appearance = 'default' | 'button';

let nextId = 0;

// Page-wide radio groups keyed by `name`, mirroring native `<input type="radio" name="...">`
// mutual-exclusion and roving-tabindex behavior. `bx-radio-group` (Tier 2, docs/features/core/
// radio-group.md) will eventually own this coordination (FR-RADIO-01); until it exists, `bx-radio`
// self-coordinates through the same name-keyed peer-set pattern as `bx-details`'s accordion
// grouping, so standalone use (docs/features/IMPLEMENTATION.md Tier 1 note) already behaves like a
// native radio group.
const groups = new Map<string, Set<BxRadio>>();

function groupMembers(name: string): BxRadio[] {
  return [...(groups.get(name) ?? [])];
}

/**
 * `<bx-radio>` — single option within a radio group, form-associated via `ElementInternals`.
 *
 * Mutual exclusion and roving tabindex are keyed by `name` across all connected instances (see the
 * `groups` map above), the same peer-coordination approach `bx-details` uses for `name`-grouped
 * accordions. `name` and `checked` are not in the spec's own properties table
 * (docs/features/core/radio.md §2) but are required for the element to be usable at all before
 * `bx-radio-group` exists — see that spec's §10 "confirm final property names during
 * implementation", and `bx-details`'s `lazy` attribute for the same kind of gap.
 *
 * `:host` deliberately has no `container-type` — a radio doesn't use `@container` for anything,
 * and, as a flex item inside a `flex-direction: column` group (`bx-radio-group`'s own layout, or
 * a consumer's), `container-type: inline-size` measurably changed the host's own block-size by
 * about 1px depending on `checked` (the checked-icon's presence changing containment's
 * remembered-size bookkeeping), which read as the whole group visibly shifting by a pixel on
 * every selection change. Removed for exactly that reason — don't re-add it without a real
 * `@container` query to justify it.
 *
 * @fires input - Value changed by user (bubbles, composed).
 * @fires change - Committed change (bubbles, composed).
 * @fires bx-invalid - Constraint validation failed.
 *
 * @slot (default) - Label.
 *
 * @csspart base - The outer label wrapper.
 * @csspart control - The circular control.
 * @csspart checked-icon - The filled dot shown when checked.
 * @csspart label - The wrapper around the default slot.
 */
export class BxRadio extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-radio';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        font-family: var(--bx-font-family-sans);
      }

      .base {
        display: inline-flex;
        align-items: flex-start;
        gap: var(--bx-space-xs);
        cursor: pointer;
      }

      :host([disabled]) .base {
        cursor: not-allowed;
        color: var(--bx-text-disabled);
      }

      .control {
        box-sizing: border-box;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--bx-radio-size, calc(var(--bx-unit) * 1.25));
        block-size: var(--bx-radio-size, calc(var(--bx-unit) * 1.25));
        margin: calc(
          (
              var(--bx-target-min, 2.75rem) - var(
                  --bx-radio-size,
                  calc(var(--bx-unit) * 1.25)
                )
            ) /
            2
        );
        border: var(--bx-border-width-strong) solid var(--bx-border-strong);
        border-radius: 50%;
        background: var(--bx-surface-base);
      }

      :host([size='small']) .control {
        --bx-radio-size: var(--bx-unit);
      }
      :host([size='large']) .control {
        --bx-radio-size: calc(var(--bx-unit) * 1.5);
      }

      :host([checked]) .control {
        border-color: var(--bx-role-accent);
      }

      .control:focus-visible {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      :host([disabled]) .control {
        border-color: var(--bx-border-subtle);
        background: var(--bx-surface-subtle);
      }

      .checked-icon {
        inline-size: 55%;
        block-size: 55%;
        border-radius: 50%;
        background: var(--bx-role-accent);
      }

      :host([disabled]) .checked-icon {
        background: var(--bx-text-disabled);
      }

      .label {
        padding-block-start: calc((var(--bx-target-min, 2.75rem) - 1lh) / 2);
        min-block-size: var(--bx-target-min, 2.75rem);
      }

      .label:empty {
        display: none;
      }

      /* Button appearance: the whole element becomes a bordered, selectable pill (FR §5 — wraps
         to multiple lines when its container narrows, since it sits inline like a chip/tag). */
      :host([appearance='button']) .base {
        align-items: center;
        gap: 0;
        min-block-size: var(--bx-target-min, 2.75rem);
        padding-inline: var(--bx-space-m);
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        border-radius: var(--bx-radius-m);
      }

      :host([appearance='button']) .control {
        display: none;
      }

      :host([appearance='button']) .label {
        padding-block-start: 0;
        min-block-size: auto;
      }

      :host([appearance='button'][checked]) .base {
        border-color: var(--bx-role-accent);
        background: var(--bx-role-accent-subtle, var(--bx-surface-subtle));
        color: var(--bx-role-accent);
      }

      :host([appearance='button']) .base:focus-visible,
      :host([appearance='button']:has(.control:focus-visible)) .base {
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: var(--bx-focus-ring-offset);
      }

      :host([appearance='button'][disabled]) .base {
        border-color: var(--bx-border-subtle);
        background: var(--bx-surface-subtle);
      }

      @media (forced-colors: active) {
        .control {
          forced-color-adjust: none;
          border-color: CanvasText;
        }
        :host([checked]) .control {
          border-color: Highlight;
        }
        .checked-icon {
          background: Highlight;
        }
        :host([appearance='button']) .base {
          border-color: CanvasText;
        }
        :host([appearance='button'][checked]) .base {
          border-color: Highlight;
          background: Canvas;
        }
      }
    `,
  ];

  static override properties = {
    name: { type: String },
    value: { type: String },
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    appearance: { type: String, reflect: true },
    size: { type: String, reflect: true },
  };

  declare name: string;
  declare value: string;
  declare checked: boolean;
  declare disabled: boolean;
  declare appearance: Appearance;
  declare size: Size;

  #labelId = `bx-radio-label-${nextId++}`;
  #hasInteracted = false;

  constructor() {
    super();
    this.name = '';
    this.value = 'on';
    this.checked = false;
    this.disabled = false;
    this.appearance = 'default';
    this.size = 'medium';

    this.addEventListener('click', this.#handleActivate);
    this.addEventListener('keydown', this.#handleKeydown);
  }

  static override shadowRootOptions: ShadowRootInit = {
    ...BixElement.shadowRootOptions,
    delegatesFocus: true,
  };

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.name) this.#joinGroup(this.name);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.name) this.#leaveGroup(this.name);
  }

  #joinGroup(name: string): void {
    let set = groups.get(name);
    if (!set) {
      set = new Set();
      groups.set(name, set);
    }
    set.add(this);
  }

  #leaveGroup(name: string): void {
    const set = groups.get(name);
    if (!set) return;
    set.delete(this);
    if (set.size === 0) groups.delete(name);
  }

  #uncheckGroupSiblings(): void {
    if (!this.name) return;
    for (const other of groupMembers(this.name))
      if (other !== this) other.checked = false;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('name')) {
      const previous = changed.get('name');
      if (previous) this.#leaveGroup(previous);
      if (this.name) this.#joinGroup(this.name);
    }
    if (changed.has('checked')) this.#syncFormState();
  }

  #syncFormState(): void {
    // A `bx-radio-group` ancestor (docs/features/core/radio-group.md) owns form participation for
    // its members — it tracks the checked child's value itself, so a radio inside one skips
    // `setFormValue` to avoid two `FormData` entries under the same `name`.
    if (!this.closest('bx-radio-group'))
      this.internals.setFormValue(this.checked ? this.value : null);
    if (this.checked) this.#uncheckGroupSiblings();

    if (this.#hasInteracted) {
      this.toggleAttribute('data-user-valid', true);
      this.removeAttribute('data-user-invalid');
    }
  }

  formResetCallback(): void {
    this.checked = false;
    this.#hasInteracted = false;
    this.removeAttribute('data-user-valid');
    this.removeAttribute('data-user-invalid');
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    this.checked = state === this.value;
  }

  #select(): void {
    if (this.disabled || this.checked) return;
    this.checked = true;
    this.#hasInteracted = true;

    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    if (!this.internals.checkValidity())
      this.dispatchEvent(
        new CustomEvent('bx-invalid', { bubbles: true, composed: true }),
      );
  }

  #handleActivate = (): void => this.#select();

  // APG radio-group pattern: arrow keys move focus AND selection among same-name peers, wrapping
  // at the ends; Space selects the currently focused radio without moving focus.
  #handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;

    if (event.key === ' ') {
      event.preventDefault();
      this.#select();
      return;
    }

    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    if (!forward && !backward) return;
    event.preventDefault();

    const members = groupMembers(this.name).filter(
      (member) => !member.disabled,
    );
    if (members.length < 2) return;
    const index = members.indexOf(this);
    if (index === -1) return;
    const nextIndex = forward
      ? (index + 1) % members.length
      : (index - 1 + members.length) % members.length;
    const next = members[nextIndex]!;
    next.focus();
    next.#select();
  };

  protected override render() {
    // Roving tabindex: the checked radio is reachable by Tab; if none is checked yet, the first
    // enabled member of the group is, so an empty group is still keyboard-discoverable.
    const members = this.name ? groupMembers(this.name) : [];
    const isTabStop =
      this.checked ||
      (!members.some((member) => member.checked) && members[0] === this);

    return html`
      <div class="base" part="base">
        <span
          class="control"
          part="control"
          role="radio"
          tabindex=${this.disabled ? -1 : isTabStop ? 0 : -1}
          aria-checked=${this.checked}
          aria-disabled=${this.disabled}
          aria-labelledby=${this.#labelId}
        >
          ${this.checked ? html`<span class="checked-icon" part="checked-icon"></span>` : nothing}
        </span>
        <span class="label" part="label" id=${this.#labelId}
          ><slot></slot
        ></span>
      </div>
    `;
  }
}
