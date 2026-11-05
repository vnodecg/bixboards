import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import type { BxFileUpload } from './file-upload.ts';
import { matchesAccept } from './file-upload.ts';
import './index.ts';

const file = (name: string, type = 'text/plain', size = 10) =>
  new File(['x'.repeat(size)], name, { type });
const drop = (el: BxFileUpload, files: File[]) => {
  const dt = new DataTransfer();
  files.forEach((f) => dt.items.add(f));
  el.shadowRoot!.querySelector('.dropzone')!.dispatchEvent(
    new DragEvent('drop', {
      dataTransfer: dt,
      bubbles: true,
      cancelable: true,
    }),
  );
};
const rows = (el: BxFileUpload) => el.shadowRoot!.querySelectorAll('.file');

// Firefox ignores `clipboardData` in the ClipboardEvent constructor, so attach it explicitly.
const pasteEvent = (data: DataTransfer): ClipboardEvent => {
  const event = new ClipboardEvent('paste', {
    clipboardData: data,
    bubbles: true,
    cancelable: true,
  });
  if (!event.clipboardData)
    Object.defineProperty(event, 'clipboardData', { value: data });
  return event;
};

describe('matchesAccept', () => {
  it('follows native accept grammar', () => {
    expect(matchesAccept(file('a.pdf', 'application/pdf'), '.pdf')).to.be.true;
    expect(matchesAccept(file('a.png', 'image/png'), 'image/*')).to.be.true;
    expect(matchesAccept(file('a.txt', 'text/plain'), 'image/*,.pdf')).to.be
      .false;
    expect(matchesAccept(file('a.txt', 'text/plain'), '')).to.be.true;
  });
});

describe('bx-file-upload', () => {
  it('lists dropped files with formatted sizes and emits change', async () => {
    const el = await fixture<BxFileUpload>(
      html`<bx-file-upload multiple></bx-file-upload>`,
    );
    let detail: unknown;
    el.addEventListener('change', (e) => (detail = (e as CustomEvent).detail));
    drop(el, [file('a.txt'), file('b.txt')]);
    await el.updateComplete;
    expect(rows(el)).to.have.length(2);
    expect(el.shadowRoot!.querySelector('bx-format-bytes')).to.exist;
    expect((detail as { files: File[] }).files).to.have.length(2);
  });

  it('keeps one file unless multiple, reporting the rest', async () => {
    const el = await fixture<BxFileUpload>(
      html`<bx-file-upload></bx-file-upload>`,
    );
    let reasons: { reason: string }[] = [];
    el.addEventListener(
      'bx-reject',
      (e) => (reasons = (e as CustomEvent).detail.reasons),
    );
    drop(el, [file('a.txt'), file('b.txt')]);
    await el.updateComplete;
    expect(rows(el)).to.have.length(1);
    expect(reasons.map((r) => r.reason)).to.deep.equal(['count']);
  });

  it('rejects by type, size and count through one path', async () => {
    const el = await fixture<BxFileUpload>(
      html`<bx-file-upload
        multiple
        accept="image/*"
        max-size="100"
        max-files="1"
      ></bx-file-upload>`,
    );
    let reasons: { reason: string }[] = [];
    el.addEventListener(
      'bx-reject',
      (e) => (reasons = (e as CustomEvent).detail.reasons),
    );
    drop(el, [
      file('a.txt'),
      file('big.png', 'image/png', 500),
      file('ok.png', 'image/png'),
      file('two.png', 'image/png'),
    ]);
    await el.updateComplete;
    expect(el.files.map((f) => f.name)).to.deep.equal(['ok.png']);
    expect(reasons.map((r) => r.reason)).to.deep.equal([
      'type',
      'size',
      'count',
    ]);
  });

  it('accepts pasted files', async () => {
    const el = await fixture<BxFileUpload>(
      html`<bx-file-upload></bx-file-upload>`,
    );
    const dt = new DataTransfer();
    dt.items.add(file('p.txt'));
    el.shadowRoot!.querySelector('.dropzone')!.dispatchEvent(pasteEvent(dt));
    await el.updateComplete;
    expect(el.files).to.have.length(1);
  });

  it('removes a file and fires bx-remove', async () => {
    const el = await fixture<BxFileUpload>(
      html`<bx-file-upload></bx-file-upload>`,
    );
    drop(el, [file('a.txt')]);
    await el.updateComplete;
    let removed: File | undefined;
    el.addEventListener(
      'bx-remove',
      (e) => (removed = (e as CustomEvent).detail.file),
    );
    await aTimeout(30); // let the nested icon button render
    el.shadowRoot!.querySelector<HTMLElement>('bx-icon-button')!.click();
    await el.updateComplete;
    expect(removed!.name).to.equal('a.txt');
    expect(rows(el)).to.have.length(0);
  });

  it('never uploads without `upload`; with it, reports progress, completion and errors', async () => {
    const el = await fixture<BxFileUpload>(
      html`<bx-file-upload multiple></bx-file-upload>`,
    );
    el.upload = async (f, { onProgress }) => {
      onProgress(5, 10);
      if (f.name === 'bad.txt') throw new Error('nope');
    };
    const log: string[] = [];
    el.addEventListener('bx-upload-progress', () => log.push('progress'));
    el.addEventListener('bx-upload-complete', () => log.push('complete'));
    el.addEventListener('bx-upload-error', () => log.push('error'));
    drop(el, [file('ok.txt'), file('bad.txt')]);
    await aTimeout(50);
    await el.updateComplete;
    expect(log.filter((l) => l === 'progress')).to.have.length(2);
    expect(log).to.include('complete');
    expect(log).to.include('error');
    expect(el.shadowRoot!.textContent).to.contain('nope');
  });

  it('aborts an in-flight upload when its row is removed', async () => {
    const el = await fixture<BxFileUpload>(
      html`<bx-file-upload></bx-file-upload>`,
    );
    let aborted = false;
    el.upload = (_f, { signal }) =>
      new Promise((_, reject) =>
        signal.addEventListener('abort', () => {
          aborted = true;
          reject(new Error('abort'));
        }),
      );
    drop(el, [file('slow.txt')]);
    await aTimeout(20);
    el.shadowRoot!.querySelector<HTMLElement>('bx-icon-button')!.click();
    expect(aborted).to.be.true;
  });

  it('submits files with the form and enforces required', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form><bx-file-upload name="doc" required></bx-file-upload></form>`,
    );
    const el = form.querySelector('bx-file-upload') as BxFileUpload;
    await el.updateComplete;
    expect(el.checkValidity()).to.be.false;
    drop(el, [file('a.txt')]);
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
    expect((new FormData(form).get('doc') as File).name).to.equal('a.txt');
    form.reset();
    await el.updateComplete;
    expect(el.files).to.have.length(0);
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxFileUpload>(
      html`<bx-file-upload label="Attachments"
        ><span slot="hint">PNG up to 2 MB</span></bx-file-upload
      >`,
    );
    drop(el, [file('a.txt')]);
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
