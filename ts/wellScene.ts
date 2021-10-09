import * as AFRAME from "aframe";
import * as THREE from "three";
import { BeatOrb } from "./beatOrb";
import { GameTime } from "./gameTime";
import { Sample } from "./sample";

export class WellScene {
  private beatOrbs: BeatOrb[] = [];

  constructor() {
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
      ring.setAttribute('shader', 'flat');
      ring.setAttribute('side', 'double');
      ring.classList.add('clickable');
      player.appendChild(ring);
    }

    return ring;
  }

  private makeOctohedron(theta: number, scene: AFRAME.Entity): AFRAME.Entity {
    // const octohedron = document.createElement('a-entity');
    // //<a-entity id='octohedron' obj-model="obj: #octohedron-obj; mtl: #octohedron-mtl"></a-entity>
    // octohedron.setAttribute('obj-model',
    //   'obj: #octohedron-obj; mtl: #octohedron-mtl');
    const octohedron = document.createElement('a-sphere');
    octohedron.setAttribute('radius', '0.2');
    scene.appendChild(octohedron);
    (octohedron.object3D.position as THREE.Vector3).
      set(2 * Math.sin(theta), 1, 2 * Math.cos(theta));
    return octohedron;
  }

  init(scene: AFRAME.Entity, player: AFRAME.Entity, gameTime: GameTime) {
    let theta: number = 0;
    const bpms = [85, 90, 100, 115, 120, 145, 168];
    for (const bpm of bpms) {
      this.beatOrbs.push(new BeatOrb(this.makeOctohedron(theta, scene), bpm));
      theta += 2 * Math.PI / bpms.length;
    }

    const clapSample = new Sample('samples/handclap.mp3', gameTime);
    const clap = this.addBasket(player);
    clap.classList.add('clickable');
    clap.addEventListener("mouseenter", () => {
      const nowTime = gameTime.getAudioTimeNow();
      for (const o of this.beatOrbs) {
        o.strike(nowTime);
      }
      clapSample.playAt(nowTime);
    });
    const body = document.getElementsByTagName('body')[0];
    body.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.code === 'Space') {
        const nowTime = gameTime.getAudioTimeNow();
        for (const o of this.beatOrbs) {
          o.strike(nowTime);
        }
        clapSample.playAt(nowTime);
      }
    });
  }

  tick(timeMs: number, timeDeltaMs: number) {
    for (const o of this.beatOrbs) {
      o.tick(timeMs, timeDeltaMs);
    }
  }
}