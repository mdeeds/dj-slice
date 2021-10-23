import * as AFRAME from "aframe";
import { runInContext } from "vm";
import { PositronConfig } from "./positron";

class Motion {
  constructor(
    readonly p: number, readonly x: number) { }
}

/**
 * A PWLL is a PieceWise Linear Loop.  It's a piecewise function
 * defined over the interval [0, 1] where the last control point "loops"
 * back around to the first.
 */
class PWLL {
  private controlPoints: Motion[] = [];
  private firstP = 0;
  private lastP = 0;
  constructor() { }
  add(m: Motion) {
    this.controlPoints.push(m);
    this.controlPoints.sort((a: Motion, b: Motion) => a.p - b.p)
    this.lastP = this.controlPoints[this.controlPoints.length - 1].p;
    this.firstP = this.controlPoints[0].p;
  }

  log() {
    console.log(this.controlPoints);
  }

  getXdX(p: number): number[] {
    let q = 0;
    let len = 0;
    let i = 0;
    let j = 0;
    if (p > this.lastP) {
      q = (p - this.lastP);
      len = 1 - this.lastP + this.firstP;
      i = this.controlPoints.length - 1;
      j = 0;
    } else if (p < this.firstP) {
      q = (1 - this.lastP) + p;
      len = 1 - this.lastP + this.firstP;
      i = this.controlPoints.length - 1;
      j = 0;
    } else {
      while (p < this.controlPoints[i].p) {
        ++i;
      }
      j = i + 1;
      q = p - this.controlPoints[i].p;
      len = this.controlPoints[j].p - this.controlPoints[i].p;
    }
    const x = (q / len) * this.controlPoints[j].x
      + (1 - q / len) * this.controlPoints[i].x;
    const dx = (this.controlPoints[j].x - this.controlPoints[i].x) / len;
    return [x, dx];
  }
}

class Pod {
  private position: PWLL;
  // #####---  :  [5, 3]
  // #---####  :  [1, 3, 4]
  // ####---#  :  [4, 3, 1]
  // ---#####  :  [0, 3, 5]  // 0 = foot starts up

  constructor(private pattern: number[]) {
    let down = true;
    if (pattern[0] == 0) {
      down = false;
      pattern.shift();
    }
    const totalLength = pattern.reduce((a, b) => a + b, 0);

    let cumulativeLength = 0;
    this.position = new PWLL();

    if (pattern.length % 2 === 1 && down) {
      // Odd pattern, so first and last need to be merged.
      const len = pattern[0] + pattern[pattern.length - 1];
      const pEnd = pattern[0] / totalLength;
      const pStart = 1 - (pattern[pattern.length - 1] / totalLength);
      this.position.add(new Motion(pStart, -len / 2 / totalLength));
      this.position.add(new Motion(pEnd, len / 2 / totalLength))
      pattern.shift();
      pattern.pop();
      down = false;
    }

    for (let i = 0; i < pattern.length; ++i) {
      const len = pattern[i];
      const p = cumulativeLength / totalLength;
      if (down) {
        this.position.add(new Motion(p, -len / 2 / totalLength));
        let x = len / totalLength;
        this.position.add(new Motion(p + x, len / 2 / totalLength));
      }
      down = !down;
      cumulativeLength += len;
    }
    this.position.log();
  }

  getXdX(p: number): number[] {
    return this.position.getXdX(p);
  }
}

class Foot {
  private initialPosition: any;
  private static kLift = 0.02;
  constructor(private pod: Pod, private foot: AFRAME.Entity) {
    this.initialPosition = new AFRAME.THREE.Vector3();
    this.initialPosition.copy(foot.object3D.position);
  }

  setPosition(p: number, gaitM: number) {
    const [x, dx] = this.pod.getXdX(p);
    this.foot.object3D.position.copy(this.initialPosition);
    this.foot.object3D.position.x += x * gaitM;
    if (dx < 0) {
      this.foot.object3D.position.y += Foot.kLift;
    }
  }
}

class Feet {
  private feet: Foot[] = [];
  // `gaitM` : Distance traveled in one cycle of the gait.
  // `gaitMS` : Duration of the gait in milliseconds
  constructor(private gaitM: number, private gaitMS: number,
    private body: AFRAME.Entity) { }
  add(foot: Foot) {
    this.feet.push(foot);
  }
  setPositions(timeMs: number) {
    const p = (timeMs / this.gaitMS) % 1; // percentage of 800ms
    for (const foot of this.feet) {
      foot.setPosition(p, this.gaitM);
    }
    const seconds = ((timeMs % 3000) - 1500) / 1000;
    const mps = this.gaitM / (this.gaitMS / 1000);
    this.body.object3D.position.x = -mps * seconds;
  }
}

var feet: Feet = null;
var dogObject = null;

function walk() {
  // #########.......
  // #.......########
  // #########.......
  // #.......########  
  feet = new Feet(0.30, 600, document.querySelector('#body'));
  feet.add(new Foot(
    new Pod([9, 7]), document.querySelector('#foot1')));
  feet.add(new Foot(
    new Pod([1, 7, 8]), document.querySelector('#foot2')));
  feet.add(new Foot(
    new Pod([9, 7]), document.querySelector('#foot3')));
  feet.add(new Foot(
    new Pod([1, 7, 8]), document.querySelector('#foot4')));
}

function scamper() {
  // #########.......
  // #.......########
  // .#########......
  // .......#########  
  feet = new Feet(0.30, 600, document.querySelector('#body'));
  feet.add(new Foot(
    new Pod([9, 7]), document.querySelector('#foot1')));
  feet.add(new Foot(
    new Pod([1, 7, 8]), document.querySelector('#foot2')));
  feet.add(new Foot(
    new Pod([0, 9, 6]), document.querySelector('#foot3')));
  feet.add(new Foot(
    new Pod([0, 7, 9]), document.querySelector('#foot4')));
}

function stomp() {
  // ####.#####
  // #########.
  feet = new Feet(0.30, 600, document.querySelector('#body'));
  feet.add(new Foot(
    new Pod([4, 1, 5]), document.querySelector('#foot1')));
  feet.add(new Foot(
    new Pod([9, 1]), document.querySelector('#foot2')));
  feet.add(new Foot(
    new Pod([4, 1, 5]), document.querySelector('#foot3')));
  feet.add(new Foot(
    new Pod([9, 1]), document.querySelector('#foot4')));
}

function frogWalk() {
  // ####.#####
  // .#######..
  feet = new Feet(0.30, 600, document.querySelector('#body'));
  feet.add(new Foot(
    new Pod([4, 1, 5]), document.querySelector('#foot1')));
  feet.add(new Foot(
    new Pod([0, 1, 7, 2]), document.querySelector('#foot2')));
  feet.add(new Foot(
    new Pod([9, 1]), document.querySelector('#foot3')));
  feet.add(new Foot(
    new Pod([4, 1, 5]), document.querySelector('#foot4')));
}

// function run() {
//   // ##....
//   // ...##.
//   feet.push(new Foot(
//     new Pod([2, 4]), document.querySelector('#foot1')));
//   feet.push(new Foot(
//     new Pod([0, 3, 2, 1]), document.querySelector('#foot2')));
// }

// function skip() {
//   // ##....
//   // .##...
//   feet.push(new Foot(
//     new Pod([2, 4]), document.querySelector('#foot1')));
//   feet.push(new Foot(
//     new Pod([0, 1, 2, 3]), document.querySelector('#foot2')));
// }

// function amble() {
//   // ##..
//   // .##.
//   // #..#
//   // ..##
//   feet.push(new Foot(
//     new Pod([2, 2]), document.querySelector('#foot1')));
//   feet.push(new Foot(
//     new Pod([0, 1, 2, 1]), document.querySelector('#foot2')));
//   feet.push(new Foot(
//     new Pod([1, 2, 1]), document.querySelector('#foot3')));
//   feet.push(new Foot(
//     new Pod([0, 2, 2]), document.querySelector('#foot4')));
// }

function lizardTrot() {
  feet = new Feet(0.15, 600, document.querySelector('#body'));
  // https://www.researchgate.net/figure/Hildebrand-style-gait-diagrams-A-and-B-and-axial-skeleton-displacement-patterns-C-and_fig3_236460049
  // LH ###########.........
  // LF ##........##########
  // RF ###########........#
  // RH .........###########
  feet.add(new Foot(
    new Pod([11, 9]), document.querySelector('#foot1')));
  feet.add(new Foot(
    new Pod([2, 9, 9]), document.querySelector('#foot2')));
  feet.add(new Foot(
    new Pod([11, 8, 1]), document.querySelector('#foot3')));
  feet.add(new Foot(
    new Pod([0, 9, 11]), document.querySelector('#foot4')));
}

// function trot() {
//   // ##..
//   // ..##
//   // ..##
//   // ##..
//   feet.push(new Foot(
//     new Pod([2, 2]), document.querySelector('#foot1')));
//   feet.push(new Foot(
//     new Pod([0, 2, 2]), document.querySelector('#foot2')));
//   feet.push(new Foot(
//     new Pod([0, 2, 2]), document.querySelector('#foot3')));
//   feet.push(new Foot(
//     new Pod([2, 2]), document.querySelector('#foot4')));
// }

// function bound() {
//   // ...#
//   // ...#
//   // ###.
//   // ###.
//   feet.push(new Foot(
//     new Pod([0, 3, 1]), document.querySelector('#foot1')));
//   feet.push(new Foot(
//     new Pod([0, 3, 1]), document.querySelector('#foot2')));
//   feet.push(new Foot(
//     new Pod([3, 1]), document.querySelector('#foot3')));
//   feet.push(new Foot(
//     new Pod([3, 1]), document.querySelector('#foot4')));
// }

AFRAME.registerComponent("go", {
  init: async function () {
    stomp();
    dogObject = document.querySelector('#dog').object3D;
  },
  tick: function (timeMs, timeDeltaMs) {
    if (feet != null) {
      feet.setPositions(timeMs);
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
  <a-entity id='dog'>
    <a-box id='body' width=0.2 depth=0.08 height=0.01 position="0 1.5 -1" >
      <a-cylinder id='foot1' height=0.01 radius=0.01 position= "0.07 -0.02  0.08" ></a-cylinder>
      <a-cylinder id='foot2' height=0.01 radius=0.01 position="-0.07 -0.02  0.08" ></a-cylinder>
      <a-cylinder id='foot3' height=0.01 radius=0.01 position="-0.07 -0.02 -0.08" ></a-cylinder>
      <a-cylinder id='foot4' height=0.01 radius=0.01 position= "0.07 -0.02 -0.08" ></a-cylinder>
    </a-box>
    </a-entity>
</a-entity>
<a-entity id='player'>
  <a-camera id="camera" position="0 1.6 0">
    <a-entity light="type:point; intensity: 0.1; distance: 4; decay: 2" position="0 0.1 -0.1">
  </a-camera>
  <a-entity id="leftHand" hand-controls="hand: left; handModelStyle: lowPoly; color: #ffcccc"></a-entity>
  <a-entity id="rightHand" hand-controls="hand: right; handModelStyle: lowPoly; color: #ffcccc"></a-entity>
</a-entity>

</a-scene>
`;
