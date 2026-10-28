"use client";

class SoundController {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private lastTickAt: number = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined" || this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Subtle mechanical lens-ring / NLE timeline detent click
   */
  playTick(strength = 0.65) {
    if (this.muted) return;
    const nowMs = performance.now();
    if (nowMs - this.lastTickAt < 38) return;
    this.lastTickAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1650, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.018);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.2, now);

    const peak = Math.min(0.08, 0.045 * strength);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.024);
  }

  /**
   * Two-stage mirrorless camera shutter sound when opening a card/project
   */
  playShutter() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const triggerCurtain = (offset: number, freqStart: number, vol: number) => {
      const t = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freqStart, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.028);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.032);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.035);
    };

    triggerCurtain(0, 1100, 0.05);
    triggerCurtain(0.045, 860, 0.038);
  }

  /**
   * Soft UI magnetic hover blip
   */
  playHover() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(720, t);
    osc.frequency.exponentialRampToValueAtTime(980, t + 0.025);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.018, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.03);
  }
}

export const soundEngine = new SoundController();
