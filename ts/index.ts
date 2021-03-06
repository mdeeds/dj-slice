import { FlyingBlocks } from "./flyingBlocks";
import { GameTime } from "./gameTime";
import { KeyboardState } from "./keyboardState";
import { PlayableBlocks } from "./playableBlocks";
import { Sequence } from "./sequence";
import * as AFRAME from "aframe";
import { RenderCollection } from "./renderCollection";
import { SamplePack } from "./samplePack";

var gameTime: GameTime = null;
var samplePack: SamplePack = null;
var keyboardState: KeyboardState = null;
var playables: PlayableBlocks = null;
var fbs: FlyingBlocks = null;
var seq: Sequence = null;

var renderCollection: RenderCollection = null;

console.log("AAAAA: 1");

AFRAME.registerComponent("go", {
  init: async function () {
    renderCollection = new RenderCollection();
    gameTime = await GameTime.make(/*bpm=*/115);
    samplePack = await SamplePack.load(
      'funk', gameTime, document.querySelector('a-assets'));
    console.log(samplePack.tracks);
    // fbs = new FlyingBlocks(gameTime, renderCollection);
    // seq = new Sequence(fbs.getFactory(), gameTime);
    // keyboardState = new KeyboardState(seq.getScene());
    // playables = new PlayableBlocks(gameTime, seq.getScene());
  },
  tick: function (timeMs, timeDeltaMs) {
    // renderCollection.tick(timeMs, timeDeltaMs);
    // fbs.tick(timeMs, timeDeltaMs);
    // seq.tick(timeMs, timeDeltaMs);
    // playables.tick(timeMs, timeDeltaMs);
    // gameTime.tick(timeMs, timeDeltaMs);
    // renderCollection.render();
  }
});

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

const body = document.getElementsByTagName('body')[0];
body.innerHTML = `
<a-scene go="1" background="black" cursor="rayOrigin: mouse; objects: .clickable">
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