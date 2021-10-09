import * as AFRAME from "aframe";
import { GameTime } from "./gameTime";
import { WellScene } from "./wellScene";

var gameTime: GameTime = null;
var wellScene: WellScene = null;

AFRAME.registerComponent("go", {
  init: async function () {
    gameTime = await GameTime.make(115);
    wellScene = new WellScene();
    wellScene.init(document.querySelector('a-scene'),
      document.querySelector('#player'), gameTime);
  },
  tick: function (timeMs: number, timeDeltaMs: number) {
    gameTime.tick(timeMs, timeDeltaMs);
    wellScene.tick(timeMs, timeDeltaMs);
  }
});

const body = document.getElementsByTagName('body')[0];
body.innerHTML = `
<a-scene stats go cursor="rayOrigin: mouse">
<a-assets>
  <a-asset-item id="octohedron-obj" src="obj/octohedron.obj"></a-asset-item>
  <a-asset-item id="octohedron-mtl" src="obj/octohedron.mtl"></a-asset-item>
</a-assets>

<a-sky color="black"></a-sky>
<a-entity light="type: ambient; color: #017; intensity: 0.2"></a-entity>

<a-entity id='player'>
  <a-camera position="0 1.6 0"></a-camera>
  <a-entity light="type: point; color: #fe9; intensity: 1" position="0 1.7 -0.1"></a-entity>
  <a-entity id="leftHand" laser-controls="hand: left" raycaster="objects: .clickable; far: 5;" line="color: #44d"
    pointer></a-entity>
  <a-entity id="rightHand" laser-controls="hand: right" raycaster="objects: .clickable; far: 5;" line="color: #d44"
    pointer></a-entity>
</a-entity>
  </a-scene>
`;
