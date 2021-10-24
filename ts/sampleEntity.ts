import * as AFRAME from "aframe";
import { AssetLibrary } from "./assetLibrary";
import { CollisionDirection, CollisionHandler } from "./collisionHandler";
import { Debug } from "./debug";
import { AudioCallback, GameTime, TimeSummary } from "./gameTime";
import { ModelUtil } from "./modelUtil";

import { Track } from "./track";

// Provides the UX connection to a TrackEntity.  All the controls
// for starting, stopping, and switching tracks are implemented in 
// this class.
//
// TODO: Add affordance for moving to the next and previous track.
export class SampleEntity {
  // Image entities that control which track is displayed visually
  private images: AFRAME.Entity[] = [];

  private light: AFRAME.Entity = null;
  private nextLoopStart = 0;
  private selectedSampleIndex = 0;
  private playing: boolean = false;
  private dial: AFRAME.Entity;

  // The image container holds everything that shifts up and down
  // along with the sample.
  private imageContainer: AFRAME.Entity;

  constructor(
    private track: Track,
    private container: AFRAME.Entity,
    private collisionHandler: CollisionHandler,
    private leftStick: AFRAME.Entity,
    private rightStick: AFRAME.Entity,
    gameTime: GameTime,
    private assets: AssetLibrary) {
    this.imageContainer = document.createElement('a-entity');
    container.appendChild(this.imageContainer);

    this.addAffordances();
    gameTime.addBeatCallback(this.beatCallback);
    for (let i = 0; i < track.numSamples(); ++i) {
      this.addClip(i);
    }
    this.setTrack(0);
  }

  private setTrack(sampleIndex: number) {
    this.selectedSampleIndex = sampleIndex;
    for (let i = 0; i < this.images.length; ++i) {
      if (i === sampleIndex) {
        this.images[i].setAttribute('visible', 'true');
      } else {
        this.images[i].setAttribute('visible', 'false');
      }
    }
  }

  private addAffordances() {
    this.addDisplays();
    this.addControls();
  }

  private addDisplays() {
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
    this.light = o;
    this.container.appendChild(o);
    this.dial = document.createElement('a-image');
    this.dial.setAttribute('height', '0.2');
    this.dial.setAttribute('width', '0.2');
    this.dial.setAttribute('src',
      `#${this.assets.getId('img/dial/dial_off.png')}`);
    this.dial.setAttribute('transparent', 'true');
    this.dial.setAttribute('shader', 'flat');
    this.dial.setAttribute('position', '0 0 -0.01');
    this.imageContainer.appendChild(this.dial);
  }

  private addControls() {
    const topZoid = ModelUtil.makeGlowingModel('trapezoid');
    this.imageContainer.appendChild(topZoid);

    // const bottomZoid = ModelUtil.makeGlowingModel('trapezoid');
    // bottomZoid.setAttribute('rotation', '0 0 180');
    // imageContainer.appendChild(bottomZoid);
    // const hex = ModelUtil.makeGlowingModel('triggers');
    // imageContainer.appendChild(hex);

    this.addHandlers(this.container, this.collisionHandler,
      this.leftStick, this.rightStick);
  }

  private lastBeatMod = -1;
  private beatCallback: AudioCallback =
    (ts: TimeSummary) => {
      if (ts.beatInt > this.nextLoopStart) {
        this.nextLoopStart += 8;
      } else if (ts.beatInt === this.nextLoopStart) {
        this.nextLoopStart += 8;
        if (this.playing) {
          this.track.stop();
          this.track.getSample(this.selectedSampleIndex).playAt(ts.audioTimeS);
        }
      }
      // Update the dial
      if (this.playing) {
        const newBeatMod = ts.beatInt % 8;
        if (newBeatMod != this.lastBeatMod) {
          this.lastBeatMod = newBeatMod;
          const m = Math.trunc(newBeatMod / 4) + 1;
          const n = newBeatMod % 4 + 1;
          const url = `img/dial/dial_${m}_${n}.png`;
          this.dial.setAttribute('src', `#${this.assets.getId(url)}`);
        }
      } else {
        this.dial.setAttribute('src',
          `#${this.assets.getId('img/dial/dial_off.png')}`);
      }
    };

  private depress() {
    this.popUp();
    this.images[this.selectedSampleIndex].object3D.position.y = -0.04;
    this.light.setAttribute('shader', 'flat');
    this.playing = true;
  }

  private popUp() {
    for (let sampleIndex = 0; sampleIndex < this.images.length; ++sampleIndex) {
      const image = this.images[sampleIndex];
      if (image) {
        image.object3D.position.y = 0;
      }
      if (this.light) {
        this.light.setAttribute('shader', 'standard');
        this.light.setAttribute('metalness', '0.8');
        this.light.setAttribute('roughness', '0.1');
      }
    }
    this.playing = false;
  }

  private addHandlers(
    container: AFRAME.Entity, collisionHandler: CollisionHandler,
    leftStick: AFRAME.Entity, rightStick: AFRAME.Entity) {
    collisionHandler.addPair(container, leftStick, 0.1,
      (direction: CollisionDirection) => {
        if (direction == 'down') {
          this.depress();
        } else {
          this.popUp();
        }
      });
    collisionHandler.addPair(container, rightStick, 0.1,
      (direction: CollisionDirection) => {
        if (direction == 'down') {
          this.depress();
        } else {
          this.popUp();
        }
      });
    // TODO: Add next/prev handlers here
  }

  // Constructs the geometry and entities that represent the 
  private addClip(sampleIndex: number) {
    const o = document.createElement('a-image');
    o.setAttribute('height', '0.2')
    o.setAttribute('width', '0.2');
    o.setAttribute('src',
      `#${this.assets.getId(this.track.getImage(sampleIndex))}`);
    o.setAttribute('transparent', 'true');
    o.setAttribute('opacity', '0.5');
    o.setAttribute('shader', 'flat');
    this.imageContainer.appendChild(o);
    this.images[sampleIndex] = o;
  }
}