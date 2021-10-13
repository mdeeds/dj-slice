import * as AFRAME from "aframe";
import { BeatOrb } from "./beatOrb";
import { BurnerEntity } from "./burnerEntity";
import { GameTime } from "./gameTime";
import { Sample } from "./sample";

export class WellScene {
  private beatOrbs: BeatOrb[] = [];
  private burnerEntity: BurnerEntity = null;

  constructor() {
  }

  private static kBasketRadius = 0.8;

  private addBasket(player: AFRAME.Entity) {
    {
      const c = document.createElement('a-cylinder') as AFRAME.Entity;
      c.setAttribute('height', '0.1');
      c.setAttribute('radius', WellScene.kBasketRadius);
      c.setAttribute('position', "0, 0, 0");
      c.setAttribute('material', `color: crimson`);
      player.appendChild(c);
    }
    {
      const c = document.createElement('a-cylinder') as AFRAME.Entity;
      c.setAttribute('height', '1.0');
      c.setAttribute('radius', WellScene.kBasketRadius);
      c.setAttribute('position', "0, 0.5, 0");
      c.setAttribute('material', `color: crimson`);
      c.setAttribute('open-ended', 'true');
      c.setAttribute('side', 'double');
      player.appendChild(c);
    }
    const ring = document.createElement('a-entity') as AFRAME.Entity;
    {
      for (let i = 0; i < 6; ++i) {
        const theta = Math.PI * 2 / 6 * (i + 0.5);
        let x = Math.sin(theta) * WellScene.kBasketRadius;
        let z = Math.cos(theta) * WellScene.kBasketRadius;
        {
          const bar = document.createElement('a-box');
          bar.setAttribute('height', '2');
          bar.setAttribute('depth', '0.05');
          bar.setAttribute('width', '0.05');
          bar.setAttribute('position',
            `${x} 2 ${z}`);
          bar.setAttribute('color', 'white');
          bar.setAttribute('rotation', `0 ${180 * theta / Math.PI} 0`)
          player.appendChild(bar);
        }
        {
          const bar = document.createElement('a-box');
          bar.setAttribute('height', '0.8');
          bar.setAttribute('depth', '0.08');
          bar.setAttribute('width', '0.08');
          bar.setAttribute('position',
            `${x} 2 ${z}`);
          bar.setAttribute('shader', 'flat');
          bar.classList.add('clickable');
          bar.setAttribute('color', 'white');
          bar.setAttribute('rotation', `0 ${180 * theta / Math.PI} 0`)
          ring.appendChild(bar);
        }
      }
      player.appendChild(ring);
    }

    return ring;
  }

  private addBurner(player: AFRAME.Entity) {
    const c = document.createElement('a-cylinder');
    c.setAttribute('height', '0.8');
    c.setAttribute('radius', '1.0');
    c.setAttribute('color', 'silver');
    c.setAttribute('material', 'metalness: 1');
    c.setAttribute('position', '0 3.5 0');
    player.appendChild(c);
    return c;
  }

  private makeOctohedron(theta: number, scene: AFRAME.Entity): AFRAME.Entity {
    const octohedron = document.createElement('a-entity');
    //<a-entity id='octohedron' obj-model="obj: #octohedron-obj; mtl: #octohedron-mtl"></a-entity>
    octohedron.setAttribute('obj-model',
      'obj: #octohedron-obj; mtl: #octohedron-mtl');
    // const octohedron = document.createElement('a-sphere');
    octohedron.setAttribute('radius', '0.2');
    scene.appendChild(octohedron);
    octohedron.object3D.position.
      set(2 * Math.sin(theta), 1, -2 * Math.cos(theta));
    return octohedron;
  }

  init(scene: AFRAME.Entity, player: AFRAME.Entity, gameTime: GameTime) {
    this.burnerEntity = new BurnerEntity(this.addBurner(player), gameTime);

    const bpms = [85, 115, 168];
    let theta: number = -(Math.PI / 6);
    for (const bpm of bpms) {
      this.beatOrbs.push(new BeatOrb(this.makeOctohedron(theta, scene), bpm,
        () => this.lightTheBurner(bpm)));
      theta += Math.PI / 3 / (bpms.length - 1);
    }

    const clapSample = new Sample('samples/handclap.mp3', gameTime);
    const clap = this.addBasket(player);
    clap.classList.add('clickable');
    clap.addEventListener("mouseenter", () => {
      const nowTime = gameTime.getAudioTimeNow();
      for (const o of this.beatOrbs) {
        o.strike(nowTime);
      }
      // TODO: Not quantized!!!
      clapSample.playQuantized();
    });
    const body = document.getElementsByTagName('body')[0];
    body.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.code === 'Space') {
        const nowTime = gameTime.getAudioTimeNow();
        for (const o of this.beatOrbs) {
          o.strike(nowTime);
        }
        // TODO: Not quantized!!!
        clapSample.playQuantized();
      }
    });
  }

  lightTheBurner(bpm: number) {
    for (const o of this.beatOrbs) {
      o.remove();
    }
    this.beatOrbs.splice(0);
    this.burnerEntity.start(bpm);
  }

  tick(timeMs: number, timeDeltaMs: number) {
    for (const o of this.beatOrbs) {
      o.tick(timeMs, timeDeltaMs);
    }
    this.burnerEntity.tick(timeMs, timeDeltaMs);
  }
}