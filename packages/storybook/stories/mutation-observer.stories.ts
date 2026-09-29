import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@bixant/core/mutation-observer';

interface Args {
  attr: string;
  attrOldValue: boolean;
  charData: boolean;
  childList: boolean;
  disabled: boolean;
}

const meta = {
  title: 'Core/Mutation Observer',
  parameters: {
    docs: {
      description: {
        component:
          '`<bx-mutation-observer>`: declaratively observes its own light-DOM subtree for attribute, character-data and/or child-list changes, firing `bx-mutation` with the batched records. Spec: docs/features/core/mutation-observer.md.',
      },
    },
  },
  argTypes: {
    attr: { control: 'text' },
    attrOldValue: { control: 'boolean', name: 'attr-old-value' },
    charData: { control: 'boolean', name: 'char-data' },
    childList: { control: 'boolean', name: 'child-list' },
    disabled: { control: 'boolean' },
  },
  args: {
    attr: '',
    attrOldValue: false,
    charData: false,
    childList: true,
    disabled: false,
  },
  render: (args) => html`
    <bx-mutation-observer
      attr=${args.attr}
      ?attr-old-value=${args.attrOldValue}
      ?char-data=${args.charData}
      ?child-list=${args.childList}
      ?disabled=${args.disabled}
      @bx-mutation=${(e: CustomEvent) => console.log('bx-mutation', e.detail.mutationList)}
    >
      <p>Watched content — use the buttons below to mutate it.</p>
    </bx-mutation-observer>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const ChildListDemo: Story = {
  name: 'Child list changes (live log)',
  render: () => {
    let log: string[] = [];
    const handleMutation = (event: Event) => {
      const records = (event as CustomEvent).detail
        .mutationList as MutationRecord[];
      log = [
        ...log,
        `${records.length} mutation(s) at ${new Date().toLocaleTimeString()}`,
      ].slice(-5);
      document.getElementById('mo-log')!.textContent = log.join('\n');
    };
    const addChild = () => {
      const target = document.getElementById('mo-target')!;
      const span = document.createElement('span');
      span.textContent = ' •';
      target.appendChild(span);
    };
    return html`
      <bx-mutation-observer child-list @bx-mutation=${handleMutation}>
        <p id="mo-target">Watched paragraph</p>
      </bx-mutation-observer>
      <button
        type="button"
        style="margin-block-start: 0.5rem"
        @click=${addChild}
      >
        Append a child
      </button>
      <pre
        id="mo-log"
        style="margin-block-start: 0.5rem; font-size: var(--bx-font-size-s)"
      ></pre>
    `;
  },
};

export const Disabled: Story = {
  args: { disabled: true, childList: true },
};
