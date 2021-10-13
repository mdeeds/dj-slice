import * as AFRAME from "aframe";
import { CollisionDirection, CollisionHandler } from "./collisionHandler";
import { Debug } from "./debug";
import { GameTime } from "./gameTime";

import { Sample } from "./sample";
import { Track } from "./track";

export class SampleEntity {
  private images: AFRAME.Entity[] = [];

  constructor(
    private track: Track,
    private collisionHandler: CollisionHandler,
    private leftStick: AFRAME.Entity,
    private rightStick: AFRAME.Entity) {
  }

  public addSample(container: AFRAME.Entity, sampleIndex: number) {
    this.addClip(container, this.track, sampleIndex);
    this.addHandlers(container, this.collisionHandler,
      this.leftStick, this.rightStick, sampleIndex);
  }

  private depress(sampleIndex: number) {
    this.popUp();
    this.track.stop();
    this.track.getSample(sampleIndex).playQuantized();
    this.images[sampleIndex].object3D.position.y = -0.08;
  }

  private popUp() {
    for (let sampleIndex = 0; sampleIndex < this.images.length; ++sampleIndex) {
      const image = this.images[sampleIndex];
      if (image) {
        image.object3D.position.y = 0;
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
          this.popUp();
        }
      });
    collisionHandler.addPair(container, rightStick, 0.1,
      (direction: CollisionDirection) => {
        if (direction == 'down') {
          this.depress(sampleIndex);
        } else {
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
  }

}