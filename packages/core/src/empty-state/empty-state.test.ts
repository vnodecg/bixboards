import { expect, fixture, html } from '@open-wc/testing';
import type { BxEmptyState } from './empty-state.ts';
import './index.ts';

describe('bx-empty-state', () => {
  it('shows default copy for the variant and lets props override it', async () => {
    const el = await fixture<BxEmptyState>(
      html`<bx-empty-state variant="no-results"></bx-empty-state>`,
    );
    const heading = el.shadowRoot!.querySelector('[role=heading]')!;
    expect(heading.textContent!.trim()).to.equal('No results found');
    el.heading = 'Nada';
    el.description = 'Intenta otra búsqueda';
    await el.updateComplete;
    expect(heading.textContent!.trim()).to.equal('Nada');
    expect(
      el.shadowRoot!.querySelector('.description')!.textContent!.trim(),
    ).to.equal('Intenta otra búsqueda');
  });

  it('has a configurable heading level', async () => {
    const el = await fixture<BxEmptyState>(
      html`<bx-empty-state heading-level="2"></bx-empty-state>`,
    );
    expect(
      el
        .shadowRoot!.querySelector('[role=heading]')!
        .getAttribute('aria-level'),
    ).to.equal('2');
  });

  it('renders the media and actions slots', async () => {
    const el = await fixture<BxEmptyState>(
      html` <bx-empty-state>
        <img slot="media" alt="" src="data:," />
        <button slot="actions">Add</button>
      </bx-empty-state>`,
    );
    expect(
      el
        .shadowRoot!.querySelector<HTMLSlotElement>('slot[name=media]')!
        .assignedElements(),
    ).to.have.length(1);
    expect(
      el
        .shadowRoot!.querySelector<HTMLSlotElement>('slot[name=actions]')!
        .assignedElements(),
    ).to.have.length(1);
  });

  it('has no axe violations', async () => {
    const el = await fixture<BxEmptyState>(
      html`<bx-empty-state variant="error"></bx-empty-state>`,
    );
    await expect(el).to.be.accessible();
  });
});
