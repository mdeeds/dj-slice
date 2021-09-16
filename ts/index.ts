import { FlyingBlocks } from "./flyingBlocks";
import { GameTime } from "./gameTime";
import { KeyboardState } from "./keyboardState";
import { PlayableBlocks } from "./playableBlocks";
import { AudioScene } from "./audioScene";
import { Sequence } from "./sequence";
import * as aframe from "aframe";

var gameTime: GameTime = null;
var scene: AudioScene = null;
var keyboardState: KeyboardState = null;
var playables: PlayableBlocks = null;
var fbs: FlyingBlocks = null;
var seq: Sequence = null;

console.log("AAAAA: 1");

AFRAME.registerComponent("go", {
  init: function () {
    gameTime = new GameTime(/*bpm=*/110);
    scene = new AudioScene(gameTime);
    keyboardState = new KeyboardState(scene);
    playables = new PlayableBlocks(gameTime, scene);
    fbs = new FlyingBlocks(gameTime);
    seq = new Sequence(fbs.getFactory(), gameTime);
  },
  tick: function (timeMs, timeDeltaMs) {
    fbs.tick(timeMs, timeDeltaMs);
    seq.tick(timeMs, timeDeltaMs);
    playables.tick(timeMs, timeDeltaMs);
    gameTime.tick(timeMs, timeDeltaMs);
  }
});

console.log("AAAAA: 2");

AFRAME.registerComponent("startblock", {
  init: function () {
    console.log('StartBlock');
    const start = document.querySelector('#startblock');
    start.addEventListener("mouseenter", () => {
      console.log('Starting!');
      start.remove();
      gameTime.start();
    });
  },
});

console.log("AAAAA: 3");

const body = document.getElementsByTagName('body')[0];
body.innerHTML = `
<a-scene go="1" background="black" cursor="rayOrigin: mouse">
<a-entity light="type: ambient; color: #777"></a-entity>
<a-entity light="type:directional; color: #777" position="-3 4 5"></a-entity>
<a-torus position="0 -0.2 0" radius="5.2" radius-tubular="0.2" rotation="90 0 0" color="#669">
</a-torus>
<a-cylinder position="0 -0.2 0" radius="5" height="0.4" color="#66a" opacity="0.5"></a-cylinder>
</a-plane>
<a-assets>
  <img crossorigin="anonymous" id="sky" src="img/canvas.png" />
</a-assets>
<a-sky src="#sky"></a-sky>
<a-camera position="0 3 0"></a-camera>
<a-entity id="leftHand" laser-controls="hand: left" raycaster="objects: .clickable; far: 5;" line="color: #44d"
  pointer></a-entity>
<a-entity id="rightHand" laser-controls="hand: right" raycaster="objects: .clickable; far: 5;" line="color: #d44"
  pointer></a-entity>
<a-sphere startblock="1" id='startblock' class='clickable' radius="0.5" position="0 3 -2" color="#f29"></a-sphere>
</a-scene>
`;