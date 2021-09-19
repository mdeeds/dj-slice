import { BattedBlock } from "./battedBlock";
import { Common } from "./common";
import { GameTime } from "./gameTime";
import * as AFRAME from "aframe";
import { RenderCollection } from "./renderCollection";

/**
 * A block which is flying toward the player and has not been played yet.
 */
export class FlyingBlock {
  private gameTime: GameTime;
  private box: any;
  private toTheta: number;
  private startFlyingMs: number;
  private endFlyingMs: number;
  private p: number;
  private size: number;
  private timing: number;
  private color: string;

  // How close the strike is to being perfect.  Zero = exactly on the beat
  // +/-1 is the furthest off beat we allow.
  private perfection: number;

  private renderCollection: RenderCollection;

  constructor(sceneEl: AFRAME.Scene, n: number,
    startFlyingMs: number, endFlyingMs: number,
    gameTime: GameTime, renderCollection: RenderCollection) {
    this.gameTime = gameTime;
    this.renderCollection = renderCollection;
    this.box = document.createElement("a-box");
    this.setSize(0.3);
    this.setColor('#ccc');  // Initial color
    this.toTheta = Common.indexToTheta(n);
    this.startFlyingMs = startFlyingMs;
    this.endFlyingMs = endFlyingMs;
    this.p = 0;
    this.box.object3D.rotation.set(0, -this.toTheta, 0);
    sceneEl.appendChild(this.box);

    // This is the tollerance we have for striking a block.  If you are earlier
    // or later than this, it doesn't count.  I've made this one eighth note.
    this.timing = 1000 * 60 / gameTime.getBpm() / 2;

    this.box.addEventListener("mouseenter", () => {
      if (this.perfection >= -1 && this.perfection <= 1) {
        const batted = new BattedBlock(
          sceneEl, this.box.object3D.position, this.color, this.perfection);
        this.renderCollection.add(batted);
        this.box.remove();
        this.box = null;
      }
    });
  }

  setSize(size: number) {
    if (!!this.box && this.size != size) {
      this.box.setAttribute('width', size);
      this.box.setAttribute('height', size);
      this.box.setAttribute('depth', size);
    }
  }

  setColor(color: string) {
    // We cache the color because changing an attribute is pretty
    // expensive - the color has to be parsed again, and this modifies the DOM.
    if (!!this.box && this.color != color) {
      this.box.setAttribute('color', color);
      this.color = color;
    }
  }

  isActive(): boolean {
    return !!this.box;
  }

  render(cameraAngle: number) {
    if (!this.box) {
      return;
    }
    // a1 is the percentage of the trip toward the player.  0 = far away, 
    // 1 = at the player.  The 'p' will go above 1 to allow the player to hit
    // the block a little late.
    const a1 = Math.min(1.00, this.p);

    // a2 is the percentage of the trip beyond the perfect moment.
    const a2 = Math.max(0.0, this.p - 1.0);

    const r = (1 - a1) * 50 + a1 * 3;
    const t = (1 - a1) * cameraAngle + a1 * this.toTheta;
    this.box.object3D.position.set(
      Math.cos(t) * r,
      (r * r) / 80 + 3 - 10 * a2,  // We shift the block down as it gets too late.
      Math.sin(t) * r
    );
  }

  tick(timeMs: number, timeDeltaMs: number) {
    this.perfection =
      (this.gameTime.getElapsedMs() - this.endFlyingMs) / this.timing;
    if (this.perfection > 1.0) {
      this.box.remove();
      this.box = null;
      this.p = 0;
    } else if (this.perfection > 0.25) {
      this.setColor('#f00');  // Early color
    } else if (this.perfection > -0.25) {
      this.setColor('#ff0');  // On time color
    } else if (this.perfection > -1) {
      this.setColor('#0f0');  // Late color
    } else {
      this.setColor('#ccc');  // Flying color
    }
    this.p = (this.gameTime.getElapsedMs() - this.startFlyingMs) /
      (this.endFlyingMs - this.startFlyingMs);
  }
}