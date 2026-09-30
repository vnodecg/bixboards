import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { DEFAULT_COLOR_PRESETS, type BxColorPicker } from './color-picker.ts';
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
      html`<bx-color-picker
        inline
        format="rgb"
        value="rgb(0, 255, 0)"
      ></bx-color-picker>`,
    );
    expect(el.value).to.equal('rgb(0, 255, 0)');
    expect(el.getFormattedValue('hex')).to.equal('#00ff00');
  });

  it('parses hsl() input', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker
        inline
        format="hex"
        value="hsl(240, 100%, 50%)"
      ></bx-color-picker>`,
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
      html`<bx-color-picker
        inline
        .presets=${['#00ff00', '#0000ff']}
      ></bx-color-picker>`,
    );
    const swatch = el.shadowRoot!.querySelectorAll(
      '.swatch',
    )[0] as HTMLButtonElement;
    const changePromise = oneEvent(el, 'change');
    swatch.click();
    await changePromise;
    expect(el.value.toLowerCase()).to.equal('#00ff00');
  });

  it('arrow keys on the hue slider adjust hue and commit', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker
        inline
        .presets=${[]}
        value="#ff0000"
      ></bx-color-picker>`,
    );
    const hueSlider = el.shadowRoot!.querySelector(
      '.hue-slider',
    ) as HTMLElement;
    const changePromise = oneEvent(el, 'change');
    hueSlider.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    await changePromise;
    expect(el.value).to.not.equal('#ff0000');
  });

  it('typing a valid color into the text input commits it', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline></bx-color-picker>`,
    );
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
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker></bx-color-picker>`,
    );
    const trigger = el.shadowRoot!.querySelector(
      '.trigger',
    ) as HTMLButtonElement;
    expect(el.open).to.be.false;
    trigger.click();
    expect(el.open).to.be.true;
    trigger.click();
    expect(el.open).to.be.false;
  });

  it('participates in form submission and resets to the default value', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <bx-color-picker
          inline
          .presets=${[]}
          name="color"
          value="#ff0000"
        ></bx-color-picker>
      </form>
    `);
    const el = form.querySelector('bx-color-picker') as BxColorPicker;
    const swatch = el.shadowRoot!.querySelector('.grid') as HTMLElement;
    swatch.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    await el.updateComplete;
    expect(new FormData(form).get('color')).to.equal(el.value);

    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('#ff0000');
  });

  it('is invalid when required and empty', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline required></bx-color-picker>`,
    );
    expect(el.checkValidity()).to.be.false;
  });

  it('renders the default presets and a custom toggle, with the custom picker collapsed', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline></bx-color-picker>`,
    );
    const root = el.shadowRoot!;
    expect(
      root.querySelectorAll('.swatch:not(.custom-toggle)').length,
    ).to.equal(DEFAULT_COLOR_PRESETS.length);
    expect(root.querySelector('.grid')).to.equal(null);
    (root.querySelector('.custom-toggle') as HTMLButtonElement).click();
    await el.updateComplete;
    expect(root.querySelector('.grid')).to.not.equal(null);
    expect(root.querySelector('.hue-slider')).to.not.equal(null);
  });

  it('shows the custom picker directly when presets is empty', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline .presets=${[]}></bx-color-picker>`,
    );
    expect(el.shadowRoot!.querySelector('.presets')).to.equal(null);
    expect(el.shadowRoot!.querySelector('.grid')).to.not.equal(null);
  });

  it('changes format via the select and reformats the value', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline value="#ff0000"></bx-color-picker>`,
    );
    const select = el.shadowRoot!.querySelector('.select') as HTMLSelectElement;
    select.value = 'rgb';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    expect(el.format).to.equal('rgb');
    expect(el.value).to.equal('rgb(255, 0, 0)');
  });

  it('adjusts opacity via the percent field and writes alpha into the value', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline value="#ff0000"></bx-color-picker>`,
    );
    const input = el.shadowRoot!.querySelector(
      '.opacity-input',
    ) as HTMLInputElement;
    input.value = '50';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    expect(el.value).to.equal('#ff000080');
  });

  it('hides opacity controls with no-opacity', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker inline no-opacity></bx-color-picker>`,
    );
    expect(el.shadowRoot!.querySelector('.opacity-slider')).to.equal(null);
    expect(el.shadowRoot!.querySelector('.opacity-input')).to.equal(null);
  });

  it('has no axe violations (inline mode)', async () => {
    const el = await fixture<BxColorPicker>(
      html`<bx-color-picker
        inline
        label="Color"
        value="#ff0000"
      ></bx-color-picker>`,
    );
    await expect(el).to.be.accessible();
  });
});
