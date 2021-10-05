import * as AFRAME from "aframe";
import * as THREE from "three";


function renderToCanvas(i: number, canvas: HTMLCanvasElement) {
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (i % 2 == 1) {
    ctx.fillStyle = 'red';
  } else {
    ctx.fillStyle = 'orange';
  }
  ctx.fillRect(64, 64, 256, 256);
}

function renderToUrl(i: number) {
  const canvas = document.createElement('canvas') as any as HTMLCanvasElement;
  renderToCanvas(i, canvas);
  return canvas.toDataURL();
}

function cy0(scene: AFRAME.Entity) {
  const c = document.createElement('a-cylinder') as AFRAME.Entity;
  c.setAttribute('height', '0.1');
  c.setAttribute('radius', '1.5');
  c.setAttribute('position', "0, -0.1, 0");
  c.setAttribute('material', `color: crimson`);
  scene.appendChild(c);
}

function cy1(scene: AFRAME.Entity) {
  const c = document.createElement('a-cylinder') as AFRAME.Entity;
  c.setAttribute('height', '0.1');
  c.setAttribute('radius', '1.5');
  c.setAttribute('position', "-2, 1, -3");
  c.setAttribute('material', `shader: flat; src: url(${renderToUrl(0)})`);

  function g(i: number) {
    c.setAttribute('material', `shader: flat; src: url(${renderToUrl(i)})`);
    setTimeout(() => { g(i + 1) }, 500);
  }
  g(0);

  scene.appendChild(c);
}

function cy2(scene: AFRAME.Entity) {
  const canvas = document.createElement('canvas') as any as HTMLCanvasElement;
  scene.appendChild(canvas);
  canvas.id = 'tex'
  renderToCanvas(3, canvas);
  const c = document.createElement('a-cylinder') as AFRAME.Entity;
  c.setAttribute('height', '0.1');
  c.setAttribute('radius', '1.5');
  c.setAttribute('position', "-2, 1, -3");
  c.setAttribute('material', `shader: flat; src: #tex`);
  scene.appendChild(c);
  function g(i: number) {
    renderToCanvas(i, canvas);
    setTimeout(() => { g(i + 1) }, 500);
  }
  g(0);
}

var imageEntity = null;
var lastBeat = -1;

AFRAME.registerComponent("go", {
  init: function () {
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
      imageEntity.setAttribute('position', '0, 1.5, -1.02');
      imageEntity.setAttribute('rotation', '0 0 0');
      scene.appendChild(imageEntity);
    }
    {
      const imageEntity2 = document.createElement('a-image') as AFRAME.Entity;
      imageEntity2.setAttribute('src', '#sample');
      imageEntity2.setAttribute('width', '0.2');
      imageEntity2.setAttribute('height', '0.2');
      imageEntity2.setAttribute('position', '0, 1.5, -1');
      imageEntity2.setAttribute('rotation', '0 0 0');
      scene.appendChild(imageEntity2);
    }
  },
  tick: function (timeMs, timeDeltaMs) {
    const beat = Math.trunc(timeMs / 500) % 16;
    if (lastBeat != beat) {
      imageEntity.setAttribute('src', `#dial${beat}`);
      lastBeat = beat;
    }
  }
});

const body = document.getElementsByTagName('body')[0];
body.innerHTML = `
<a-scene go="1" background="black" transparent="false" cursor="rayOrigin: mouse">
<a-assets>
  <a-asset-item id="octohedron-obj" src="obj/octohedron.obj"></a-asset-item>
  <a-asset-item id="octohedron-mtl" src="obj/octohedron.mtl"></a-asset-item>
</a-assets>

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
