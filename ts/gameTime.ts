import { Common } from "./common";

export class GameTime {
  private bpm: number;
  private elapsedMs: number;
  private running: boolean;
  private audioCtx: AudioContext;
  private audioCtxZero: number;
  constructor(bpm) {
    console.assert(bpm);
    this.bpm = bpm;
    this.elapsedMs = 0;
    this.running = false;
    this.audioCtx = null;
    this.audioCtxZero = 0;
    this.init();
  }

  async init() {
    this.audioCtx = await Common.getContext();
  }

  start() {
    if (this.audioCtx) {
      this.running = true;
      this.audioCtxZero = this.audioCtx.currentTime - this.elapsedMs * 1000;
    }
  }

  getBpm() {
    return this.bpm;
  }

  getElapsedMs() {
    return this.elapsedMs;
  }

  getAudioTimeForGameTime(gameMs) {
    return this.audioCtxZero + gameMs / 1000;
  }

  getAudioTimeNow() {
    return this.audioCtxZero + this.elapsedMs / 1000;
  }

  roundQuantizeAudioTime(audioTimeS) {
    const secondsPerBeat = 60 / this.bpm / 4;
    const beat = Math.round(audioTimeS / secondsPerBeat);
    return beat * secondsPerBeat;
  }

  getRoundQuantizedAudioTimeNow() {
    return this.roundQuantizeAudioTime(this.getAudioTimeNow());
  }

  tick(timeMs: number, timeDeltaMs: number) {
    if (this.running) {
      this.elapsedMs += timeDeltaMs;
    }
  }
}