import { css, html, nothing, type PropertyValues } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { BixElement } from '../bix-element.ts';
import { FormAssociatedMixin } from '../internal/form-associated.ts';
import { textFamily, textStyle } from '../internal/text-style.ts';

export type RejectReason = 'type' | 'size' | 'count';
export interface Rejection {
  file: File;
  reason: RejectReason;
}
export type Uploader = (
  file: File,
  context: {
    onProgress: (loaded: number, total: number) => void;
    signal: AbortSignal;
  },
) => Promise<unknown>;

type Status = 'ready' | 'uploading' | 'done' | 'error';
interface Entry {
  file: File;
  status: Status;
  loaded: number;
  total: number;
  error?: string;
  controller?: AbortController;
}

/** Whether `file` satisfies a native-`accept`-style list (`.pdf,image/*,text/plain`). */
export function matchesAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return rules.some((rule) =>
    rule.startsWith('.')
      ? name.endsWith(rule)
      : rule.endsWith('/*')
        ? type.startsWith(rule.slice(0, -1))
        : type === rule,
  );
}

let nextId = 0;

/**
 * `<bx-file-upload>` — drop zone and picker with a file list (docs/features/core/file-upload.md).
 *
 * Browse, drag-and-drop and paste all route through one validation path (FR-FILEUPLOAD-02):
 * `accept`, `max-size`, `max-files` and `multiple`; refused files are reported once through
 * `bx-reject` (`detail.reasons`) and never enter the list. Form-associated: the files are put in
 * the form's `FormData` under `name` via `ElementInternals` (FR-FILEUPLOAD-01). Nothing is uploaded
 * unless the `upload` property is set; then every accepted file starts uploading, shows
 * `bx-progress-bar` progress, and removing the row aborts it through an `AbortSignal`
 * (FR-FILEUPLOAD-03). Sizes use `bx-format-bytes` (FR-FILEUPLOAD-04). The per-file `file` slot
 * template and `directory` selection are limited: `directory` sets `webkitdirectory`, and the
 * `file` slot is not implemented.
 *
 * @fires change - Selection changed. `detail.files`.
 * @fires bx-reject - Files failed validation. `detail.reasons`.
 * @fires bx-upload-progress - `detail.file`, `detail.loaded`, `detail.total`.
 * @fires bx-upload-complete - A file finished uploading. `detail.file`.
 * @fires bx-upload-error - A file failed to upload. `detail.file`, `detail.error`.
 * @fires bx-remove - A file was removed. `detail.file`.
 *
 * @slot (default) - Drop zone content.
 * @slot trigger - Replaces the browse button.
 * @slot hint - Accepted types and limits.
 *
 * @csspart dropzone - Drop target.
 * @csspart trigger - Browse button.
 * @csspart trigger-wrap - Wrapper around the `trigger` slot.
 * @csspart file-list - The list of files.
 * @csspart file - One file row.
 *
 * @cssprop --bx-file-upload-bg - Drop zone background.
 * @cssprop --bx-file-upload-border-color - Drop zone border color.
 * @cssprop --bx-file-upload-radius - Drop zone radius.
 * @cssprop --bx-file-upload-font-family - Font family of the root surface. Default `var(--bx-type-body-family)`.
 * @cssprop --bx-file-upload-hint-font-family - Font family of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.
 * @cssprop --bx-file-upload-hint-font-size - Font size of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.
 * @cssprop --bx-file-upload-hint-font-weight - Font weight of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.
 * @cssprop --bx-file-upload-hint-line-height - Line height of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.
 * @cssprop --bx-file-upload-hint-letter-spacing - Letter spacing of the `hint` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`.
 * @cssprop --bx-file-upload-label-font-family - Font family of the `label` text (text style `label-m`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-file-upload-label-font-size - Font size of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-size)`.
 * @cssprop --bx-file-upload-label-font-weight - Font weight of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.
 * @cssprop --bx-file-upload-label-line-height - Line height of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.
 * @cssprop --bx-file-upload-label-letter-spacing - Letter spacing of the `label` text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.
 * @cssprop --bx-file-upload-meta-font-family - Font family of the `meta` text (text style `caption-m`). Default `var(--bx-type-caption-family)`.
 * @cssprop --bx-file-upload-meta-font-size - Font size of the `meta` text (text style `caption-m`). Default `var(--bx-type-caption-m-size)`.
 * @cssprop --bx-file-upload-meta-font-weight - Font weight of the `meta` text (text style `caption-m`). Default `var(--bx-type-caption-m-weight)`.
 * @cssprop --bx-file-upload-meta-line-height - Line height of the `meta` text (text style `caption-m`). Default `var(--bx-type-caption-m-leading)`.
 * @cssprop --bx-file-upload-meta-letter-spacing - Letter spacing of the `meta` text (text style `caption-m`). Default `var(--bx-type-caption-m-tracking)`.
 * @cssprop --bx-file-upload-name-font-family - Font family of the `name` text (text style `label-m`). Default `var(--bx-type-label-family)`.
 * @cssprop --bx-file-upload-name-font-size - Font size of the `name` text (text style `label-m`). Default `var(--bx-type-label-m-size)`.
 * @cssprop --bx-file-upload-name-font-weight - Font weight of the `name` text (text style `label-m`). Default `var(--bx-type-label-m-weight)`.
 * @cssprop --bx-file-upload-name-line-height - Line height of the `name` text (text style `label-m`). Default `var(--bx-type-label-m-leading)`.
 * @cssprop --bx-file-upload-name-letter-spacing - Letter spacing of the `name` text (text style `label-m`). Default `var(--bx-type-label-m-tracking)`.
 */
export class BxFileUpload extends FormAssociatedMixin(BixElement) {
  static override tagName = 'bx-file-upload';

  static override styles = [
    BixElement.baseStyles,
    css`
      :host {
        display: block;
        ${textFamily('--bx-file-upload', 'body')}
      }
      .label {
        display: block;
        margin-block-end: var(--bx-space-2xs);
        color: var(--bx-text-primary);
        ${textStyle('--bx-file-upload-label', 'label-m')}
      }
      .label:empty {
        display: none;
      }
      .dropzone {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--bx-space-xs);
        padding: var(--bx-space-l);
        border: var(--bx-border-width-strong) dashed
          var(
            --bx-file-upload-border-color,
            var(--bx-border-strong, var(--bx-border-subtle))
          );
        border-radius: var(--bx-file-upload-radius, var(--bx-radius-m));
        background: var(--bx-file-upload-bg, var(--bx-surface-subtle));
        color: var(--bx-text-secondary);
        text-align: center;
      }
      .dropzone[data-over] {
        border-color: var(--bx-role-brand-solid);
        background: var(--bx-role-brand-subtle);
      }
      :host([disabled]) .dropzone {
        opacity: 0.5;
      }
      .hint {
        ${textStyle('--bx-file-upload-hint', 'caption-m')}
      }
      .hint:not(:has(::slotted(*))) {
        display: none;
      }
      .files {
        display: flex;
        flex-direction: column;
        gap: var(--bx-space-xs);
        margin: var(--bx-space-s) 0 0;
        padding: 0;
        list-style: none;
      }
      .file {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: var(--bx-space-3xs) var(--bx-space-s);
        padding: var(--bx-space-xs) var(--bx-space-s);
        border: var(--bx-border-width) solid var(--bx-border-subtle);
        border-radius: var(--bx-radius-m);
        background: var(--bx-surface-base);
        color: var(--bx-text-primary);
      }
      .name {
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        ${textStyle('--bx-file-upload-name', 'label-m')}
      }
      .meta {
        color: var(--bx-text-secondary);
        ${textStyle('--bx-file-upload-meta', 'caption-m')}
      }
      .meta[data-error] {
        color: var(--bx-role-danger-fg);
      }
      bx-progress-bar {
        grid-column: 1 / -1;
      }
      .sr {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }
      input[type='file'] {
        display: none;
      }
    `,
  ];

  static override properties = {
    label: { type: String },
    name: { type: String },
    accept: { type: String },
    multiple: { type: Boolean, reflect: true },
    maxSize: { type: Number, attribute: 'max-size' },
    maxFiles: { type: Number, attribute: 'max-files' },
    directory: { type: Boolean },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    upload: { attribute: false },
    _entries: { state: true },
    _over: { state: true },
    _announce: { state: true },
  };

  declare label: string;
  declare name: string;
  declare accept: string;
  declare multiple: boolean;
  declare maxSize: number;
  declare maxFiles: number;
  declare directory: boolean;
  declare disabled: boolean;
  declare required: boolean;
  declare upload?: Uploader;
  /** @internal */
  declare _entries: Entry[];
  /** @internal */
  declare _over: boolean;
  /** @internal */
  declare _announce: string;

  #id = `bx-file-upload-${nextId++}`;
  #inputRef = createRef<HTMLInputElement>();

  constructor() {
    super();
    this.label = '';
    this.name = '';
    this.accept = '';
    this.multiple = false;
    this.maxSize = 0;
    this.maxFiles = 0;
    this.directory = false;
    this.disabled = false;
    this.required = false;
    this._entries = [];
    this._over = false;
    this._announce = '';
  }

  /** The current selection. */
  get files(): File[] {
    return this._entries.map((e) => e.file);
  }

  set files(files: File[]) {
    for (const e of this._entries) e.controller?.abort();
    this._entries = [];
    this.#accept(files, false);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('_entries') ||
      changed.has('name') ||
      changed.has('required')
    ) {
      const data = new FormData();
      if (this.name) for (const f of this.files) data.append(this.name, f);
      this.internals.setFormValue(this.name ? data : null);
      const missing = this.required && !this._entries.length;
      this.internals.setValidity(
        missing ? { valueMissing: true } : {},
        missing ? 'Please choose a file.' : undefined,
        this.#inputRef.value,
      );
    }
  }

  formResetCallback(): void {
    this.files = [];
  }

  override focus(options?: FocusOptions): void {
    this.shadowRoot
      ?.querySelector<HTMLElement>('[part~=trigger]')
      ?.focus(options);
  }

  /** Opens the native file picker. */
  browse(): void {
    if (!this.disabled) this.#inputRef.value?.click();
  }

  // --- validation: the one path every source goes through ---------------------------------------

  #accept(incoming: File[], notify = true): void {
    if (this.disabled || !incoming.length) return;
    const reasons: Rejection[] = [];
    let current = this.multiple ? [...this._entries] : [];
    const accepted: Entry[] = [];
    const list = this.multiple ? incoming : incoming.slice(0, 1);
    for (const file of this.multiple ? [] : incoming.slice(1))
      reasons.push({ file, reason: 'count' });
    for (const file of list) {
      if (this.accept && !matchesAccept(file, this.accept)) {
        reasons.push({ file, reason: 'type' });
      } else if (this.maxSize > 0 && file.size > this.maxSize) {
        reasons.push({ file, reason: 'size' });
      } else if (
        this.maxFiles > 0 &&
        current.length + accepted.length >= this.maxFiles
      ) {
        reasons.push({ file, reason: 'count' });
      } else {
        accepted.push({ file, status: 'ready', loaded: 0, total: file.size });
      }
    }
    if (!this.multiple) for (const e of this._entries) e.controller?.abort();
    if (reasons.length)
      this.dispatchEvent(
        new CustomEvent('bx-reject', {
          bubbles: true,
          composed: true,
          detail: { reasons },
        }),
      );
    if (!accepted.length) return;
    current = [...current, ...accepted];
    this._entries = current;
    this._announce = `${accepted.length} file${accepted.length > 1 ? 's' : ''} added`;
    if (notify)
      this.dispatchEvent(
        new CustomEvent('change', {
          bubbles: true,
          composed: true,
          detail: { files: this.files },
        }),
      );
    if (this.upload) for (const entry of accepted) void this.#upload(entry);
  }

  async #upload(entry: Entry): Promise<void> {
    const controller = new AbortController();
    entry.controller = controller;
    entry.status = 'uploading';
    this.requestUpdate();
    try {
      await this.upload!(entry.file, {
        signal: controller.signal,
        onProgress: (loaded, total) => {
          entry.loaded = loaded;
          entry.total = total;
          this.requestUpdate();
          this.dispatchEvent(
            new CustomEvent('bx-upload-progress', {
              bubbles: true,
              composed: true,
              detail: { file: entry.file, loaded, total },
            }),
          );
        },
      });
      if (controller.signal.aborted) return;
      entry.status = 'done';
      entry.loaded = entry.total;
      this.requestUpdate();
      this.dispatchEvent(
        new CustomEvent('bx-upload-complete', {
          bubbles: true,
          composed: true,
          detail: { file: entry.file },
        }),
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      entry.status = 'error';
      entry.error = error instanceof Error ? error.message : String(error);
      this.requestUpdate();
      this.dispatchEvent(
        new CustomEvent('bx-upload-error', {
          bubbles: true,
          composed: true,
          detail: { file: entry.file, error },
        }),
      );
    }
  }

  #remove(entry: Entry): void {
    entry.controller?.abort();
    this._entries = this._entries.filter((e) => e !== entry);
    this._announce = `${entry.file.name} removed`;
    this.dispatchEvent(
      new CustomEvent('bx-remove', {
        bubbles: true,
        composed: true,
        detail: { file: entry.file },
      }),
    );
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { files: this.files },
      }),
    );
  }

  // --- sources ---------------------------------------------------------------------------------

  #onPick = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    this.#accept([...(input.files ?? [])]);
    input.value = '';
  };

  #onDrop = (event: DragEvent): void => {
    event.preventDefault();
    this._over = false;
    this.#accept([...(event.dataTransfer?.files ?? [])]);
  };

  #onPaste = (event: ClipboardEvent): void => {
    const files = [...(event.clipboardData?.files ?? [])];
    if (!files.length) return;
    event.preventDefault();
    this.#accept(files);
  };

  #renderEntry(entry: Entry) {
    const progress = entry.total ? (entry.loaded / entry.total) * 100 : 0;
    return html`<li class="file" part="file">
      <span class="name" title=${entry.file.name}>${entry.file.name}</span>
      <bx-icon-button
        name="close"
        size="s"
        label="Remove ${entry.file.name}"
        @click=${() => this.#remove(entry)}
      ></bx-icon-button>
      <span class="meta" ?data-error=${entry.status === 'error'}>
        <bx-format-bytes value=${entry.file.size}></bx-format-bytes>
        ${
          entry.status === 'error'
            ? html` · ${entry.error || 'Upload failed'}`
            : entry.status === 'done'
              ? html` · Uploaded`
              : nothing
        }
      </span>
      ${
        entry.status === 'uploading'
          ? html`<bx-progress-bar
              value=${progress}
              label="Uploading ${entry.file.name}"
            ></bx-progress-bar>`
          : nothing
      }
    </li>`;
  }

  protected override render() {
    return html`
      <div class="label" id="${this.#id}-label">${this.label}</div>
      <div
        class="dropzone"
        part="dropzone"
        role="group"
        aria-labelledby=${this.label ? `${this.#id}-label` : nothing}
        ?data-over=${this._over}
        @dragover=${(e: DragEvent) => {
          if (this.disabled) return;
          e.preventDefault();
          this._over = true;
        }}
        @dragleave=${() => (this._over = false)}
        @drop=${this.#onDrop}
        @paste=${this.#onPaste}
      >
        <slot>Drag files here or</slot>
        <span part="trigger-wrap"
          ><slot name="trigger"
            ><bx-button
              part="trigger"
              size="small"
              variant="secondary"
              appearance="outlined"
              ?disabled=${this.disabled}
              @click=${() => this.browse()}
              >Browse files</bx-button
            ></slot
          ></span
        >
        <span class="hint"><slot name="hint"></slot></span>
        <input
          ${ref(this.#inputRef)}
          type="file"
          tabindex="-1"
          aria-hidden="true"
          ?multiple=${this.multiple}
          ?webkitdirectory=${this.directory}
          accept=${this.accept || nothing}
          @change=${this.#onPick}
        />
      </div>
      ${
        this._entries.length
          ? html`<ul class="files" part="file-list">
              ${this._entries.map((e) => this.#renderEntry(e))}
            </ul>`
          : nothing
      }
      <div class="sr" role="status" aria-live="polite">${this._announce}</div>
    `;
  }
}
