import * as AFRAME from "aframe";
import { GameTime } from "./gameTime";

import { Track } from "./track";

export class SamplePack {
  readonly bpm: number;
  readonly tracks: Track[] = [];
  private constructor(obj: object, gameTime: GameTime, assets: AFRAME.Entity) {
    this.bpm = obj['bpm'];
    gameTime.setBpm(this.bpm);
    for (const track of obj['tracks']) {
      this.tracks.push(new Track(track, gameTime, assets));
    }
  }

  static async load(
    name: string, gameTime: GameTime, assets: AFRAME.Entity)
    : Promise<SamplePack> {
    var oReq = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      oReq.addEventListener("load", () => {
        const obj = JSON.parse(oReq.responseText);
        for (const song of obj) {
          if (song['name'] === name) {
            resolve(new SamplePack(song, gameTime, assets));
          }
        }
        reject(`Not found: ${name}`);
      });
      oReq.open("GET", "songs.json");
      oReq.send();
    });
  }
}