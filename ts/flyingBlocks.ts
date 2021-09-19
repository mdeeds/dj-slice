import { FlyingBlock } from "./flyingBlock";
import { GameTime } from "./gameTime";
import * as THREE from "three";
import * as AFRAME from "aframe";
import { RenderCollection } from "./renderCollection";

export type BlockFactory = (trackIndex: number, startFlyingMs: number) => void;

export class FlyingBlocks {
  private gameTime: GameTime;
  private sceneEl: AFRAME.Scene;
  private flyingBlocks: FlyingBlock[];
  private cameraQuaternion: THREE.Quaternion;
  private renderCollection: RenderCollection;

  constructor(gameTime: GameTime, renderCollection: RenderCollection) {
    this.gameTime = gameTime;
    this.renderCollection = renderCollection;
    this.sceneEl = document.querySelector("a-scene");
    this.cameraQuaternion = new THREE.Quaternion();
    this.flyingBlocks = [];
  }

  tick(timeMs: number, timeDeltaMs: number) {
    const camera = document.querySelector("a-camera");
    camera.object3D.getWorldQuaternion(this.cameraQuaternion);
    this.cameraQuaternion.normalize();
    const a = this.cameraQuaternion.toArray();
    const cameraAngle = -2 * Math.atan2(a[1], a[3]) - 0.5 * Math.PI;
    for (let i = 0; i < this.flyingBlocks.length;) {
      const fb = this.flyingBlocks[i];
      fb.tick(timeMs, timeDeltaMs);
      fb.render(cameraAngle);
      if (fb.isActive()) {
        ++i;
      } else {
        this.flyingBlocks.splice(i, 1);
      }
    }
  }

  getFactory(): BlockFactory {
    return (trackIndex: number, endFlyingMs: number) => {
      this.flyingBlocks.push(
        new FlyingBlock(this.sceneEl, trackIndex,
          endFlyingMs - 4000, endFlyingMs, this.gameTime,
          this.renderCollection));
      //TODO: end flying needs to be on the beat.
    }
  }
}
