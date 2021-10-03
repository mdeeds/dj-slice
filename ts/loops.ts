import * as AFRAME from "aframe";
import * as THREE from "three";

AFRAME.registerComponent("go", {
  init: function () {
    const o = document.getElementById('octohedron') as AFRAME.Entity;
    const obj = o.object3D;
    (obj.position as THREE.Vector3).set(0, 1, -2);
  },
  tick: function (timeMs, timeDeltaMs) {
  }
});

const body = document.getElementsByTagName('body')[0];
body.innerHTML = `
<a-scene go="1" background="black" cursor="rayOrigin: mouse">
<a-assets>
  <a-asset-item id="octohedron-obj" src="obj/octohedron.obj"></a-asset-item>
  <a-asset-item id="octohedron-mtl" src="obj/octohedron.mtl"></a-asset-item>
</a-assets>

<a-entity light="type: ambient; color: #777"></a-entity>
<a-entity light="type:directional; color: #777" position="-3 4 5"></a-entity>
<a-camera position="0 3 0"></a-camera>
<a-entity id="leftHand" laser-controls="hand: left" raycaster="objects: .clickable; far: 5;" line="color: #44d"
  pointer></a-entity>
<a-entity id="rightHand" laser-controls="hand: right" raycaster="objects: .clickable; far: 5;" line="color: #d44"
  pointer></a-entity>

<a-entity id='octohedron' obj-model="obj: #octohedron-obj; mtl: #octohedron-mtl"></a-entity>
</a-scene>
`;
