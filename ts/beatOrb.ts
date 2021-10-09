import * as AFRAME from "aframe";
import { BeatScore } from "./beatScore";

export class BeatOrb {
  private readonly beatScore: BeatScore;
  private msPerBeat: number;
  private y: number = 1.0;
  constructor(private entity: AFRAME.Entity, bpm: number) {
    this.beatScore = new BeatScore(bpm);
    this.msPerBeat = 1000 * 60 / bpm;
    console.log(`Seconds per beat: ${(this.msPerBeat / 1000).toFixed(2)}`);
    this.entity.setAttribute('color', '#0f0');
  }

  public strike(eventTimeS: number) {
    this.beatScore.strike(eventTimeS);
  }

  tick(timeMs: number, timeDeltaMs: number) {
    let yv = (0.4 - this.beatScore.getCumulativeError()) * timeDeltaMs / 1000;
    this.y = Math.max(0.9, this.y + yv);
    const phase = (timeMs / this.msPerBeat) % 1;
    let drop = 0;
    if (phase < 0.25) {
      drop = (0.25 - phase);
    }
    this.entity.object3D.position.y = this.y - drop * Math.abs(Math.sin(phase));
    // if (phase > 0) {
    //   this.entity.setAttribute('color', '#f00');
    // } else {
    //   this.entity.setAttribute('color', '#00f');
    // }
    //this.entity.setAttribute('material', 'roughness', Math.abs(phase));
  }
}