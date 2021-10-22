import * as AFRAME from "aframe";

import { AssetLibrary } from "./assetLibrary";
import { Chunk, CityChunk, MountainChunk, WoodlandChunk, StreetChunk, BuildingChunk, OrchardChunk, TronChunk } from "./chunk";
import { ChunkSeries } from "./chunkSeries";
import { CollisionHandler } from "./collisionHandler";
import { Debug } from "./debug";
import { GameTime, TimeSummary } from "./gameTime";
import { Robot } from "./robot";
import { SampleEntity } from "./sampleEntity";
import { SamplePack } from "./samplePack";
import { Ticker } from "./ticker";
import { ToneEntity } from "./toneEntity";

var player = null;
var world = null;

function makeBalloon(player: AFRAME.Entity) {
  const balloon = document.createElement('a-sphere') as AFRAME.Entity;
  balloon.setAttribute('color', 'purple');
  balloon.setAttribute('radius', '7');
  balloon.setAttribute('position', '0 11 0');
  player.appendChild(balloon);

  const basket = document.createElement('a-entity') as AFRAME.Entity;
  basket.setAttribute('obj-model',
    "obj: url(obj/basket.obj); mtl: url(obj/basket.mtl);");
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
function addStick(container: AFRAME.Entity, gameTime: GameTime) {
  const stick = document.createElement('a-entity');
  stick.setAttribute('rotation', '45 0 0');
  addRing(stick, gameTime);
  container.appendChild(stick);
  {
    const o = document.createElement('a-box');
    o.setAttribute('height', '0.005');
    o.setAttribute('width', '0.005');
    o.setAttribute('depth', kStickLength);
    o.setAttribute('position', `0 0 ${-kStickLength / 2}`);
    o.setAttribute('color', '#223');
    o.setAttribute('shader', 'flat');
    stick.appendChild(o);
  }
  {
    const o = document.createElement('a-box');
    o.setAttribute('height', '0.011');
    o.setAttribute('width', '0.011');
    o.setAttribute('depth', '0.011');
    o.setAttribute('position', `0 0 ${-kStickLength}`);
    o.setAttribute('color', '#f09');
    o.setAttribute('shader', 'flat');
    stick.appendChild(o);
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

function worldA(gameTime: GameTime) {
  return (i: number): Chunk => {
    if (i > -10) {
      return new OrchardChunk();
    } else if (i > -30) {
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
}

function streetsOnly(gameTime: GameTime) {
  return (i: number): Chunk => {
    return new StreetChunk();
  }
}

function city(gameTime: GameTime) {
  return (i: number): Chunk => {
    if (i % 50 === 0) {
      return new CityChunk();
    } else {
      return new StreetChunk();
    }
  }
}
function tron(gameTime: GameTime) {
  return (i: number): Chunk => {
    if (i % 5 === 0) {
      return new TronChunk();
    } else {
      return new StreetChunk();
    }
  }
}

function addTones(player: AFRAME.Entity, theta: number, gameTime: GameTime) {
  const container = document.createElement('a-entity');
  const x = 0.7 * Math.sin(theta);
  const z = -0.7 * Math.cos(theta);
  container.setAttribute('position', `${x} 1.2 ${z}`);
  container.setAttribute('rotation', `0 ${-180 / Math.PI * theta} 0`);
  new ToneEntity(container, collisionHandler, leftStick, rightStick, gameTime);
  player.appendChild(container);
}

function addRing(container: AFRAME.Entity, gametime: GameTime) {
  const rings = [];
  const thetaStart = 300;
  const thetaLength = 300;
  const epsilon = 1;
  for (let i = 7; i >= 0; --i) {
    const theta = i * (thetaLength / 8) + thetaStart;
    const r = document.createElement('a-ring');
    r.setAttribute('radius-inner', '0.014');
    r.setAttribute('radius-outer', '0.016');
    r.setAttribute('position', '0 0.05 -0.1');
    r.setAttribute('rotation', '-90 0 0');
    r.setAttribute('color', 'green');
    r.setAttribute('shader', 'flat');
    r.setAttribute('theta-start', theta + epsilon);
    r.setAttribute('theta-length', thetaLength / 8 - 2 * epsilon);
    rings.push(r);
    container.appendChild(r);
  }

  gametime.addBeatCallback((ts: TimeSummary) => {
    const beatNumber = ts.beatInt % rings.length;
    for (let i = 0; i < rings.length; ++i) {
      if (i <= beatNumber) {
        rings[i].setAttribute('visible', 'true');
      } else {
        rings[i].setAttribute('visible', 'false');
      }
    }
  });
};

var buildChunkSeries = function (gameTime: GameTime) {
  const u = new URL(document.URL);
  switch (u.searchParams.get('world')) {
    case 'tron':
      chunkSeries = new ChunkSeries(tron(gameTime), 300, world);
      break;
    case 'street':
      chunkSeries = new ChunkSeries(streetsOnly(gameTime), 300, world);
      break;
    case 'city':
      chunkSeries = new ChunkSeries(city(gameTime), 300, world);
      break;
    default:
      chunkSeries = new ChunkSeries(worldA(gameTime), 300, world);
      break;
  }
}


AFRAME.registerComponent("go", {
  init: async function () {
    world = document.querySelector('#world');
    player = document.querySelector('#player') as AFRAME.Entity;
    makeBalloon(player);
    const assets = document.querySelector('a-assets');
    const gameTime = await GameTime.make(115);
    await gameTime.start();
    buildChunkSeries(gameTime);
    tickers.push(gameTime);
    const samplePack = await SamplePack.load('funk', gameTime, assets)
    Debug.init(document.querySelector('a-camera'));
    collisionHandler = new CollisionHandler();
    tickers.push(collisionHandler);
    leftStick = addStick(document.querySelector('#leftHand'), gameTime);
    rightStick = addStick(document.querySelector('#rightHand'), gameTime);

    addTones(player, -Math.PI / 2, gameTime);

    const assetLibrary = new AssetLibrary(document.querySelector('a-assets'));

    let theta = 0;
    for (const track of samplePack.tracks) {
      const container = document.createElement('a-entity');
      const x = 0.7 * Math.sin(theta);
      const z = -0.7 * Math.cos(theta);
      container.setAttribute('position', `${x} 1.3 ${z}`);
      container.setAttribute('rotation', `0 ${-180 / Math.PI * theta} 0`);
      const sampleEntity = new SampleEntity(
        track, container, collisionHandler, leftStick, rightStick,
        gameTime, assetLibrary);
      player.appendChild(container);
      theta += Math.PI * 2 / 12;
    }
    const camera = document.querySelector('#camera');
    robot = new Robot(camera,
      document.querySelector('#leftHand'),
      document.querySelector('#rightHand'),
      document.querySelector('#robot'),
      gameTime);
    tickers.push(robot);

    camera.object3D.layers.set(3);
    gameTime.addBeatCallback((ts: TimeSummary) => {
      if (ts.beatInt % 2 === 0) {
        camera.object3D.layers.set(3);
      } else {
        camera.object3D.layers.set(1);
      }
    });
  },
  tick: function (timeMs, timeDeltaMs) {
    const p = (timeMs / 1000 / 60 / 3) % 1; // percentage of three minutes

    const h = Math.sin(Math.PI * p) * 10;  // 10m maximum height
    const r = 0.5 * (1 - Math.cos(Math.PI * p)) * 2000;  // glide 2km
    if (world) {
      world.object3D.position.set(0, -h, r);
    }
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
<a-entity id='world'>
</a-entity>
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
