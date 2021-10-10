import { Common } from "./common";

export class GameTime {
  private bpm: number;
  private elapsedMs: number;
  private running: boolean;
  private audioCtx: AudioContext;
  private audioCtxZero: number;
  private constructor(bpm: number) {
    console.assert(bpm);
    this.bpm = bpm;
    this.elapsedMs = 0;
    this.running = false;
    this.audioCtx = null;
    this.audioCtxZero = 0;
  }

  static async make(bpm: number): Promise<GameTime> {
    const result = new GameTime(bpm);
    result.audioCtx = await Common.getContext();
    return result;
  }

  start() {
    this.running = true;
    if (this.audioCtx) {
      this.audioCtxZero = this.audioCtx.currentTime - this.elapsedMs * 1000;
    }
  }

  getBpm() {
    return this.bpm;
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
  }

  getElapsedMs() {
    return this.elapsedMs;
  }

  getAudioTimeForGameTime(gameMs) {
    return this.audioCtxZero + gameMs / 1000;
  }

  getAudioTimeNow() {
    return this.audioCtx.currentTime;
    // return this.audioCtxZero + this.elapsedMs / 1000;
  }

  roundQuantizeAudioTime(audioTimeS) {
    const secondsPerBeat = 60 / this.bpm / 4;
    const beat = Math.round(audioTimeS / secondsPerBeat);
    return beat * secondsPerBeat;
  }

  getRoundQuantizedAudioTimeNow() {
    return this.roundQuantizeAudioTime(this.getAudioTimeNow());
  }

  getDurationForBeats(beatCount: number): number {
    return 60 / this.bpm * beatCount;
  }

  tick(timeMs: number, timeDeltaMs: number) {
    if (this.running) {
      this.elapsedMs += timeDeltaMs;
    }
  }
}