import type { Block } from './types';

// Capture type comes from the saved catalogue, never guessed from a model title.
// Artwork is independent of audio: an unloaded cabinet is only a pair of cuts.
export function CaptureNotice({ block }: { block: Block }) {
  let message = '';
  if (block.key === 'cab' && !block.assetId)
    message =
      'No cabinet IR loaded. This block only applies low/high cuts; its picture does not simulate a speaker. Import a cab IR in Device options or choose a saved cabinet.';
  else if (block.assetId && block.tone3000?.gear === 'amp')
    message =
      'Amp-head capture: use an active cabinet IR after it for headphones or full-range speakers. A real guitar cabinet or Powercab speaker model may provide that filtering instead.';
  else if (block.assetId && block.tone3000?.gear === 'amp-cab')
    message =
      'This capture already includes a cabinet. Another cab IR adds a second layer of speaker filtering. The input trim changes breakup; output changes volume.';
  if (!message) return null;
  return (
    <p className="capture-notice" role="note">
      {message}
    </p>
  );
}
