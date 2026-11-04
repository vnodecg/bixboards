import { css, html, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { observeResize } from '../internal/shared-observers.ts';

/**
 * `<bx-split-panel>` — two resizable panels with a draggable divider
 * (docs/features/core/split-panel.md).
 *
 * The divider is a focusable `role="separator"` (the ARIA window-splitter pattern) with
 * `aria-valuenow` as a percent: arrows move by 1% (10% with Shift), Home/End jump to the limits,
 * and Enter toggles between the limits and the last position. Dragging uses pointer capture
 * (FR-SPLIT-PANEL-01); `snap` (e.g. `"25% 50% 75%"` or `"200px"`) pulls the divider to a point
 * within `snap-threshold` px. `position` is a percent of the panel area, `position-in-pixels` the
 * same in px (the latest one set wins). `primary` keeps that panel's pixel size when the container
 * resizes, via the shared `ResizeObserver` (FR-SPLIT-PANEL-02). `storage-key` persists the position
 * in `localStorage` (guarded). Limits come from `--bx-split-panel-min` / `--bx-split-panel-max`
 * (lengths, applied to the start panel).
 *
 * @fires bx-reposition - The position changed. `detail.position` (percent), `detail.pixels`.
 *
 * @slot start - First panel.
 * @slot end - Second panel.
 * @slot divider - Custom divider handle content.
 *
 * @csspart start - The start panel.
 * @csspart end - The end panel.
 * @csspart panel - Either panel.
 * @csspart divider - The divider.
 *
 * @cssprop --bx-split-panel-divider-width - Divider width. Default `max(var(--bx-space-3xs), 2px)`.
 * @cssprop --bx-split-panel-min - Minimum start-panel size. Default `0px`.
 * @cssprop --bx-split-panel-max - Maximum start-panel size. Default `100%`.
 */
export class BxSplitPanel extends BixElement {
  static override tagName = 'bx-split-panel';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        --_div: var(
          --bx-split-panel-divider-width,
          max(var(--bx-space-3xs), 2px)
        );
        display: grid;
        inline-size: 100%;
        block-size: 100%;
        min-block-size: 0;
        min-inline-size: 0;
        grid-template-columns:
          clamp(
            var(--bx-split-panel-min, 0px),
            calc((100% - var(--_div)) * var(--_pos, 50) / 100),
            min(var(--bx-split-panel-max, 100%), calc(100% - var(--_div)))
          )
          var(--_div) minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr);
      }
      :host([orientation='vertical']) {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows:
          clamp(
            var(--bx-split-panel-min, 0px),
            calc((100% - var(--_div)) * var(--_pos, 50) / 100),
            min(var(--bx-split-panel-max, 100%), calc(100% - var(--_div)))
          )
          var(--_div) minmax(0, 1fr);
      }
      .panel {
        min-inline-size: 0;
        min-block-size: 0;
        overflow: auto;
      }
      .divider {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bx-border-subtle);
        cursor: col-resize;
        touch-action: none;
        outline: none;
      }
      :host([orientation='vertical']) .divider {
        cursor: row-resize;
      }
      /* The visible line is thin; the hit area is at least 12px and grows with the type scale. */
      .divider::before {
        content: '';
        position: absolute;
        inset-block: 0;
        inset-inline: calc((max(0.75rem, var(--_div)) - var(--_div)) / -2);
      }
      :host([orientation='vertical']) .divider::before {
        inset-inline: 0;
        inset-block: calc((max(0.75rem, var(--_div)) - var(--_div)) / -2);
      }
      .divider:hover,
      .divider[data-dragging] {
        background: var(--bx-role-brand-solid);
      }
      .divider:focus-visible {
        background: var(--bx-role-brand-solid);
        outline: var(--bx-border-width-strong) solid var(--bx-focus-ring);
        outline-offset: 1px;
      }
      :host([disabled]) .divider {
        cursor: default;
        pointer-events: none;
        opacity: 0.5;
      }
      @media (forced-colors: active) {
        .divider {
          background: CanvasText;
        }
        .divider:focus-visible {
          background: Highlight;
        }
      }
    `,
  ];

  static override properties = {
    position: { type: Number },
    positionInPixels: { type: Number, attribute: 'position-in-pixels' },
    orientation: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    primary: { type: String },
    snap: { type: String },
    snapThreshold: { type: Number, attribute: 'snap-threshold' },
    storageKey: { type: String, attribute: 'storage-key' },
    label: { type: String },
    _dragging: { state: true },
  };

  declare position: number;
  declare positionInPixels?: number;
  declare orientation: 'horizontal' | 'vertical';
  declare disabled: boolean;
  declare primary?: 'start' | 'end';
  declare snap?: string;
  declare snapThreshold: number;
  declare storageKey: string;
  declare label: string;
  /** @internal */
  declare _dragging: boolean;

  #dividerRef = createRef<HTMLElement>();
  #unobserve?: () => void;
  #lastExpanded = 50;
  /** Panel-area length (container minus divider) at the last layout, in px. */
  #area = 0;
  #announced = NaN;

  constructor() {
    super();
    this.position = 50;
    this.orientation = 'horizontal';
    this.disabled = false;
    this.snapThreshold = 12;
    this.storageKey = '';
    this.label = 'Resize panels';
    this._dragging = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.storageKey) {
      try {
        const saved = Number(localStorage.getItem(this.storageKey));
        if (
          localStorage.getItem(this.storageKey) !== null &&
          Number.isFinite(saved)
        )
          this.position = Math.min(Math.max(saved, 0), 100);
      } catch {
        /* storage unavailable */
      }
    }
    this.#unobserve = observeResize(this, () => this.#onResize());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unobserve?.();
  }

  get #vertical(): boolean {
    return this.orientation === 'vertical';
  }

  #measure(): number {
    const rect = this.getBoundingClientRect();
    const divider = this.#dividerRef.value;
    const d = divider
      ? this.#vertical
        ? divider.offsetHeight
        : divider.offsetWidth
      : 0;
    return Math.max((this.#vertical ? rect.height : rect.width) - d, 1);
  }

  #onResize(): void {
    const area = this.#measure();
    if (this.#area && area !== this.#area && this.primary) {
      // Keep the primary panel's pixel size: recompute the percent from the old pixel size.
      const startPx = (this.position / 100) * this.#area;
      const px = this.primary === 'start' ? startPx : this.#area - startPx;
      const next =
        this.primary === 'start' ? (px / area) * 100 : 100 - (px / area) * 100;
      this.#area = area;
      this.#set(Math.min(Math.max(next, 0), 100), false);
      return;
    }
    this.#area = area;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (
      changed.has('positionInPixels') &&
      this.positionInPixels !== undefined
    ) {
      const area = this.#area || this.#measure();
      this.position = Math.min(
        Math.max((this.positionInPixels / area) * 100, 0),
        100,
      );
    }
    this.position = Math.min(Math.max(Number(this.position) || 0, 0), 100);
  }

  protected override updated(changed: PropertyValues<this>): void {
    this.style.setProperty('--_pos', String(this.position));
    if (!this.#area) this.#area = this.#measure();
    if (changed.has('position') && changed.get('position') !== undefined) {
      if (this.position > 0 && this.position < 100)
        this.#lastExpanded = this.position;
      if (this.position !== this.#announced) {
        this.#announced = this.position;
        this.dispatchEvent(
          new CustomEvent('bx-reposition', {
            bubbles: true,
            composed: true,
            detail: {
              position: this.position,
              pixels: (this.position / 100) * this.#area,
            },
          }),
        );
      }
      if (this.storageKey) {
        try {
          localStorage.setItem(this.storageKey, String(this.position));
        } catch {
          /* storage unavailable */
        }
      }
    }
  }

  /** Parses `snap` into percents, using the current panel-area length for px values. */
  #snapPoints(): number[] {
    if (!this.snap) return [];
    const area = this.#area || this.#measure();
    return this.snap
      .split(/\s+/)
      .filter(Boolean)
      .map((p) =>
        p.endsWith('%')
          ? parseFloat(p)
          : p.endsWith('px')
            ? (parseFloat(p) / area) * 100
            : NaN,
      )
      .filter((n) => Number.isFinite(n));
  }

  #set(value: number, snap = true): void {
    let next = Math.min(Math.max(value, 0), 100);
    if (snap) {
      const area = this.#area || this.#measure();
      for (const point of this.#snapPoints()) {
        if (Math.abs(((point - next) / 100) * area) <= this.snapThreshold) {
          next = point;
          break;
        }
      }
    }
    this.position = next;
  }

  // --- interaction -----------------------------------------------------------------------------

  #onPointerDown = (event: PointerEvent): void => {
    if (this.disabled || event.button !== 0) return;
    const divider = this.#dividerRef.value!;
    divider.setPointerCapture(event.pointerId);
    this._dragging = true;
    event.preventDefault();
    divider.focus();
  };

  #onPointerMove = (event: PointerEvent): void => {
    if (!this._dragging) return;
    const rect = this.getBoundingClientRect();
    const area = this.#measure();
    const d =
      (this.#dividerRef.value![
        this.#vertical ? 'offsetHeight' : 'offsetWidth'
      ] as number) / 2;
    const rtl = !this.#vertical && getComputedStyle(this).direction === 'rtl';
    let offset = this.#vertical
      ? event.clientY - rect.top
      : rtl
        ? rect.right - event.clientX
        : event.clientX - rect.left;
    offset -= d;
    this.#area = area;
    this.#set((offset / area) * 100);
  };

  #onPointerUp = (event: PointerEvent): void => {
    if (!this._dragging) return;
    this._dragging = false;
    this.#dividerRef.value?.releasePointerCapture(event.pointerId);
  };

  #onKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    const step = event.shiftKey ? 10 : 1;
    const grow = this.#vertical ? 'ArrowDown' : 'ArrowRight';
    const shrink = this.#vertical ? 'ArrowUp' : 'ArrowLeft';
    const rtl = !this.#vertical && getComputedStyle(this).direction === 'rtl';
    let next: number | undefined;
    switch (event.key) {
      case grow:
        next = this.position + (rtl ? -step : step);
        break;
      case shrink:
        next = this.position - (rtl ? -step : step);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = 100;
        break;
      case 'Enter':
        next =
          this.position > 0 && this.position < 100
            ? ((this.#lastExpanded = this.position), 0)
            : this.#lastExpanded;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.#set(next, false);
  };

  protected override render() {
    return html`
      <div
        class="panel"
        part="panel start"
        style="grid-area: ${this.#vertical ? '1 / 1' : '1 / 1'}"
      >
        <slot name="start"></slot>
      </div>
      <div
        ${ref(this.#dividerRef)}
        class="divider"
        part="divider"
        role="separator"
        tabindex=${this.disabled ? '-1' : '0'}
        aria-label=${this.label}
        aria-orientation=${this.#vertical ? 'horizontal' : 'vertical'}
        aria-valuenow=${Math.round(this.position)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-disabled=${this.disabled ? 'true' : 'false'}
        ?data-dragging=${this._dragging}
        style="grid-area: ${this.#vertical ? '2 / 1' : '1 / 2'}"
        @pointerdown=${this.#onPointerDown}
        @pointermove=${this.#onPointerMove}
        @pointerup=${this.#onPointerUp}
        @pointercancel=${this.#onPointerUp}
        @keydown=${this.#onKeydown}
      >
        <slot name="divider"></slot>
      </div>
      <div
        class="panel"
        part="panel end"
        style="grid-area: ${this.#vertical ? '3 / 1' : '1 / 3'}"
      >
        <slot name="end"></slot>
      </div>
    `;
  }
}
