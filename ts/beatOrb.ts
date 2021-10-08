import * as AFRAME from "aframe";
import { BeatScore } from "./beatScore";

export class BeatOrb {
  private readonly beatScore: BeatScore;
  constructor(private entity: AFRAME.Entity, bpm: number) {
    this.beatScore = new BeatScore(bpm);
  }

  public strike(eventTimeS: number) {
    this.beatScore.strike(eventTimeS);
  }

  tick(timeMs: number, timeDeltaMs: number) {

  }

}