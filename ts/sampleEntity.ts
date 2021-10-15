import * as AFRAME from "aframe";
import { AssetLibrary } from "./assetLibrary";
import { CollisionDirection, CollisionHandler } from "./collisionHandler";
import { Debug } from "./debug";
import { AudioCallback, GameTime, TimeSummary } from "./gameTime";
import { ModelUtil } from "./modelUtil";

import { Track } from "./track";

export class SampleEntity {
  private images: AFRAME.Entity[] = [];
  private lights: AFRAME.Entity[] = [];
  private nextLoopStart = 0;
  private selectedSampleIndex = -1;

  constructor(
    private track: Track,
    private container: AFRAME.Entity,
    private collisionHandler: CollisionHandler,
    private leftStick: AFRAME.Entity,
    private rightStick: AFRAME.Entity,
    gameTime: GameTime,
    private assets: AssetLibrary) {
    gameTime.addBeatCallback(this.beatCallback);
    this.addSample(container, 0);
  }

  private beatCallback: AudioCallback =
    (ts: TimeSummary) => {
      if (ts.beatInt > this.nextLoopStart) {
        this.nextLoopStart += 8;
      } else if (ts.beatInt === this.nextLoopStart) {
        this.nextLoopStart += 8;
        if (this.selectedSampleIndex >= 0) {
          this.track.stop();
          this.track.getSample(this.selectedSampleIndex).playAt(ts.audioTimeS);
        }
      }
    };

  private addSample(container: AFRAME.Entity, sampleIndex: number) {
    this.addClip(container, this.track, sampleIndex);
    this.addHandlers(container, this.collisionHandler,
      this.leftStick, this.rightStick, sampleIndex);
  }

  private depress(sampleIndex: number) {
    this.popUp();
    this.selectedSampleIndex = sampleIndex;
    this.images[sampleIndex].object3D.position.y = -0.04;
    this.lights[sampleIndex].setAttribute('shader', 'flat');
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
    const imageContainer = document.createElement('a-entity');
    container.appendChild(imageContainer);
    {
      const o = document.createElement('a-image');
      o.setAttribute('height', '0.2');
      o.setAttribute('width', '0.2');
      o.setAttribute('src',
        `#${this.assets.getId('img/dial/dial_off.png')}`);
      o.setAttribute('transparent', 'true');
      o.setAttribute('shader', 'flat');
      o.setAttribute('position', '0 0 -0.01');
      this.images[sampleIndex] = o;
      imageContainer.appendChild(o);
    }
    {
      const o = document.createElement('a-image');
      o.setAttribute('height', '0.2');
      o.setAttribute('width', '0.2');
      o.setAttribute('src',
        `#${this.assets.getId(track.getImage(sampleIndex))}`);
      o.setAttribute('transparent', 'true');
      o.setAttribute('opacity', '0.5');
      o.setAttribute('shader', 'flat');
      this.images[sampleIndex] = o;
      imageContainer.appendChild(o);
    }
    {
      const topZoid = ModelUtil.makeGlowingModel('trapezoid');
      imageContainer.appendChild(topZoid);
      const bottomZoid = ModelUtil.makeGlowingModel('trapezoid');
      bottomZoid.setAttribute('rotation', '0 0 180');
      imageContainer.appendChild(bottomZoid);
      // const hex = ModelUtil.makeGlowingModel('triggers');
      // imageContainer.appendChild(hex);
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
      o.setAttribute('scale', '1 0.3 1');
      this.lights.push(o);
      container.appendChild(o);
    }
  }
}