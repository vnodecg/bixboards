import { svg } from 'lit';

// Glyph data: Phosphor Icons ("play" / "pause", regular weight), MIT licensed.
// https://github.com/phosphor-icons/core — vendored as two path strings (not the whole
// package) to keep the per-component incremental-JS budget in docs/features/_conventions.md.

export const PLAY_ICON = svg`
  <svg viewBox="0 0 256 256" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path
      d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"
    />
  </svg>
`;

export const PAUSE_ICON = svg`
  <svg viewBox="0 0 256 256" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path
      d="M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z"
    />
  </svg>
`;
