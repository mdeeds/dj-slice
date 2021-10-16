import * as AFRAME from "aframe";
import * as Tone from "tone";
import { CollisionCallback, CollisionDirection, CollisionHandler } from "./collisionHandler";

export class ToneEntity {
  private synth: Tone.Synth;
  constructor(private container: AFRAME.Entity,
    private collisionHandler: CollisionHandler,
    private leftStick: AFRAME.Entity, private rightStick: AFRAME.Entity) {
    this.synth = new Tone.Synth().toDestination();

    const notes = ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5'];
    this.layoutDiamond(notes);
  }

  makeKey(n: string): AFRAME.Entity {
    const hitHandler = (direction: CollisionDirection) => {
      this.synth.triggerAttackRelease(n, "8n");
    };
    const o = document.createElement('a-sphere');
    o.setAttribute('radius', '0.05');
    o.setAttribute('segments-width', '8');
    o.setAttribute('segments-height', '2');
    o.setAttribute('metalness', '0.5');
    o.setAttribute('roughness', '0.3');
    o.setAttribute('rotation', '30 0 0')
    this.collisionHandler.addPair(o, this.leftStick, 0.05, hitHandler);
    this.collisionHandler.addPair(o, this.rightStick, 0.05, hitHandler);
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

    this.makeKey(notes[3]).setAttribute('position', `-0.2 0.1 0`);
    this.makeKey(notes[4]).setAttribute('position', `0 0.1 0`);
    this.makeKey(notes[5]).setAttribute('position', `0.2 0.1 0`);

    this.makeKey(notes[6]).setAttribute('position', `0.1 0.0 0`);
    this.makeKey(notes[7]).setAttribute('position', `-0.1 0.0 0`);
  }

}