import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { BxColorPicker } from './color-picker.ts';
import './index.ts';

describe('bx-color-picker', () => {
  it('registers the tag with a default hex value', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker value="#ff0000" inline></bx-color-picker>`,
    );
    expect(el).to.be.instanceOf(customElements.get('bx-color-picker')!);
    expect(el.value).to.equal('#ff0000');
  });

  it('parses rgb() input and reformats to the requested format', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline format="rgb" value="rgb(0, 255, 0)"></bx-color-picker>`,
    );
    expect(el.value).to.equal('rgb(0, 255, 0)');
    expect(el.getFormattedValue('hex')).to.equal('#00ff00');
  });

  it('parses hsl() input', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline format="hex" value="hsl(240, 100%, 50%)"></bx-color-picker>`,
    );
    expect(el.value.toLowerCase()).to.equal('#0000ff');
  });

  it('round-trips rgb -> hex -> rgb for primary colors', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline value="rgb(255, 128, 0)"></bx-color-picker>`,
    );
    const hex = el.getFormattedValue('hex');
    expect(el.getFormattedValue('rgb')).to.equal('rgb(255, 128, 0)');
    expect(hex).to.equal('#ff8000');
  });

  it('clicking a swatch commits its color', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline .swatches=${['#00ff00', '#0000ff']}></bx-color-picker>`,
    );
    const swatch = el.shadowRoot!.querySelectorAll('.swatch')[0] as HTMLButtonElement;
    const changePromise = oneEvent(el, 'change');
    swatch.click();
    await changePromise;
    expect(el.value.toLowerCase()).to.equal('#00ff00');
  });

  it('arrow keys on the hue slider adjust hue and commit', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline value="#ff0000"></bx-color-picker>`,
    );
    const hueSlider = el.shadowRoot!.querySelector('.hue-slider') as HTMLElement;
    const changePromise = oneEvent(el, 'change');
    hueSlider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await changePromise;
    expect(el.value).to.not.equal('#ff0000');
  });

  it('typing a valid color into the text input commits it', async () => {
    const el = await fixture<BxColorPicker>(html`<bx-color-picker inline></bx-color-picker>`);
    const input = el.shadowRoot!.querySelector('.input') as HTMLInputElement;
    input.value = '#123456';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    expect(el.value.toLowerCase()).to.equal('#123456');
  });

  it('rejects an unparseable typed value and restores the previous one', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline value="#123456"></bx-color-picker>`,
    );
    const input = el.shadowRoot!.querySelector('.input') as HTMLInputElement;
    input.value = 'not-a-color';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(el.value).to.equal('#123456');
    expect(input.value).to.equal('#123456');
  });

  it('non-inline mode toggles the panel via the trigger button', async () => {
    const el = await fixture<BxColorPicker>(html`<bx-color-picker></bx-color-picker>`);
    const trigger = el.shadowRoot!.querySelector('.trigger') as HTMLButtonElement;
    expect(el.open).to.be.false;
    trigger.click();
    expect(el.open).to.be.true;
    trigger.click();
    expect(el.open).to.be.false;
  });

  it('participates in form submission and resets to the default value', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><bx-color-picker inline name="color" value="#ff0000"></bx-color-picker></form>
    `);
    const el = form.querySelector('bx-color-picker') as BxColorPicker;
    const swatch = el.shadowRoot!.querySelector('.grid') as HTMLElement;
    swatch.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await el.updateComplete;
    expect(new FormData(form).get('color')).to.equal(el.value);

    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('#ff0000');
  });

  it('is invalid when required and empty', async () => {
    const el = await fixture<BxColorPicker>(html`<bx-color-picker inline required></bx-color-picker>`);
    expect(el.checkValidity()).to.be.false;
  });

  it('has no axe violations (inline mode)', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline label="Color" value="#ff0000"></bx-color-picker>`,
    );
    await expect(el).to.be.accessible();
  });
});
