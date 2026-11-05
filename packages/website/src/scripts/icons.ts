// One import per icon in data/icons.ts so only these SVGs are bundled (Lucide, ISC license).
import i_accessibility from 'lucide-static/icons/accessibility.svg?raw';
import i_arrow_right from 'lucide-static/icons/arrow-right.svg?raw';
import i_blocks from 'lucide-static/icons/blocks.svg?raw';
import i_book_open from 'lucide-static/icons/book-open.svg?raw';
import i_bell from 'lucide-static/icons/bell.svg?raw';
import i_chart_column from 'lucide-static/icons/chart-column.svg?raw';
import i_check from 'lucide-static/icons/check.svg?raw';
import i_code_xml from 'lucide-static/icons/code-xml.svg?raw';
import i_command from 'lucide-static/icons/command.svg?raw';
import i_compass from 'lucide-static/icons/compass.svg?raw';
import i_copy from 'lucide-static/icons/copy.svg?raw';
import i_database from 'lucide-static/icons/database.svg?raw';
import i_external_link from 'lucide-static/icons/external-link.svg?raw';
import i_gauge from 'lucide-static/icons/gauge.svg?raw';
import i_git_branch from 'lucide-static/icons/git-branch.svg?raw';
import i_image from 'lucide-static/icons/image.svg?raw';
import i_layers from 'lucide-static/icons/layers.svg?raw';
import i_layout_dashboard from 'lucide-static/icons/layout-dashboard.svg?raw';
import i_moon from 'lucide-static/icons/moon.svg?raw';
import i_mouse_pointer_click from 'lucide-static/icons/mouse-pointer-click.svg?raw';
import i_palette from 'lucide-static/icons/palette.svg?raw';
import i_panels_top_left from 'lucide-static/icons/panels-top-left.svg?raw';
import i_rocket from 'lucide-static/icons/rocket.svg?raw';
import i_rows_3 from 'lucide-static/icons/rows-3.svg?raw';
import i_ruler from 'lucide-static/icons/ruler.svg?raw';
import i_search from 'lucide-static/icons/search.svg?raw';
import i_shield_check from 'lucide-static/icons/shield-check.svg?raw';
import i_sparkles from 'lucide-static/icons/sparkles.svg?raw';
import i_sun from 'lucide-static/icons/sun.svg?raw';
import i_terminal from 'lucide-static/icons/terminal.svg?raw';
import i_text_cursor_input from 'lucide-static/icons/text-cursor-input.svg?raw';
import i_wrench from 'lucide-static/icons/wrench.svg?raw';
import i_zap from 'lucide-static/icons/zap.svg?raw';

const svgs: Record<string, string> = {
  accessibility: i_accessibility,
  'arrow-right': i_arrow_right,
  blocks: i_blocks,
  'book-open': i_book_open,
  bell: i_bell,
  'chart-column': i_chart_column,
  check: i_check,
  'code-xml': i_code_xml,
  command: i_command,
  compass: i_compass,
  copy: i_copy,
  database: i_database,
  'external-link': i_external_link,
  gauge: i_gauge,
  'git-branch': i_git_branch,
  image: i_image,
  layers: i_layers,
  'layout-dashboard': i_layout_dashboard,
  moon: i_moon,
  'mouse-pointer-click': i_mouse_pointer_click,
  palette: i_palette,
  'panels-top-left': i_panels_top_left,
  rocket: i_rocket,
  'rows-3': i_rows_3,
  ruler: i_ruler,
  search: i_search,
  'shield-check': i_shield_check,
  sparkles: i_sparkles,
  sun: i_sun,
  terminal: i_terminal,
  'text-cursor-input': i_text_cursor_input,
  wrench: i_wrench,
  zap: i_zap,
};

/**
 * Registers the `lucide` library so `<bx-icon library="lucide" name="layers">` resolves from the
 * bundled set with no network. The icon module is imported dynamically on purpose: a static import
 * here would pull it into the entry chunk, and the component chunks that depend on it would then
 * wait on an entry that is itself awaiting them (a top-level-await cycle).
 */
export async function registerLucide(): Promise<void> {
  const { registerIconLibrary } = await import('@bixboards/core/icon');
  registerIconLibrary('lucide', {
    resolver: (name) => {
      const svg = svgs[name];
      if (!svg)
        throw new Error(
          `Lucide icon "${name}" is not bundled; add it to data/icons.ts.`,
        );
      return svg;
    },
  });
  // Importing the icon module defines <bx-icon> and upgrades icons already in the page *before*
  // the library above is registered, so those first lookups failed. Re-resolve them now.
  for (const icon of document.querySelectorAll('bx-icon[library="lucide"]')) {
    const name = icon.getAttribute('name');
    if (name === null) continue;
    icon.removeAttribute('name');
    icon.setAttribute('name', name);
  }
}
