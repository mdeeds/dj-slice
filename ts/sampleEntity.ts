import * as AFRAME from "aframe";
import { CollisionDirection, CollisionHandler } from "./collisionHandler";
import { Debug } from "./debug";
import { AudioCallback, GameTime } from "./gameTime";

import { Sample } from "./sample";
import { Ticker } from "./ticker";
import { Track } from "./track";

export class SampleEntity {
  private images: AFRAME.Entity[] = [];
  private lights: AFRAME.Entity[] = [];
  private nextLoopStart = 0;
  private selectedSampleIndex = -1;

  constructor(
    private track: Track,
    private collisionHandler: CollisionHandler,
    private leftStick: AFRAME.Entity,
    private rightStick: AFRAME.Entity,
    private gameTime: GameTime) {
    gameTime.addBeatCallback(this.beatCallback);
  }

  private beatCallback: AudioCallback =
    (audioTimeS: number, beatInt: number, beatFrac: number) => {
      Debug.set(`${beatInt.toFixed(0)} = ${audioTimeS.toFixed(2)}` +
        `\nselected: ${this.selectedSampleIndex}` +
        `\nnext: ${this.nextLoopStart}`);
      if (beatInt > this.nextLoopStart) {
        this.nextLoopStart += 8;
      } else if (beatInt === this.nextLoopStart) {
        this.nextLoopStart += 8;
        if (this.selectedSampleIndex >= 0) {
          this.track.stop();
          this.track.getSample(this.selectedSampleIndex).playAt(audioTimeS);
        }
      }
    };

  public addSample(container: AFRAME.Entity, sampleIndex: number) {
    this.addClip(container, this.track, sampleIndex);
    this.addHandlers(container, this.collisionHandler,
      this.leftStick, this.rightStick, sampleIndex);
  }

  private depress(sampleIndex: number) {
    this.popUp();
    this.selectedSampleIndex = sampleIndex;
    this.images[sampleIndex].object3D.position.y = -0.08;
    this.lights[sampleIndex].setAttribute('shader', 'flat');
    Debug.set(`selected: ${this.selectedSampleIndex}` +
      `\nnext: ${this.nextLoopStart}`);
  }

  private popUp() {
    for (let sampleIndex = 0; sampleIndex < this.images.length; ++sampleIndex) {
      const image = this.images[sampleIndex];
      if (image) {
        image.object3D.position.y = 0;
      }
      const light = this.lights[sampleIndex];
      if (light) {
        light.setAttribute('shader', 'standard');
        light.setAttribute('metalness', '0.8');
        light.setAttribute('roughness', '0.1');
      }
    }
  }

  private addHandlers(
    container: AFRAME.Entity, collisionHandler: CollisionHandler,
    leftStick: AFRAME.Entity, rightStick: AFRAME.Entity,
    sampleIndex: number) {
    collisionHandler.addPair(container, leftStick, 0.1,
      (direction: CollisionDirection) => {
        if (direction == 'down') {
          this.depress(sampleIndex);
        } else {
          this.selectedSampleIndex = -1;
          this.popUp();
        }
      });
    collisionHandler.addPair(container, rightStick, 0.1,
      (direction: CollisionDirection) => {
        if (direction == 'down') {
          this.depress(sampleIndex);
        } else {
          this.selectedSampleIndex = -1;
          this.popUp();
        }
      });
  }

  private addClip(container: AFRAME.Entity, track: Track, sampleIndex: number) {
    // {
    //   const o = document.createElement('a-entity');
    //   o.setAttribute('obj-model',
    //     'obj: url(obj/trapezoid-full.obj); mtl: url(obj/trapezoid-full.mtl');
    //   o.setAttribute('shader', 'flat');
    //   o.setAttribute('rotation', '0 0 0')
    //   o.classList.add('clickable');
    //   container.appendChild(o);
    // }
    {
      const o = document.createElement('a-image');
      o.setAttribute('height', '0.2');
      o.setAttribute('width', '0.2');
      o.setAttribute('src', track.getImage(sampleIndex));
      o.setAttribute('transparent', 'true');
      o.setAttribute('opacity', '0.5');
      o.setAttribute('shader', 'flat');
      this.images[sampleIndex] = o;
      container.appendChild(o);
    }
    {
      const o = document.createElement('a-sphere');
      // o.setAttribute('segments-radial', '6');
      o.setAttribute('segments-width', '6');
      o.setAttribute('segments-height', '3');
      o.setAttribute('color', 'green');
      o.setAttribute('height', '0.02');
      // o.setAttribute('shader', 'flat');
      o.setAttribute('metalness', '0.8');
      o.setAttribute('roughness', '0.1');
      o.setAttribute('shader', 'standard');
      o.setAttribute('position', '0 -0.1 0');
      o.setAttribute('radius', '0.04');
      this.lights.push(o);
      container.appendChild(o);
    }
  }
}