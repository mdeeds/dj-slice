import * as AFRAME from "aframe";
import * as Tone from "tone";
import { CollisionDirection, CollisionHandler } from "./collisionHandler";
import { Positron, PositronConfig } from "./positron";

export class ToneEntity {
  private synth: Positron;
  constructor(private container: AFRAME.Entity,
    private collisionHandler: CollisionHandler,
    private leftStick: AFRAME.Entity, private rightStick: AFRAME.Entity) {

    this.synth = new Positron(PositronConfig.patchSoftBass);

    const notes = ['F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4'];
    this.layoutDiamond(notes);
  }

  makeKey(n: string, r = 0.05): AFRAME.Entity {
    const hitHandler = (direction: CollisionDirection) => {
      this.synth.triggerAttack(n, Tone.now());
    };
    const releaseHandler = (direction: CollisionDirection) => {
      this.synth.triggerRelease(n, Tone.now());
    };
    const o = document.createElement('a-sphere');
    o.setAttribute('radius', `${r}`);
    o.setAttribute('segments-width', '8');
    o.setAttribute('segments-height', '2');
    o.setAttribute('metalness', '0.5');
    o.setAttribute('roughness', '0.3');
    o.setAttribute('rotation', '30 0 0')
    this.collisionHandler.addPair(o, this.leftStick, 0.05,
      hitHandler, releaseHandler);
    this.collisionHandler.addPair(o, this.rightStick, 0.05,
      hitHandler, releaseHandler);
    this.container.appendChild(o);
    return o;
  }

  layoutHorizontal(notes: string[]) {
    const kStride = 0.12;
    let x = -kStride * (notes.length - 1) / 2;
    for (const n of notes) {
      this.makeKey(n).setAttribute('position', `${x} 0 0`);
      x += kStride;
    }
  }

  layoutDiamond(notes: string[]) {
    this.makeKey(notes[0]).setAttribute('position', `0 0.3 0`);

    this.makeKey(notes[1]).setAttribute('position', `-0.1 0.2 0`);
    this.makeKey(notes[2]).setAttribute('position', `0.1 0.2 0`);

    this.makeKey(notes[3], 0.04).setAttribute('position', `-0.2 0.1 0`);
    this.makeKey(notes[4]).setAttribute('position', `0 0.1 0`);
    this.makeKey(notes[5]).setAttribute('position', `0.2 0.1 0`);

    this.makeKey(notes[6], 0.04).setAttribute('position', `-0.1 0.0 0`);
    this.makeKey(notes[7]).setAttribute('position', `0.1 0.0 0`);
  }
}