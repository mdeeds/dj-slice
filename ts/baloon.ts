import * as AFRAME from "aframe";
import * as THREE from "three";



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

AFRAME.registerComponent("go", {
  init: function () {
    const scene = document.querySelector('a-scene');
    player = document.querySelector('#player') as AFRAME.Entity;

    const baloon = document.createElement('a-sphere') as AFRAME.Entity;
    baloon.setAttribute('color', 'purple');
    baloon.setAttribute('radius', '5');
    baloon.setAttribute('position', '0 8 0');
    player.appendChild(baloon);

    const basket = document.createElement('a-cylinder') as AFRAME.Entity;
    basket.setAttribute('material', 'color', 'brown');
    basket.setAttribute('radius', '0.75');
    basket.setAttribute('height', '1.0');
    basket.setAttribute('position', '0 0.5 0');
    basket.setAttribute('material', 'side', 'double');
    basket.setAttribute('open-ended', 'true');
    player.appendChild(basket);

    const floor = document.createElement('a-cylinder') as AFRAME.Entity;
    basket.setAttribute('material', 'color', 'brown');
    basket.setAttribute('radius', '0.75');
    basket.setAttribute('height', '0.02');
    basket.setAttribute('position', '0 -0.01 0');
    player.appendChild(floor);

    for (let i = -40; i <= 40; ++i) {
      for (let j = -100; j <= 0; ++j) {
        if (i % 3 == 0 || j % 6 == 0) {
          continue;
        }
        addBuilding(i * 17, j * 17, scene);
      }
    }

  },
  tick: function (timeMs, timeDeltaMs) {
    const p = (timeMs / 1000 / 60 / 3) % 1; // percentage of three minutes

    const h = Math.sin(Math.PI * p) * 100;  // 100m maximum height
    const r = (1 - Math.cos(Math.PI * p)) * 1000;  // glide 1km

    player.setAttribute('position', `0, ${h}, ${-r}`);
  }
});

const body = document.getElementsByTagName('body')[0];
body.innerHTML = `
<a-scene go="1" background="black" transparent="false" cursor="rayOrigin: mouse">
<a-assets>
</a-assets>

<a-sky color="#adf" radius=2000></a-sky>
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
