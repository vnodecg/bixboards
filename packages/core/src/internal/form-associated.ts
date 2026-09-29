import type { LitElement } from 'lit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = abstract new (...args: any[]) => T;

/**
 * Shape added by {@link FormAssociatedMixin}, for subclasses that need to reference it in their
 * own type positions (e.g. a component-specific interface extending this one).
 */
export declare class FormAssociatedInterface {
  disabled: boolean;
  protected readonly internals: ElementInternals;
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
  setCustomValidity(message: string): void;
}

/**
 * Shared `ElementInternals` plumbing for form-associated custom elements
 * (docs/features/_conventions.md §5) — `bx-input`, `bx-checkbox`, `bx-switch` all need identical
 * `checkValidity`/`reportValidity`/`setCustomValidity` boilerplate and the same
 * `formDisabledCallback` behavior, so it lives here once instead of being copy-pasted three times.
 *
 * A mixin (not a base class) because `BixElement` is already the shared root for every component,
 * including non-form ones — this only applies to the subset that opts in. `Base` is typed as an
 * `abstract new` constructor so `BixElement` itself (abstract) can be passed directly.
 *
 * Subclasses are responsible for: calling `this.internals.setFormValue(...)` and
 * `this.internals.setValidity(...)` whenever their value/required state changes (this mixin can't
 * know what "invalid" means for a checkbox vs. a text input), and for `formResetCallback` /
 * `formStateRestoreCallback` (component-specific: what value a reset/restore sets).
 */
export const FormAssociatedMixin = <T extends Constructor<LitElement>>(
  Base: T,
) => {
  abstract class FormAssociated extends Base {
    static formAssociated = true;

    declare disabled: boolean;

    #internals: ElementInternals;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.#internals = this.attachInternals();
    }

    /** The element's `ElementInternals`, for subclasses to call `setFormValue`/`setValidity`. */
    protected get internals(): ElementInternals {
      return this.#internals;
    }

    get form(): HTMLFormElement | null {
      return this.#internals.form;
    }

    get validity(): ValidityState {
      return this.#internals.validity;
    }

    get validationMessage(): string {
      return this.#internals.validationMessage;
    }

    get willValidate(): boolean {
      return this.#internals.willValidate;
    }

    checkValidity(): boolean {
      return this.#internals.checkValidity();
    }

    reportValidity(): boolean {
      return this.#internals.reportValidity();
    }

    setCustomValidity(message: string): void {
      this.#internals.setValidity(
        message ? { customError: true } : {},
        message || undefined,
      );
    }

    formDisabledCallback(disabled: boolean): void {
      this.disabled = disabled;
    }
  }

  return FormAssociated as unknown as T & Constructor<FormAssociatedInterface>;
};
