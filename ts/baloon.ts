import * as AFRAME from "aframe";
import * as THREE from "three";
import { CollisionHandler } from "./collisionHandler";
import { Debug } from "./debug";
import { GameTime } from "./gameTime";
import { Sample } from "./sample";
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

function addClip(player: AFRAME.Entity, track: Track, gameTime: GameTime,
  theta: number, sampleIndex: number) {
  const container = document.createElement('a-entity');
  const x = 0.7 * Math.sin(theta);
  const z = -0.7 * Math.cos(theta);
  container.setAttribute('position', `${x} 1 ${z}`);
  container.setAttribute('rotation', `0 ${-180 / Math.PI * theta} 0`)
  // {
  //   const o = document.createElement('a-box');
  //   o.setAttribute('width', '0.2');
  //   o.setAttribute('height', '0.15');
  //   o.setAttribute('depth', '0.05');
  //   o.setAttribute('position', '0 0.30, 0');
  //   o.setAttribute('shader', 'flat');
  //   o.classList.add('clickable');
  //   container.appendChild(o);
  // }
  {
    const o = document.createElement('a-entity');
    o.setAttribute('obj-model',
      'obj: url(obj/trapezoid-full.obj); mtl: url(obj/trapezoid-full.mtl');
    o.setAttribute('shader', 'flat');
    o.setAttribute('rotation', '0 0 0')
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
    o.addEventListener('mouseenter', () => {
      Debug.set(`Enter ${Math.random().toFixed(5)}`);
    });
    container.appendChild(o);
  }
  {
    const o = document.createElement('a-image');
    o.setAttribute('height', '0.2');
    o.setAttribute('width', '0.2');
    o.setAttribute('src', track.getImage(sampleIndex));
    o.setAttribute('transparent', 'true');
    o.setAttribute('opacity', '0.5');
    o.setAttribute('shader', 'flat');
    container.appendChild(o);
  }

  player.appendChild(container);
  return container;
}

const kStickLength = 0.25;
function addStick(container: AFRAME.Entity) {
  {
    const o = document.createElement('a-box');
    o.setAttribute('height', '0.01');
    o.setAttribute('width', '0.01');
    o.setAttribute('depth', kStickLength);
    o.setAttribute('position', `0 0 ${-kStickLength / 2}`);
    o.setAttribute('color', '#422');
    o.setAttribute('shader', 'flat');
    container.appendChild(o);
  }
  {
    const o = document.createElement('a-box');
    o.setAttribute('height', '0.011');
    o.setAttribute('width', '0.011');
    o.setAttribute('depth', '0.011');
    o.setAttribute('position', `0 0 ${-kStickLength}`);
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
    await gameTime.start();
    const samplePack = await SamplePack.load('funk', gameTime, assets)
    Debug.init(document.querySelector('a-camera'));
    collisionHandler = new CollisionHandler();

    leftStick = addStick(document.querySelector('#leftHand'));
    rightStick = addStick(document.querySelector('#rightHand'));

    const keyCodes = ['Digit1', 'Digit2', 'Digit3', 'Digit4',
      'KeyQ', 'KeyW', 'KeyE', 'KeyR',
      'KeyA', 'KeyS', 'KeyD', 'KeyF',
      'KeyZ', 'KeyX', 'KeyC', 'KeyV'];
    let theta = 0;
    let keyIndex = 0;
    for (const track of samplePack.tracks) {
      for (let i = 0; i < track.numSamples(); ++i) {
        const clip = addClip(player, track, gameTime, theta, i);
        collisionHandler.addPair(clip, leftStick, 0.1, () => {
          track.stop();
          track.getSample(i).playQuantized();
        });
        collisionHandler.addPair(clip, rightStick, 0.1, () => {
          track.stop();
          track.getSample(i).playQuantized();
        });
        body.addEventListener('keydown',
          ((ki: string, track: Track, sample: Sample) => {
            return (ev: KeyboardEvent) => {
              if (ev.code === ki) {
                track.stop();
                sample.playQuantized();
              }
            }
          })(keyCodes[keyIndex], track, track.getSample(i)));
        theta += Math.PI * 2 / 16;
        ++keyIndex;
      }
    }
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
<a-scene go="1" 
  fog="type: linear; color: #112; near: 2; far: 300"
  background="black" transparent="false" cursor="rayOrigin: mouse" stats>
<a-entity obj-model="obj: url(obj/city.obj); mtl: url(obj/city.mtl)" rotation="0 180 0"></a-entity>
<a-assets>
</a-assets>

<a-sky color="#112" radius=3000></a-sky>
<a-entity light="type: ambient; color: #222"></a-entity>
<a-entity light="type:directional; color: #777" position="100 200 -500 rotation="270 0 0"></a-entity>
<a-entity id='player'>
  <a-camera position="0 1.6 0">
    <a-entity light="type:point; intensity: 0.75; distance: 4; decay: 2" position="0 0.1 -0.1">
  </a-camera>
  <a-entity id="leftHand" laser-controls="hand: left" raycaster="objects: .clickable; far: 5;" line="color: #44d"
    pointer></a-entity>
  <a-entity id="rightHand" laser-controls="hand: right" raycaster="objects: .clickable; far: 5;" line="color: #d44"
    pointer></a-entity>
</a-entity>

</a-scene>
`;
