let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  return audioCtx;
};

export const initAudio = () => {
    const ctx = getContext();
    if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
    }
};

export const playClickSound = () => {
    const ctx = getContext();
    if (!ctx) return;
    
    // Ensure context is running
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Crisp mechanical click
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
};

export const playBuzzerSound = () => {
  const ctx = getContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Modern "Ding" sound (C5 -> A5 sweep)
  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); 
  
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

  osc.start();
  osc.stop(ctx.currentTime + 1.2);
};