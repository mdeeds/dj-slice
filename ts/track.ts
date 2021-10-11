import * as AFRAME from "aframe";
import { GameTime } from "./gameTime";
import { Sample } from "./sample";

export class Track {
  private samples: Sample[] = [];
  private images: string[] = [];
  private static idNumber = 0;
  constructor(obj: object, gameTime: GameTime, assets: AFRAME.Entity) {
    for (const sample of obj['samples']) {
      const audioUrl = sample['audio'];
      const s = new Sample(audioUrl, gameTime);
      this.samples.push(s);
      this.images.push(sample['image']);
      // const i = document.createElement('img') as any as HTMLImageElement;
      // i.setAttribute('src', sample['image']);
      // i.id = `trackImage${Track.idNumber++}`
      // this.images.push(i);
      // assets.appendChild(i);
    }
  }

  public getSample(i: number) {
    return this.samples[i];
  }
  public getImage(i: number) {
    return this.images[i];
  }
  public numSamples(): number {
    return this.samples.length;
  }
}