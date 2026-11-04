import { css, html, nothing } from 'lit';
import { BixElement } from '../bix-element.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

type Platform = 'auto' | 'mac' | 'windows';

interface Glyph {
  mac: string;
  other: string;
  /** Spoken name for assistive tech. */
  name: string;
}

const KEYS: Record<string, Glyph> = {
  mod: { mac: '⌘', other: 'Ctrl', name: 'Command' },
  cmd: { mac: '⌘', other: 'Win', name: 'Command' },
  ctrl: { mac: '⌃', other: 'Ctrl', name: 'Control' },
  alt: { mac: '⌥', other: 'Alt', name: 'Alt' },
  option: { mac: '⌥', other: 'Alt', name: 'Option' },
  shift: { mac: '⇧', other: 'Shift', name: 'Shift' },
  enter: { mac: '↩', other: 'Enter', name: 'Enter' },
  return: { mac: '↩', other: 'Enter', name: 'Enter' },
  esc: { mac: 'Esc', other: 'Esc', name: 'Escape' },
  escape: { mac: 'Esc', other: 'Esc', name: 'Escape' },
  tab: { mac: '⇥', other: 'Tab', name: 'Tab' },
  space: { mac: 'Space', other: 'Space', name: 'Space' },
  backspace: { mac: '⌫', other: 'Backspace', name: 'Backspace' },
  delete: { mac: '⌦', other: 'Del', name: 'Delete' },
  up: { mac: '↑', other: '↑', name: 'Up arrow' },
  down: { mac: '↓', other: '↓', name: 'Down arrow' },
  left: { mac: '←', other: '←', name: 'Left arrow' },
  right: { mac: '→', other: '→', name: 'Right arrow' },
};

/** Parses `mod+shift+k` into its parts (exported for tests and `bx-command-palette`). */
export function parseChord(
  chord: string,
  isMac: boolean,
): { glyph: string; name: string }[] {
  return chord
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const known = KEYS[part.toLowerCase()];
      if (known)
        return { glyph: isMac ? known.mac : known.other, name: known.name };
      const glyph = part.length === 1 ? part.toUpperCase() : part;
      return { glyph, name: glyph };
    });
}

/**
 * `<bx-kbd>` — keyboard shortcut display (docs/features/core/kbd.md).
 *
 * `keys="mod+shift+k"` renders one native `<kbd>` per key (FR-KBD-01); `mod` is ⌘ on Apple
 * platforms and Ctrl elsewhere, and named keys (Esc, Enter, arrows, ...) get glyphs. Platform
 * detection runs in `connectedCallback`, never at import (FR-KBD-03). The whole chord is a single
 * `role="img"` whose label spells the keys out, so screen readers do not read glyph soup. Without
 * `keys`, the default slot is shown as a literal text alternative. Key names are English; the
 * localization registry the spec mentions does not exist yet.
 *
 * @slot (default) - Literal text alternative, used when `keys` is empty.
 *
 * @csspart base - The wrapper around the chord.
 * @csspart key - A single key cap.
 * @csspart separator - The separator between key caps.
 *
 * @cssprop --bx-kbd-bg - Key cap background.
 * @cssprop --bx-kbd-border-color - Key cap border color.
 * @cssprop --bx-kbd-gap - Gap between key caps. Default `var(--bx-space-3xs)`.
 */
export class BxKbd extends BixElement {
  static override tagName = 'bx-kbd';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: inline-block;
        ${textFamily('--bx-kbd', 'code')}
      }
      .base {
        display: inline-flex;
        align-items: center;
        gap: var(--bx-kbd-gap, var(--bx-space-3xs));
      }
      kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        min-inline-size: 1.75em;
        padding-inline: 0.4em;
        border: var(--bx-border-width) solid
          var(--bx-kbd-border-color, var(--bx-border-subtle));
        border-block-end-width: 2px;
        border-radius: var(--bx-radius-s);
        background: var(--bx-kbd-bg, var(--bx-surface-subtle));
        color: var(--bx-text-primary);
        ${textStyle('--bx-kbd', 'code-s')}
      }
      :host([size='s']) kbd {
        font-size: 0.85em;
      }
      .separator {
        color: var(--bx-text-secondary);
      }
    `,
  ];

  static override properties = {
    keys: { type: String },
    platform: { type: String },
    size: { type: String, reflect: true },
    _isMac: { state: true },
  };

  declare keys: string;
  declare platform: Platform;
  declare size: 's' | 'm';
  /** @internal */
  declare _isMac: boolean;

  constructor() {
    super();
    this.keys = '';
    this.platform = 'auto';
    this.size = 'm';
    this._isMac = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    const nav = globalThis.navigator as
      (Navigator & { userAgentData?: { platform?: string } }) | undefined;
    const platform = nav?.userAgentData?.platform ?? nav?.platform ?? '';
    this._isMac = /mac|iphone|ipad|ipod/i.test(platform);
  }

  protected override render() {
    if (!this.keys)
      return html`<span class="base" part="base"><slot></slot></span>`;
    const isMac =
      this.platform === 'mac'
        ? true
        : this.platform === 'windows'
          ? false
          : this._isMac;
    const parts = parseChord(this.keys, isMac);
    return html`<span
      class="base"
      part="base"
      role="img"
      aria-label=${parts.map((p) => p.name).join(' ')}
      >${parts.map(
        (p, i) =>
          html`${
              i > 0
                ? html`<span
                    class="separator"
                    part="separator"
                    aria-hidden="true"
                    >+</span
                  >`
                : nothing
            }<kbd part="key" aria-hidden="true">${p.glyph}</kbd>`,
      )}</span
    >`;
  }
}
