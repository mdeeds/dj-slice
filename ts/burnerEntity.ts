import * as AFRAME from "aframe";
import { Common } from "./common";
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
    this.startTimeS = Common.audioContext().currentTime;
    this.gameTime.setBpm(bpm);
    this.gameTime.addBeatCallback(
      (audioTimeS: number, beatInt: number, beatFrac: number) => {
        this.sample.playAt(audioTimeS);
      })
  }
}