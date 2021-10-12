import { Common } from "./common";

export class GameTime {
  private bpm: number;
  private elapsedMs: number;
  private running: boolean;
  private audioCtxZero: number;
  private hiddenContext: AudioContext;
  private constructor(bpm: number) {
    console.assert(bpm);
    this.bpm = bpm;
    this.elapsedMs = 0;
    this.running = false;
    this.audioCtxZero = 0;
  }

  static async make(bpm: number): Promise<GameTime> {
    const result = new GameTime(bpm);
    return new Promise(async (resolve, reject) => {
      result.hiddenContext = await Common.getContext();
      console.log(result.hiddenContext.currentTime);
      resolve(result);
    });
  }

  async start() {
    this.running = true;
    const audioCtx = await Common.getContext();
    this.audioCtxZero = audioCtx.currentTime - this.elapsedMs * 1000;
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
    return Common.audioContext().currentTime;
    // return Common.audioContext()Zero + this.elapsedMs / 1000;
  }

  roundQuantizeAudioTime(audioTimeS: number) {
    const secondsPerBeat = 4 * 60 / this.bpm;
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