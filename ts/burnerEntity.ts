import * as AFRAME from "aframe";
import { GameTime } from "./gameTime";
import { Sample } from "./sample";

export class BurnerEntity {
  private sample: Sample;
  private secondsPerBeat: number = null;
  private startTimeS: number = null;
  constructor(private entity: AFRAME.Entity, private gameTime: GameTime) {
    this.sample = new Sample('samples/shaker.mp3', gameTime);
  }

  start(bpm: number) {
    this.secondsPerBeat = 60 / bpm;
    this.startTimeS = this.gameTime.getAudioTimeNow();
    this.gameTime.setBpm(bpm);
  }

  private lastBeat = -1;
  tick(timeMs: number, timeDeltaMs: number) {
    if (this.startTimeS) {
      const beatNumber =
        Math.trunc(
          (this.gameTime.getAudioTimeNow() - this.startTimeS) /
          this.secondsPerBeat);
      if (this.lastBeat != beatNumber) {
        this.lastBeat = beatNumber;
        // TODO: Clean up the timing here.
        if (beatNumber % 4 == 0) {
          this.sample.playAt(this.gameTime.getAudioTimeNow());
        }
      }

    }
  }
}