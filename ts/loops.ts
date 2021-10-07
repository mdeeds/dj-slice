import * as AFRAME from "aframe";
import * as THREE from "three";
import { BeatScore } from "./beatScore";
import { GameTime } from "./gameTime";
import { LooperTrack } from "./looperTrack";
import { Sample } from "./sample";

function cy0(scene: AFRAME.Entity) {
  const c = document.createElement('a-cylinder') as AFRAME.Entity;
  c.setAttribute('height', '0.1');
  c.setAttribute('radius', '1.5');
  c.setAttribute('position', "0, -0.1, 0");
  c.setAttribute('material', `color: crimson`);
  scene.appendChild(c);
}

var track: LooperTrack = null;
var gameTime: GameTime = null;
var imageEntity = null;
var lastBeat = -1;
var beatScore: BeatScore = null;
var octohedron: AFRAME.Entity = null;

function buildTracks() {
  gameTime = new GameTime(115);
  beatScore = new BeatScore(gameTime.getBpm());
  track = new LooperTrack(gameTime);
  for (const i of [1, 2, 3, 4]) {
    track.addSample(new Sample(`samples/funk/bass-${i}.m4a`, gameTime));
  }
  console.log('start');
  gameTime.start();
}

AFRAME.registerComponent("go", {
  init: function () {
    buildTracks();
    const o = document.getElementById('octohedron') as AFRAME.Entity;
    const obj = o.object3D;
    (obj.position as THREE.Vector3).set(0, 1, -2);

    const scene = document.querySelector('a-scene');
    cy0(scene);

    const assets = document.querySelector('a-assets');

    const htmlImage2 = document.createElement('img');
    htmlImage2.setAttribute('src', `img/output.png`);
    htmlImage2.id = `sample`;
    assets.appendChild(htmlImage2);

    const dialEntity = document.createElement('a-entity');
    dialEntity.setAttribute('position', '0, 1.5, -1');
    dialEntity.setAttribute('rotation', '0 0 0');
    {
      let idNumber = 0;
      for (const i of [1, 2, 3, 4]) {
        for (const j of [1, 2, 3, 4]) {
          const htmlImage = document.createElement('img');
          htmlImage.setAttribute('src', `img/dial/dial_${i}_${j}.png`);
          htmlImage.id = `dial${idNumber++}`;
          assets.appendChild(htmlImage);
        }
      }
      imageEntity = document.createElement('a-image') as AFRAME.Entity;
      imageEntity.setAttribute('src', '#dial0');
      imageEntity.setAttribute('width', '0.2');
      imageEntity.setAttribute('height', '0.2');
      imageEntity.setAttribute('position', '0, 0, -0.02');
      dialEntity.appendChild(imageEntity);
    }
    {
      const imageEntity2 = document.createElement('a-image') as AFRAME.Entity;
      imageEntity2.setAttribute('src', '#sample');
      imageEntity2.setAttribute('width', '0.2');
      imageEntity2.setAttribute('height', '0.2');
      dialEntity.appendChild(imageEntity2);
    }
    {
      const topBar = document.createElement('a-torus') as AFRAME.Entity;
      topBar.setAttribute('arc', '90');
      topBar.setAttribute('radius', '0.15');
      topBar.setAttribute('radius-tubular', '0.01');
      topBar.setAttribute('segments-radial', '8');
      topBar.setAttribute('segments-tubular', '4');
      topBar.setAttribute('rotation', '0 0 45');
      topBar.classList.add('clickable');
      topBar.addEventListener("mouseenter", () => {
        console.log('start');
        track.startLooping();
      });
      dialEntity.appendChild(topBar);
    }
    {
      const topBar = document.createElement('a-torus') as AFRAME.Entity;
      topBar.setAttribute('arc', '90');
      topBar.setAttribute('radius', '0.15');
      topBar.setAttribute('radius-tubular', '0.01');
      topBar.setAttribute('segments-radial', '8');
      topBar.setAttribute('segments-tubular', '4');
      topBar.setAttribute('rotation', '0 0 225');
      topBar.classList.add('clickable');
      topBar.addEventListener("mouseenter", () => {
        if (track.isLooping()) {
          track.stopLooping();
        } else {
          track.next();
        }
      });
      dialEntity.appendChild(topBar);
    }
    scene.appendChild(dialEntity);

    octohedron = document.querySelector('#octohedron');
    {
      const clapSample = new Sample('samples/handclap.mp3', gameTime);
      const clap = document.createElement('a-ring');
      clap.setAttribute('color', 'teal');
      clap.setAttribute('radius-inner', '0.05');
      clap.setAttribute('radius-outer', '0.15');
      clap.setAttribute('position', '-0.5 1.5 -1');
      clap.setAttribute('theta-start', '300');
      clap.setAttribute('theta-length', '120');
      const spacing = gameTime.getDurationForBeats(1);
      clap.addEventListener("mouseenter", () => {
        const nowTime = gameTime.getAudioTimeNow();
        beatScore.strike(nowTime);
        for (let i = 0; i < 4; ++i) {
          clapSample.playAt(nowTime + i * spacing);
        }
      });
      body.addEventListener('keydown', (ev: KeyboardEvent) => {
        if (ev.code === 'Space') {
          const nowTime = gameTime.getAudioTimeNow();
          beatScore.strike(nowTime);
          for (let i = 0; i < 4; ++i) {
            clapSample.playAt(nowTime + i * spacing);
          }
          console.log(`Beat score: ${beatScore.getCumulativeError()}`);
        }
      });
      scene.appendChild(clap);
    }
  },
  tick: function (timeMs, timeDeltaMs) {
    track.tick(timeMs, timeDeltaMs);
    gameTime.tick(timeMs, timeDeltaMs);
    const beat = Math.trunc(timeMs / 500) % 16;
    if (lastBeat != beat) {
      imageEntity.setAttribute('src', `#dial${beat}`);
      lastBeat = beat;
    }
    let y = octohedron.object3D.position.y;
    let yv = (0.4 - beatScore.getCumulativeError()) * timeDeltaMs / 1000;
    octohedron.object3D.position.y = Math.max(0, y + yv);
  }
});

const body = document.getElementsByTagName('body')[0];
body.innerHTML = `
<a-scene go="1" background="black" transparent="false" cursor="rayOrigin: mouse">
<a-assets>
  <a-asset-item id="octohedron-obj" src="obj/octohedron.obj"></a-asset-item>
  <a-asset-item id="octohedron-mtl" src="obj/octohedron.mtl"></a-asset-item>
</a-assets>

<a-sky src = "https://cdn.eso.org/images/screen/eso0932a.jpg"></a-sky>
<a-entity light="type: ambient; color: #777"></a-entity>
<a-entity light="type:directional; color: #777" position="-3 4 5"></a-entity>
<a-camera position="0 1.6 0"></a-camera>
<a-entity id="leftHand" laser-controls="hand: left" raycaster="objects: .clickable; far: 5;" line="color: #44d"
  pointer></a-entity>
<a-entity id="rightHand" laser-controls="hand: right" raycaster="objects: .clickable; far: 5;" line="color: #d44"
  pointer></a-entity>

<a-entity id='octohedron' obj-model="obj: #octohedron-obj; mtl: #octohedron-mtl"></a-entity>

</a-scene>
`;
