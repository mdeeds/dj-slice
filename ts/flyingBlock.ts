import { BattedBlock } from "./battedBlock";
import { Common } from "./common";
import { GameTime } from "./gameTime";
import * as AFRAME from "aframe";
import { RenderCollection } from "./renderCollection";

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
  private perfection: number;
  private renderCollection: RenderCollection;

  constructor(sceneEl: AFRAME.Scene, n: number,
    startFlyingMs: number, endFlyingMs: number,
    gameTime: GameTime, renderCollection: RenderCollection) {
    this.gameTime = gameTime;
    this.renderCollection = renderCollection;
    this.box = document.createElement("a-box");
    this.setSize(0.3);
    this.setColor('#ccc');
    this.toTheta = Common.indexToTheta(n);
    this.startFlyingMs = startFlyingMs;
    this.endFlyingMs = endFlyingMs;
    this.p = 0;
    this.box.object3D.rotation.set(0, -this.toTheta, 0);
    sceneEl.appendChild(this.box);
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
    const a1 = Math.min(1.00, this.p);
    const a2 = Math.max(0.0, this.p - 1.0);
    const r = (1 - a1) * 50 + a1 * 3;
    const t = (1 - a1) * cameraAngle + a1 * this.toTheta;
    this.box.object3D.position.set(
      Math.cos(t) * r,
      (r * r) / 80 + 3 - 10 * a2,
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
      this.setColor('#f00');
    } else if (this.perfection > -0.25) {
      this.setColor('#ff0');
    } else if (this.perfection > -1) {
      this.setColor('#0f0');
    } else {
      this.setColor('#ccc');
    }
    this.p = (this.gameTime.getElapsedMs() - this.startFlyingMs) /
      (this.endFlyingMs - this.startFlyingMs);
  }
}