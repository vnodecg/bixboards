<script lang="ts">
  // Test harness: exercises generated wrappers the way an app would (bind:, callbacks, slots).
  import { BxButton, BxDropdown, BxDropdownItem, BxInput, BxSelect, BxVirtualTree } from '../../src/index.ts';
  import type { BxSelect as BxSelectElement } from '@bixboards/core/select';

  let { log = [] as string[] }: { log?: string[] } = $props();

  let country = $state('b');
  let text = $state('');
  let dropdownOpen = $state(false);
  let selectEl = $state<BxSelectElement>();
  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];
  const nodes = [{ id: 'r', label: 'Root', children: [{ id: 'c', label: 'Child' }] }];

  export const getState = () => ({ country, text, dropdownOpen });
  export const setCountry = (value: string) => (country = value);
  export const getSelect = () => selectEl;
</script>

<BxSelect bind:element={selectEl} bind:value={country} {options} onBxShow={() => log.push('show')} />
<BxInput bind:value={text} label="Text" class="field" data-test="input" />
<BxDropdown bind:open={dropdownOpen} onBxSelect={(e) => log.push(`select:${e.detail.value}`)}>
  <!-- Svelte treats a literal slot="..." on a component as a (legacy) slot for *its* parent, so the
       attribute is passed through a spread to reach the custom element's own named slot. -->
  <BxButton {...{ slot: 'trigger' }}>Menu</BxButton>
  <BxDropdownItem value="one">One</BxDropdownItem>
</BxDropdown>
<BxVirtualTree {nodes} expandedKeys={['r']} style="block-size: 200px" />
