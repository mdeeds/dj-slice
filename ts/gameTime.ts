import { Common } from "./common";
import { Debug } from "./debug";

export type AudioCallback = (
  audioTimeS: number, beatInt: number, beatFrac: number) => void;

export class GameTime {
  private bpm: number;
  private elapsedMs: number;
  private running: boolean;
  private audioCtxZero: number;
  private hiddenContext: AudioContext;

  private beatCallbacks: AudioCallback[] = [];

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

  addBeatCallback(cb: AudioCallback) {
    this.beatCallbacks.push(cb);
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

  getAudioTimeForGameTime(gameMs: number) {
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

  private lastBeatNumber = -1;
  tick(timeMs: number, timeDeltaMs: number) {
    if (this.running) {
      this.elapsedMs += timeDeltaMs;
    }
    const elapsed = Common.audioContext().currentTime - this.audioCtxZero + 0.1;
    const secondsPerBeat = 60 / this.bpm;
    const beatFrac = elapsed / secondsPerBeat;
    const beatInt = Math.trunc(beatFrac + 0.001);
    if (beatInt != this.lastBeatNumber) {
      this.lastBeatNumber = beatInt;
      const callbackTime = this.audioCtxZero + beatInt * secondsPerBeat;
      for (const cb of this.beatCallbacks) {
        cb(callbackTime, beatInt, beatFrac);
      }
    }
  }
}