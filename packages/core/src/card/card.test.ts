import { expect, fixture, html } from '@open-wc/testing';
import type { BxCard } from './card.ts';
import './index.ts';

describe('bx-card', () => {
  it('registers the tag with outlined/vertical defaults and no regions', async () => {
    const el = await fixture<BxCard>(html`<bx-card>Body</bx-card>`);
    expect(el).to.be.instanceOf(customElements.get('bx-card')!);
    expect(el.appearance).to.equal('outlined');
    expect(el.orientation).to.equal('vertical');
    expect(el.shadowRoot!.querySelector('.header')).to.be.null;
    expect(el.shadowRoot!.querySelector('.media')).to.be.null;
    expect(el.shadowRoot!.querySelector('.footer')).to.be.null;
  });

  it('renders header/media/footer regions only when their flag is set', async () => {
    const el = await fixture<BxCard>(html`
      <bx-card with-header with-media with-footer>
        <span slot="header">Title</span>
        <span slot="media">Img</span>
        Body
        <span slot="footer">Foot</span>
      </bx-card>
    `);
    expect(el.shadowRoot!.querySelector('[part="header"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[part="media"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[part="footer"]')).to.exist;
  });

  it('does not set a role by default, leaving role="article" as consumer opt-in', async () => {
    const el = await fixture<BxCard>(html`<bx-card>Body</bx-card>`);
    expect(el.getAttribute('role')).to.be.null;

    const article = await fixture<BxCard>(
      html`<bx-card role="article">Body</bx-card>`,
    );
    expect(article.getAttribute('role')).to.equal('article');
  });

  it('has no axe violations with every region present', async () => {
    const el = await fixture<BxCard>(html`
      <bx-card with-header with-media with-footer>
        <span slot="header">Title</span>
        <img slot="media" src="data:," alt="" />
        Body
        <button slot="actions">Go</button>
        <span slot="footer">Foot</span>
      </bx-card>
    `);
    await expect(el).to.be.accessible();
  });
});
