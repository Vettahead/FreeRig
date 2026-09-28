import { useEffect, useRef, useState } from 'react';
import type { Actions } from './types';
const pages = [
  {
    name: 'Connect',
    title: 'Start with your guitar and interface.',
    items: [
      'Plug your guitar into the instrument / Hi-Z input on your audio interface. Select instrument mode if it has a switch.',
      'Connect headphones or speakers to that same interface for the simplest low-delay setup. Start with their volume low.',
      'Install the interface manufacturer’s Windows ASIO driver, then reconnect the interface and restart FreeRig if it is missing from Audio setup.',
    ],
    tip: 'Turn direct monitoring down when listening to FreeRig, otherwise you may hear the dry guitar mixed with the processed sound.',
  },
  {
    name: 'Audio',
    title: 'Choose where sound comes in and goes out.',
    items: [
      'Open Audio setup. Choose your interface’s ASIO driver, then press Read channels.',
      'Choose the input your guitar is plugged into and the output pair connected to your headphones or speakers. Use Same ASIO interface for the lowest-delay route.',
      'Choose a sample rate supported by your interface. Start at 48,000 Hz; use the model’s rate when a loaded capture asks for one. Press Start audio when ready.',
    ],
    tip: 'A separate USB output, such as Powercab, adds another queue. Its 5 ms setting is not total latency. An audio cable from the interface to Powercab avoids that second USB route.',
  },
  {
    name: 'Feel',
    title: 'Find a buffer that feels right.',
    items: [
      'In Audio setup, open Driver / buffer settings. This buffer is measured in samples; it is different from sample rate (Hz).',
      'Try 64 samples first, or 32 if your interface and rig handle it cleanly. Smaller buffers feel quicker but leave less processing time.',
      'Play hard and test your busiest patch. If you hear clicks or crackling, try 128 samples and check the performance meter. A smaller buffer does not make the capture more accurate.',
    ],
    tip: 'For Powercab, use Flat/FRFR with a cabinet IR in FreeRig. Bypass the app cabinet if you are using Powercab’s speaker modelling.',
  },
  {
    name: 'First sound',
    title: 'Check the signal before building a big rig.',
    items: [
      'Start with one built-in amp and a cabinet. Play and check the input and output meters in Audio setup.',
      'No input? Check the cable, instrument input, selected channel and interface gain. Input clipping? Lower the interface gain.',
      'Input moves but no sound? Check the output device/pair, connected speakers and their volume, master output, and that the route reaches Output. Raise listening volume gradually.',
    ],
    tip: 'Input trim changes how hard you drive the amp. Master output changes listening volume. Tune your guitar with Tuner before judging a sound.',
  },
  {
    name: 'TONE3000',
    title: 'Bring community captures into your collection.',
    items: [
      'Choose an amp, cabinet or NAM pedal below, then open TONE3000. Continue to TONE3000 and sign in with your own account in its window.',
      'Pick a tone and return to FreeRig. Choose a model, then Download and load; Save pack keeps multiple models together as one collection device.',
      'Select the device to choose its saved capture from the header. An amp + cab capture already includes a cabinet; bypass the separate cabinet if you do not want both.',
    ],
    tip: 'Internet is needed for sign-in, browsing and downloading. Saved models and built-in effects can be played offline. You do not need to paste a password or secret API key into FreeRig.',
  },
  {
    name: 'Keep your rig',
    title: 'Save a starting point you can return to.',
    items: [
      'Name your patch and press Save patch (Ctrl+S). Find it again in Collection → Patches and organise your banks there.',
      'Use scenes for different knob settings and on/off combinations inside one patch. Start with four, or add four more. Save the patch to keep them all.',
      'Export a patch for backup or sharing. Patch files contain settings, not the NAM models or cabinet IR audio files: keep backups of those too.',
    ],
    tip: 'Reopen this wizard any time. It explains the controls; it never starts audio, replaces gear or changes your settings by itself.',
  },
];
export function SetupWizard({ actions }: { actions: Actions }) {
  const dialog = useRef<HTMLDialogElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false),
    [step, setStep] = useState(0),
    [target, setTarget] = useState('');
  useEffect(() => {
    const button = document.getElementById('setup-wizard');
    const launch = () => setOpen(true);
    button?.addEventListener('click', launch);
    return () => button?.removeEventListener('click', launch);
  }, []);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      heading.current?.focus();
    } else dialog.current?.close();
  }, [open]);
  useEffect(() => {
    if (open) heading.current?.focus();
  }, [step]);
  const close = () => {
    setOpen(false);
    document.getElementById('setup-wizard')?.focus();
  };
  const devices = open
    ? actions
        .snapshot()
        .blocks.filter((b) => ['amp', 'cleanamp', 'cab', 'nampedal'].includes(b.key))
    : [];
  const chosen = devices.some((b) => b.id === target) ? target : devices[0]?.id || '';
  const launch = (id: string) => {
    dialog.current?.close();
    setOpen(false);
    if (id === 'tone3000' && chosen) actions.edit(chosen);
    document.getElementById(id)?.click();
  };
  const page = pages[step];
  return (
    <dialog
      ref={dialog}
      className="setup-wizard"
      aria-labelledby="wizard-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onKeyDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            close();
        }
      }}
    >
      <header>
        <span>GET PLAYING / SETUP WIZARD</span>
        <button onClick={close} aria-label="Close setup wizard">
          ✕
        </button>
      </header>
      <nav aria-label="Setup steps">
        {pages.map((p, i) => (
          <button
            key={p.name}
            aria-current={step === i ? 'step' : undefined}
            onClick={() => setStep(i)}
          >
            {i + 1}. {p.name}
          </button>
        ))}
      </nav>
      <h2 id="wizard-title" ref={heading} tabIndex={-1}>
        {page.title}
      </h2>
      <ol>
        {page.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <p className="wizard-tip">{page.tip}</p>
      {step >= 1 && step <= 3 && (
        <button className="primary" onClick={() => launch('settings')}>
          Open Audio setup ↗
        </button>
      )}
      {step === 4 && (
        <div className="wizard-tone">
          <label>
            Load into
            <select value={chosen} onChange={(e) => setTarget(e.target.value)}>
              {devices.map((b) => (
                <option key={b.id} value={b.id}>
                  {window.DeviceShelf.definition(b).name}
                </option>
              ))}
            </select>
          </label>
          <button className="primary" disabled={!chosen} onClick={() => launch('tone3000')}>
            Open TONE3000 ↗
          </button>
          {!chosen && (
            <p>Add an amp, cabinet or NAM pedal to your board first, then return here.</p>
          )}
        </div>
      )}
      <p className="wizard-return">
        After closing a setup screen, press Setup wizard to return to this step.
      </p>
      <footer>
        <button disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </button>
        <span>
          {step + 1} / {pages.length}
        </span>
        <button
          className="primary"
          onClick={() => (step === pages.length - 1 ? close() : setStep(step + 1))}
        >
          {step === pages.length - 1 ? 'Done' : 'Next →'}
        </button>
      </footer>
    </dialog>
  );
}
