import { css, html, nothing, type PropertyValues } from 'lit';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import type { BxRadio } from '../radio/radio.ts';
import { textStyle, textFamily } from '../internal/text-style.ts';

type Orientation = 'horizontal' | 'vertical';
type Size = 'small' | 'medium' | 'large';

let nextId = 0;

/**
 * `<bx-radio-group>` — owns a set of slotted `bx-radio` children: single value, validation, and
 * `label`/`hint` chrome, form-associated via `ElementInternals` (docs/features/core/radio-group.md).
 *
 * Mutual exclusion and arrow-key roving tabindex already work without this element — `bx-radio`
 * self-coordinates by `name` across any connected peers (see that component's own doc comment).
 * This element adds what a bare `name` grouping can't: it assigns `name` to its slotted children
 * so the caller doesn't repeat it on every `bx-radio`, cascades `disabled` downward, tracks the
 * committed `value` from the children's bubbling `input`/`change` events (already `composed`, so
 * a plain `addEventListener` on the host sees them without any re-dispatch), and is itself the
 * form-participant (FR-RADIO-GROUP-01) — child radios opt out of their own form participation
 * while inside a group (see `bx-radio`'s `#syncFormState`) so `FormData` gets one entry, not one
 * per radio. Home/End (FR-RADIO-GROUP-04) is handled here rather than in `bx-radio`: arrow-key
 * movement is peer-to-peer and already lives there, but Home/End needs "first/last member of
 * *this* group", which only the group knows about; `bx-radio`'s own keydown handler ignores those
 * keys and lets them bubble here.
 *
 * @fires input - Value changed by user (bubbles, composed).
 * @fires change - Committed change (bubbles, composed).
 * @fires bx-invalid - Constraint validation failed.
 *
 * @slot (default) - The `bx-radio` members.
 * @slot label - Overrides the `label` attribute's text.
 * @slot hint - Overrides the `hint` attribute's text.
 *
 * @csspart form-control - The outer wrapper (label + radio-group + hint).
 * @csspart label - The label element.
 * @csspart hint - The wrapper around the hint slot.
 * @csspart radio-group - The `role="radiogroup"` wrapper around the default slot.
 * @cssprop --bx-radio-group-gap - Gap of the root surface. Default `var(--bx-space-s)`.
 * @cssprop --bx-radio-group-hint-fg - Text/icon color of the `hint` part. Default `var(--bx-text-secondary)`.
 * @cssprop --bx-radio-group-hint-invalid-fg - Text/icon color of the `hint` part (invalid state). Default `var(--bx-role-danger-fg)`.
 * @cssprop --bx-radio-group-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-radio-group-label-font-family - Font family of the `label` part (text style `label-m`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-radio-group-label-font-size - Font size of the `label` part (text style `label-m`). Default `var(--bx-type-label-m-size)`.
 * @cssprop --bx-radio-group-label-font-weight - Font weight of the `label` part (text style `label-m`). Default `var(--bx-type-label-m-weight)`.
 * @cssprop --bx-radio-group-label-line-height - Line height of the `label` part (text style `label-m`). Default `var(--bx-type-label-m-leading)`.
 * @cssprop --bx-radio-group-label-letter-spacing - Letter spacing of the `label` part (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.
 * @cssprop --bx-radio-group-hint-font-family - Font family of the `hint` part (text style `body-s`). Default `var(--bx-type-body-family)`.
 * @cssprop --bx-radio-group-hint-font-size - Font size of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-size)`.
 * @cssprop --bx-radio-group-hint-font-weight - Font weight of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-weight)`.
 * @cssprop --bx-radio-group-hint-line-height - Line height of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-leading)`.
 * @cssprop --bx-radio-group-hint-letter-spacing - Letter spacing of the `hint` part (text style `body-s`). Default `var(--bx-type-body-s-tracking)`.
 */
export class BxRadioGroup extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-radio-group';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
        ${textFamily('--bx-radio-group', 'body')}
      }

      .label {
        display: block;
        margin-block-end: var(--bx-space-xs);

        ${textStyle('--bx-radio-group-label', 'label-m')}
      }

      .label:empty {
        display: none;
      }

      .radio-group {
        display: flex;
        flex-direction: column;
        gap: var(--bx-radio-group-gap, var(--bx-space-s));
      }

      :host([orientation='horizontal']) .radio-group {
        flex-direction: row;
        flex-wrap: wrap;
        gap: var(--bx-radio-group-gap, var(--bx-space-m));
      }

      @container (max-width: 20rem) {
        :host([orientation='horizontal']) .radio-group {
          flex-direction: column;
        }
      }

      .hint {
        margin-block-start: var(--bx-space-xs);
        color: var(--bx-radio-group-hint-fg, var(--bx-text-secondary));

        ${textStyle('--bx-radio-group-hint', 'body-s')}
      }

      .hint:empty {
        display: none;
      }

      .hint[data-user-invalid] {
        color: var(--bx-radio-group-hint-invalid-fg, var(--bx-role-danger-fg));
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    hint: { type: String },
    name: { type: String },
    value: { type: String },
    orientation: { type: String, reflect: true },
    size: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare label: string;
  declare hint: string;
  declare name: string;
  declare value: string;
  declare orientation: Orientation;
  declare size: Size;
  declare required: boolean;
  declare disabled: boolean;

  #hintId = `bx-radio-group-hint-${nextId++}`;
  #hasInteracted = false;

  constructor() {
    super();
    this.label = '';
    this.hint = '';
    this.name = '';
    this.value = '';
    this.orientation = 'vertical';
    this.size = 'medium';
    this.required = false;
    this.disabled = false;

    this.addEventListener('input', this.#handleMemberInput);
    this.addEventListener('keydown', this.#handleKeydown);
  }

  #members(): BxRadio[] {
    return [...this.querySelectorAll('bx-radio')] as unknown as BxRadio[];
  }

  #applyToMembers(): void {
    // Cascades `disabled` downward like a native `<fieldset disabled>`, but only forces it on: a
    // member individually disabled before the group was doesn't get silently re-enabled when the
    // group later becomes enabled again.
    for (const member of this.#members()) {
      member.name = this.name;
      if (this.disabled) member.disabled = true;
    }
  }

  #handleSlotChange = (): void => {
    this.#applyToMembers();
    this.#syncValueFromMembers();
  };

  #syncValueFromMembers(): void {
    const checked = this.#members().find((member) => member.checked);
    if (checked && checked.value !== this.value) this.value = checked.value;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('name') || changed.has('disabled')) this.#applyToMembers();
    if (changed.has('value') || changed.has('required')) this.#syncFormState();
  }

  #syncFormState(): void {
    this.internals.setFormValue(this.value || null);

    const missing = this.required && !this.value;
    this.internals.setValidity(
      missing ? { valueMissing: true } : {},
      missing ? 'Please select an option.' : undefined,
    );

    if (this.#hasInteracted) {
      this.toggleAttribute('data-user-valid', !missing);
      this.toggleAttribute('data-user-invalid', missing);
    }
  }

  formResetCallback(): void {
    this.value = '';
    this.#hasInteracted = false;
    this.removeAttribute('data-user-valid');
    this.removeAttribute('data-user-invalid');
    for (const member of this.#members()) member.checked = false;
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    this.value = typeof state === 'string' ? state : '';
    for (const member of this.#members())
      member.checked = member.value === this.value;
  }

  override focus(): void {
    const members = this.#members();
    const target =
      members.find((member) => member.checked) ??
      members.find((member) => !member.disabled);
    target?.focus();
  }

  #handleMemberInput = (event: Event): void => {
    const target = event.target;
    if (!target || !this.#members().includes(target as BxRadio)) return;

    this.#hasInteracted = true;
    this.value = (target as BxRadio).value;

    if (!this.internals.checkValidity())
      this.dispatchEvent(
        new CustomEvent('bx-invalid', { bubbles: true, composed: true }),
      );
  };

  // Arrow-key movement and Space selection are handled peer-to-peer by `bx-radio` itself; only
  // Home/End (APG radiogroup pattern) need the group's own notion of "first"/"last" member.
  #handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Home' && event.key !== 'End') return;
    const members = this.#members().filter((member) => !member.disabled);
    if (members.length === 0) return;
    event.preventDefault();

    const target =
      event.key === 'Home' ? members[0]! : members[members.length - 1]!;
    target.focus();
    if (!target.disabled && !target.checked) target.click();
  };

  protected override render() {
    const showLabel = this.label.length > 0;
    const showHint = this.hint.length > 0;

    return html`
      <div class="form-control" part="form-control">
        ${
          showLabel
            ? html`<span
                class="label"
                part="label"
                id=${this.#hintId + '-label'}
                ><slot name="label">${this.label}</slot></span
              >`
            : nothing
        }
        <div
          class="radio-group"
          part="radio-group"
          role="radiogroup"
          aria-required=${this.required}
          aria-disabled=${this.disabled}
          aria-describedby=${showHint ? this.#hintId : nothing}
        >
          <slot @slotchange=${this.#handleSlotChange}></slot>
        </div>
        ${
          showHint
            ? html`<div class="hint" part="hint" id=${this.#hintId}>
                <slot name="hint">${this.hint}</slot>
              </div>`
            : nothing
        }
      </div>
    `;
  }
}
