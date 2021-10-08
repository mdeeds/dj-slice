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
    let y = this.entity.object3D.position.y;
    let yv = (0.4 - this.beatScore.getCumulativeError()) * timeDeltaMs / 1000;
    this.entity.object3D.position.y = Math.max(0.9, y + yv);
  }
}