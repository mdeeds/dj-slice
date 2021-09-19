import * as AFRAME from "aframe";
import { Common } from "./common";
import { GameTime } from "./gameTime";
import { AudioScene } from "./audioScene";

export class PlayableBlock {
  private gameTime: GameTime;
  private scene: AudioScene;
  private box: AFRAME.Entity;

  constructor(sceneEl: AFRAME.Scene, trackIndex: number,
    gameTime: GameTime, scene: AudioScene) {
    this.gameTime = gameTime;
    this.scene = scene;
    const theta = Common.indexToTheta(trackIndex);
    this.box = document.createElement("a-sphere");
    this.box.setAttribute('radius', '0.2');
    this.box.object3D.position.set(Math.cos(theta) * 3, 1.5, Math.sin(theta) * 3);
    this.box.setAttribute("color", "#55f");
    this.box.setAttribute("opacity", 0.5);
    this.box.object3D.rotation.set(0, -theta, 0);
    sceneEl.appendChild(this.box);
    this.box.addEventListener("mouseenter", () => {
      this.box.setAttribute("color", "#f55");
      this.scene.triggerTrack(trackIndex);
    });
    this.box.addEventListener("mouseleave", () => {
      this.box.setAttribute("color", "#5f5");
    });
    this.box.addEventListener("mousedown", () => {
    });
  }

  tick(timeMs: number, timeDeltaMs: number) {
  }
}