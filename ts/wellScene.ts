import * as AFRAME from "aframe";
import * as THREE from "three";
import { BeatScore } from "./beatScore";
import { GameTime } from "./gameTime";
import { Sample } from "./sample";

export class WellScene {
  private beatScore: BeatScore = null;
  private octohedron: AFRAME.Entity = null;

  constructor() {
    this.beatScore = new BeatScore(115);
  }

  private addBasket(player: AFRAME.Entity) {
    {
      const c = document.createElement('a-cylinder') as AFRAME.Entity;
      c.setAttribute('height', '0.1');
      c.setAttribute('radius', '1.5');
      c.setAttribute('position', "0, 0, 0");
      c.setAttribute('material', `color: crimson`);
      player.appendChild(c);
    }
    {
      const c = document.createElement('a-cylinder') as AFRAME.Entity;
      c.setAttribute('height', '1.0');
      c.setAttribute('radius', '1.5');
      c.setAttribute('position', "0, 0.5, 0");
      c.setAttribute('material', `color: crimson`);
      c.setAttribute('open-ended', 'true');
      c.setAttribute('side', 'double');
      player.appendChild(c);
    }
    const ring = document.createElement('a-ring') as AFRAME.Entity;
    {
      ring.setAttribute('radius-inner', '1.49');
      ring.setAttribute('radius-outer', '1.6');
      ring.setAttribute('position', "0, 1, 0");
      ring.setAttribute('rotation', '90 0 0');
      ring.setAttribute('material', `color: lightblue`);
      ring.setAttribute('side', 'double');
      player.appendChild(ring);
    }

    return ring;
  }

  init(scene: AFRAME.Entity, player: AFRAME.Entity, gameTime: GameTime) {
    this.octohedron = document.createElement('a-entity');
    //<a-entity id='octohedron' obj-model="obj: #octohedron-obj; mtl: #octohedron-mtl"></a-entity>
    this.octohedron.setAttribute('obj-model',
      'obj: #octohedron-obj; mtl: #octohedron-mtl');
    scene.appendChild(this.octohedron);
    (this.octohedron.object3D.position as THREE.Vector3).set(0, 1, -2);

    const clapSample = new Sample('samples/handclap.mp3', gameTime);
    const clap = this.addBasket(player);
    clap.classList.add('clickable');
    clap.addEventListener("mouseenter", () => {
      const nowTime = gameTime.getAudioTimeNow();
      this.beatScore.strike(nowTime);
      clapSample.playAt(nowTime);
    });
    const body = document.getElementsByTagName('body')[0];
    body.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.code === 'Space') {
        const nowTime = gameTime.getAudioTimeNow();
        this.beatScore.strike(nowTime);
        clapSample.playAt(nowTime);
      }
    });
  }

  tick(timeMs: number, timeDeltaMs: number) {
    let y = this.octohedron.object3D.position.y;
    let yv = (0.4 - this.beatScore.getCumulativeError()) * timeDeltaMs / 1000;
    this.octohedron.object3D.position.y = Math.max(0.9, y + yv);
  }
}