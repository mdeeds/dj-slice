import * as Tone from "tone";
import { Common } from "./common";
import { Debug } from "./debug";

export class TimeSummary {
  constructor(
    readonly audioTimeS: number,
    readonly beatInt: number,
    readonly beatFrac: number
  ) { }
}

export type AudioCallback = (TimeSummary) => void;

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
    Tone.Transport.bpm.value = bpm;
    this.bpm = bpm;
  }

  getElapsedMs() {
    return this.elapsedMs;
  }

  getAudioTimeForGameTime(gameMs: number) {
    return this.audioCtxZero + gameMs / 1000;
  }

  roundQuantizeAudioTime1n(audioTimeS: number) {
    const secondsPerBeat = 4 * 60 / this.bpm;
    const beat = Math.round(
      (audioTimeS - this.audioCtxZero) / secondsPerBeat);
    return beat * secondsPerBeat;
  }

  nextQuantizeAudioTime8n(audioTimeS: number) {
    const secondsPerBeat = 60 / this.bpm / 2;
    const beat = Math.ceil(
      (audioTimeS - this.audioCtxZero) / secondsPerBeat);
    return beat * secondsPerBeat + this.audioCtxZero;
  }

  nextQuantizeAudioTime16n(audioTimeS: number) {
    const secondsPerBeat = 60 / this.bpm / 4;
    const beat = Math.ceil(
      (audioTimeS - this.audioCtxZero) / secondsPerBeat);
    return beat * secondsPerBeat + this.audioCtxZero;
  }

  timeSummaryNow(lookaheadS: number) {
    const audioTimeNowS = Common.audioContext().currentTime;
    const elapsed = audioTimeNowS - this.audioCtxZero + lookaheadS;
    const secondsPerBeat = 60 / this.bpm;
    const beatFrac = elapsed / secondsPerBeat;
    const beatInt = Math.trunc(beatFrac + 0.001);
    return new TimeSummary(audioTimeNowS, beatInt, beatFrac)
  }

  private lastBeatNumber = -1;
  tick(timeMs: number, timeDeltaMs: number) {
    if (this.running) {
      this.elapsedMs += timeDeltaMs;
    }
    const ts = this.timeSummaryNow(0.1);
    if (ts.beatInt != this.lastBeatNumber) {
      this.lastBeatNumber = ts.beatInt;
      const secondsPerBeat = 60 / this.bpm;
      const callbackTime = this.audioCtxZero + ts.beatInt * secondsPerBeat;
      for (const cb of this.beatCallbacks) {
        cb(new TimeSummary(callbackTime, ts.beatInt, ts.beatFrac));
      }
    }
  }
}