import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../types';
import { RenderedThumbnail } from './RenderedHardware';
import { hardwareProfile } from './profiles';

// Compatibility boundary for library/overview hosts. It produces escaped, inert
// markup from the React component; it owns no patch or processor state.
export function hardwareArt(block: Block, on = true): string {
  return renderToStaticMarkup(
    <RenderedThumbnail profile={hardwareProfile(block)} block={block} on={on} />,
  );
}
