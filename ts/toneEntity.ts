import * as AFRAME from "aframe";
import * as Tone from "tone";
import { CollisionDirection, CollisionHandler } from "./collisionHandler";

export class ToneEntity {
  private synth: Tone.Synth;
  constructor(private container: AFRAME.Entity,
    collisionHandler: CollisionHandler,
    leftStick: AFRAME.Entity, rightStick: AFRAME.Entity) {
    this.synth = new Tone.Synth().toDestination();

    const notes = ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5'];
    const kStride = 0.12;
    let x = -kStride * (notes.length - 1) / 2;
    for (const n of notes) {
      const o = document.createElement('a-sphere');
      o.setAttribute('radius', '0.05');
      o.setAttribute('segments-width', '8');
      o.setAttribute('segments-height', '2');
      o.setAttribute('metalness', '0.5');
      o.setAttribute('roughness', '0.3');
      o.setAttribute('position', `${x} 0 0`);

      const hitHandler = (direction: CollisionDirection) => {
        this.synth.triggerAttackRelease(n, "8n");
      };

      collisionHandler.addPair(o, leftStick, 0.05, hitHandler);
      collisionHandler.addPair(o, rightStick, 0.05, hitHandler);
      container.appendChild(o);
      x += kStride;
    }
  }
}