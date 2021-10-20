import * as AFRAME from "aframe";
import * as Tone from "tone";

import { CollisionDirection, CollisionHandler } from "./collisionHandler";
import { GameTime } from "./gameTime";
import { Positron, PositronConfig } from "./positron";

export class ToneEntity {
  private voices: Positron[] = [];
  private currentVoice = 0;
  private voiceMap = new Map<string, number>();
  private activeVoices = new Set<number>();

  constructor(private container: AFRAME.Entity,
    private collisionHandler: CollisionHandler,
    private leftStick: AFRAME.Entity, private rightStick: AFRAME.Entity,
    private gameTime: GameTime) {

    for (let i = 0; i < 6; ++i) {
      this.voices.push(new Positron(PositronConfig.patchSoftBass));
    }

    const notes = ['F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4'];
    this.layoutDiamond(notes);
    // this.layoutHorizontal(notes);
  }

  private getSynth(n: string): Positron {
    let voiceNumber = this.currentVoice;
    if (this.voiceMap.has(n)) {
      voiceNumber = this.voiceMap.get(n);
    } else {
      for (let i = 0; i < this.voices.length; ++i) {
        if (!this.activeVoices.has(this.currentVoice)) {
          break;
        }
      }
      this.voiceMap.set(n, this.currentVoice);
      this.activeVoices.add(this.currentVoice);
      voiceNumber = this.currentVoice;
      this.currentVoice = (this.currentVoice + 1) % this.voices.length;
    }
    return this.voices[voiceNumber];
  }

  private releaseSynth(n: string) {
    this.voiceMap.delete(n);
  }

  private keyNumber = 1;
  makeKey(n: string, r = 0.05): AFRAME.Entity {
    const hitHandler = (direction: CollisionDirection) => {
      this.getSynth(n).triggerAttack(n,
        this.gameTime.nextQuantizeAudioTime16n(Tone.now()));
    };
    const releaseHandler = (direction: CollisionDirection) => {
      this.getSynth(n).triggerRelease(n,
        this.gameTime.nextQuantizeAudioTime16n(Tone.now()));
      this.releaseSynth(n);
    };
    const o = document.createElement('a-sphere');
    o.setAttribute('radius', `${r} `);
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

    // Really hacky keyboard handler for testing.
    const body = document.getElementsByTagName('body')[0];
    ((k: string) => {
      body.addEventListener('keydown', (ev: KeyboardEvent) => {
        if (ev.code === k) {
          hitHandler('down');
        }
      });
      body.addEventListener('keyup', (ev: KeyboardEvent) => {
        if (ev.code === k) {
          releaseHandler('down');
        }
      });
    })(`Digit${this.keyNumber++}`);

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