import * as AFRAME from "aframe";
import * as THREE from "three";
import { CollisionHandler } from "./collisionHandler";
import { Debug } from "./debug";
import { GameTime } from "./gameTime";
import { SamplePack } from "./samplePack";
import { Track } from "./track";



var player = null;

function addBuilding(x: number, z: number, scene: AFRAME.Entity) {
  const box = document.createElement('a-box') as AFRAME.Entity;
  box.setAttribute('width', 15);
  box.setAttribute('depth', 15);
  const h = Math.random() * 50 + 20;
  box.setAttribute('height', h);
  box.setAttribute('position', `${x} ${h / 2} ${z}`)
  scene.appendChild(box);
}

function makeBalloon(player: AFRAME.Entity) {
  const baloon = document.createElement('a-sphere') as AFRAME.Entity;
  baloon.setAttribute('color', 'purple');
  baloon.setAttribute('radius', '7');
  baloon.setAttribute('position', '0 11 0');
  player.appendChild(baloon);

  const basket = document.createElement('a-cylinder') as AFRAME.Entity;
  basket.setAttribute('color', 'burlywood');
  basket.setAttribute('radius', '0.75');
  basket.setAttribute('height', '1.0');
  basket.setAttribute('position', '0 0.5 0');
  basket.setAttribute('material', 'side', 'double');
  basket.setAttribute('open-ended', 'true');
  player.appendChild(basket);

  const floor = document.createElement('a-cylinder') as AFRAME.Entity;
  floor.setAttribute('color', 'burlywood');
  floor.setAttribute('radius', '0.75');
  floor.setAttribute('height', '0.02');
  floor.setAttribute('position', '0 -0.01 0');
  player.appendChild(floor);

  const c = document.createElement('a-cylinder');
  c.setAttribute('height', '0.8');
  c.setAttribute('radius', '1.0');
  c.setAttribute('color', 'silver');
  c.setAttribute('material', 'metalness: 1');
  c.setAttribute('position', '0 3.5 0');
  player.appendChild(c);
}

function addClip(player: AFRAME.Entity, track: Track, gameTime: GameTime) {
  const container = document.createElement('a-entity');
  container.setAttribute('position', '0 1.3 -0.7');
  {
    const o = document.createElement('a-box');
    o.setAttribute('width', '0.2');
    o.setAttribute('height', '0.15');
    o.setAttribute('depth', '0.05');
    o.setAttribute('position', '0 0.30, 0');
    o.setAttribute('shader', 'flat');
    o.classList.add('clickable');
    container.appendChild(o);
  }
  {
    const o = document.createElement('a-entity');
    o.setAttribute('obj-model',
      'obj: url(obj/trapezoid-full.obj); mtl: url(obj/trapezoid-full.mtl');
    o.setAttribute('shader', 'flat');
    o.setAttribute('rotation', '0 0 180')
    o.classList.add('clickable');
    container.appendChild(o);
  }
  {
    const o = document.createElement('a-entity');
    o.setAttribute('obj-model',
      'obj: url(obj/trapezoid.obj); mtl: url(obj/trapezoid-full.mtl');
    o.setAttribute('shader', 'flat');
    o.setAttribute('rotation', '0 0 90')
    o.classList.add('clickable');
    container.appendChild(o);
  }
  {
    const o = document.createElement('a-image');
    o.setAttribute('height', '0.2');
    o.setAttribute('width', '0.2');
    o.setAttribute('src', track.getImage(0));
    o.setAttribute('transparent', 'true');
    o.setAttribute('opacity', '0.5');
    container.appendChild(o);
  }

  player.appendChild(container);
  return container;
}

function addStick(container: AFRAME.Entity) {
  {
    const o = document.createElement('a-box');
    o.setAttribute('height', '0.01');
    o.setAttribute('width', '0.01');
    o.setAttribute('depth', '0.4');
    o.setAttribute('position', '0 0 -0.2');
    o.setAttribute('color', '#422');
    o.setAttribute('shader', 'flat');
    container.appendChild(o);
  }
  {
    const o = document.createElement('a-box');
    o.setAttribute('height', '0.011');
    o.setAttribute('width', '0.011');
    o.setAttribute('depth', '0.011');
    o.setAttribute('position', '0 0 -0.4');
    o.setAttribute('color', '#f09');
    o.setAttribute('shader', 'flat');
    container.appendChild(o);
    return o;
  }
}

var leftStick: AFRAME.Entity = null;
var rightStick: AFRAME.Entity = null;
var collisionHandler: CollisionHandler = null;

AFRAME.registerComponent("go", {
  init: async function () {
    const scene = document.querySelector('a-scene');
    player = document.querySelector('#player') as AFRAME.Entity;
    makeBalloon(player);
    const assets = document.querySelector('a-assets');
    const gameTime = await GameTime.make(115);
    const samplePack = await SamplePack.load('funk', gameTime, assets)
    gameTime.start();
    Debug.init(document.querySelector('a-camera'));
    collisionHandler = new CollisionHandler();

    leftStick = addStick(document.querySelector('#leftHand'));
    rightStick = addStick(document.querySelector('#rightHand'));
    const clip = addClip(player, samplePack.tracks[0], gameTime);
    collisionHandler.addPair(clip, leftStick, 0.1, () => {
      samplePack.tracks[0].getSample(0).playAt(gameTime.getAudioTimeNow());
    });
    collisionHandler.addPair(clip, rightStick, 0.1, () => {
      samplePack.tracks[0].getSample(0).playAt(gameTime.getAudioTimeNow());
    });
  },
  tick: function (timeMs, timeDeltaMs) {
    const p = (timeMs / 1000 / 60 / 3) % 1; // percentage of three minutes

    const h = Math.sin(Math.PI * p) * 100;  // 100m maximum height
    const r = 0.5 * (1 - Math.cos(Math.PI * p)) * 2000;  // glide 2km

    player.setAttribute('position', `0, ${h}, ${-r}`);
    if (collisionHandler) {
      collisionHandler.tick(timeMs, timeDeltaMs);
    }
  }
});

const body = document.getElementsByTagName('body')[0];
body.innerHTML = `
<a-scene go="1" background="black" transparent="false" cursor="rayOrigin: mouse" stats>
<a-entity obj-model="obj: url(obj/city.obj); mtl: url(obj/city.mtl)" rotation="0 180 0"></a-entity>
<a-assets>
</a-assets>

<a-sky color="#112" radius=3000></a-sky>
<a-entity light="type: ambient; color: #777"></a-entity>
<a-entity id='player'>
<a-entity light="type:directional; color: #777" position="100 300 400"></a-entity>
<a-entity light="type:directional; color: #777" position="100 -200 500"></a-entity>
<a-camera position="0 1.6 0"></a-camera>
  <a-entity id="leftHand" laser-controls="hand: left" raycaster="objects: .clickable; far: 5;" line="color: #44d"
    pointer></a-entity>
  <a-entity id="rightHand" laser-controls="hand: right" raycaster="objects: .clickable; far: 5;" line="color: #d44"
    pointer></a-entity>
</a-entity>

</a-scene>
`;
