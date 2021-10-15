import * as AFRAME from "aframe";
import * as Tone from "tone";
import { CollisionDirection, CollisionHandler } from "./collisionHandler";

export class ToneEntity {
  private synth: Tone.Synth;
  constructor(private container: AFRAME.Entity,
    collisionHandler: CollisionHandler,
    leftStick: AFRAME.Entity, rightStick: AFRAME.Entity) {
    this.synth = new Tone.Synth().toDestination();

    const notes = ['F4', 'G4', 'A4', 'Bb4', 'C4', 'D4', 'E4', 'F4'];
    const kStride = 0.2;
    let x = -kStride * (notes.length - 1) / 2;
    for (const n of notes) {
      const o = document.createElement('a-sphere');
      o.setAttribute('radius', '0.06');
      o.setAttribute('position', `${x} 0 0`);

      const hitHandler = (direction: CollisionDirection) => {
        this.synth.triggerAttackRelease(n, "8n");
      };

      collisionHandler.addPair(o, leftStick, 0.06, hitHandler);
      collisionHandler.addPair(o, rightStick, 0.06, hitHandler);
      container.appendChild(o);
      x += kStride;
    }
  }
}