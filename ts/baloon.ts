import * as AFRAME from "aframe";

import { AssetLibrary } from "./assetLibrary";
import { Chunk, MountainChunk, WoodlandChunk, StreetChunk, BuildingChunk } from "./chunk";
import { ChunkSeries } from "./chunkSeries";
import { CollisionHandler } from "./collisionHandler";
import { Debug } from "./debug";
import { GameTime } from "./gameTime";
import { Robot } from "./robot";
import { SampleEntity } from "./sampleEntity";
import { SamplePack } from "./samplePack";
import { Ticker } from "./ticker";

var player = null;

function makeBalloon(player: AFRAME.Entity) {
  const baloon = document.createElement('a-sphere') as AFRAME.Entity;
  baloon.setAttribute('color', 'purple');
  baloon.setAttribute('radius', '7');
  baloon.setAttribute('position', '0 11 0');
  player.appendChild(baloon);

  const basket = document.createElement('a-entity') as AFRAME.Entity;
  basket.setAttribute('obj-model', "obj: url(obj/basket-pipe.obj);");
  basket.setAttribute('material', 'color: #222; vertexColors: none');
  player.appendChild(basket);

  const c = document.createElement('a-cylinder');
  c.setAttribute('height', '0.8');
  c.setAttribute('radius', '1.0');
  c.setAttribute('color', 'silver');
  c.setAttribute('material', 'metalness: 1');
  c.setAttribute('position', '0 3.5 0');
  player.appendChild(c);
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
var robot: Robot = null;
var tickers: Ticker[] = [];
var chunkSeries: ChunkSeries;

var totalElapsed = 0;
var numTicks = 0;

function chunkFactory(i: number): Chunk {
  if (i > -30) {
    if (i % 7 === 0) {
      return new MountainChunk();
    } else {
      return new StreetChunk();
    }
  } else if (i > -50) {
    return new WoodlandChunk();
  } else {
    if (i % 5 === 0) {
      return new StreetChunk();
    } else {
      return new BuildingChunk();
    }
  }
}

AFRAME.registerComponent("go", {
  init: async function () {
    const scene = document.querySelector('a-scene');
    chunkSeries = new ChunkSeries(chunkFactory, 300, scene);
    player = document.querySelector('#player') as AFRAME.Entity;
    makeBalloon(player);
    const assets = document.querySelector('a-assets');
    const gameTime = await GameTime.make(115);
    await gameTime.start();
    tickers.push(gameTime);
    const samplePack = await SamplePack.load('funk', gameTime, assets)
    Debug.init(document.querySelector('a-camera'));
    collisionHandler = new CollisionHandler();
    tickers.push(collisionHandler);

    leftStick = addStick(document.querySelector('#leftHand'));
    rightStick = addStick(document.querySelector('#rightHand'));
    const assetLibrary = new AssetLibrary(document.querySelector('a-assets'));

    let theta = 0;
    for (const track of samplePack.tracks) {
      const sampleEntity = new SampleEntity(
        track, collisionHandler, leftStick, rightStick, gameTime, assetLibrary);
      for (let i = 0; i < track.numSamples(); ++i) {
        const container = document.createElement('a-entity');
        const x = 0.7 * Math.sin(theta);
        const z = -0.7 * Math.cos(theta);
        container.setAttribute('position', `${x} 1.2 ${z}`);
        container.setAttribute('rotation', `0 ${-180 / Math.PI * theta} 0`);
        sampleEntity.addSample(container, i);
        player.appendChild(container);
        theta += Math.PI * 2 / 16;
      }
    }
    robot = new Robot(document.querySelector('#camera'),
      document.querySelector('#leftHand'),
      document.querySelector('#rightHand'),
      document.querySelector('#robot'),
      gameTime);
    tickers.push(robot);
  },
  tick: function (timeMs, timeDeltaMs) {
    const p = (timeMs / 1000 / 60 / 3) % 1; // percentage of three minutes

    const h = Math.sin(Math.PI * p) * 100;  // 100m maximum height
    const r = 0.5 * (1 - Math.cos(Math.PI * p)) * 2000;  // glide 2km

    const playerPos = player.object3D.position;
    playerPos.set(0, h, -r);
    chunkSeries.setPosition(-r);
    for (const ticker of tickers) {
      ticker.tick(timeMs, timeDeltaMs);
    }
    totalElapsed += timeDeltaMs;
    numTicks++;
    if (numTicks >= 10) {
      const fps = numTicks * 1000 / totalElapsed;
      Debug.set(`${fps.toFixed(1)} fps`);
      totalElapsed = 0;
      numTicks = 0;
    }
  }
});

const body = document.getElementsByTagName('body')[0];
body.innerHTML = `
<a-scene go="1" 
  fog="type: linear; color: #112; near: 20; far: 300"
  background="black" transparent="false" cursor="rayOrigin: mouse" stats>
  <a-assets>
  </a-assets>

<a-sky color="#112" radius=3000></a-sky>
<a-entity light="type: ambient; color: #222"></a-entity>
<a-entity light="type:directional; color: #777" position="1800 5000 1200"></a-entity>

<a-entity id='player'>
  <a-entity id='robot' position = "-2 0 -2" rotation = "0 180 0"></a-entity>
  <a-sphere position="180 100 120" radius=20 color=#fff shader=flat></a-sphere>

  <a-camera id="camera" position="0 1.6 0">
    <a-entity light="type:point; intensity: 0.75; distance: 4; decay: 2" position="0 0.1 -0.1">
  </a-camera>
  <a-entity id="leftHand" laser-controls="hand: left" raycaster="objects: .clickable; far: 5;" line="color: #44d"
    pointer></a-entity>
  <a-entity id="rightHand" laser-controls="hand: right" raycaster="objects: .clickable; far: 5;" line="color: #d44"
    pointer></a-entity>
</a-entity>

</a-scene>
`;
