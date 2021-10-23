import * as AFRAME from "aframe";
import { Debug } from "./debug";
import { GameTime } from "./gameTime";
import { Ticker } from "./ticker";

class VectorRecording {
  private static kDivisionsPerBeat = 16;
  private static kBeatsRecorded = 8;
  private static kTotalDivisions = VectorRecording.kDivisionsPerBeat * VectorRecording.kBeatsRecorded;
  public positionRecord: any[] = [];
  public rotationRecord: any[] = [];
  constructor(private gameTime: GameTime,
    private source: any,
    private target: any) {
  }

  private lastBeat = -1;

  private recordInternal(i: number) {
    if (!this.positionRecord[i]) {
      this.positionRecord[i] = new AFRAME.THREE.Vector3();
      this.rotationRecord[i] = new AFRAME.THREE.Euler();
    }
    this.positionRecord[i].copy(this.source.position);
    this.rotationRecord[i].copy(this.source.rotation);
    this.target.position.copy(this.source.position);
    this.target.rotation.copy(this.source.rotation);
  }

  record() {
    const ts = this.gameTime.timeSummaryNow(0);
    const i = Math.trunc(
      VectorRecording.kDivisionsPerBeat *
      (ts.beatFrac % VectorRecording.kBeatsRecorded));
    let beatsSkipped =
      (i - this.lastBeat + VectorRecording.kTotalDivisions) %
      VectorRecording.kTotalDivisions;
    while (beatsSkipped > 0) {
      --beatsSkipped;
      this.lastBeat = (this.lastBeat + 1) % VectorRecording.kTotalDivisions;
      this.recordInternal(this.lastBeat);
    }
  }

  playback() {
    const ts = this.gameTime.timeSummaryNow(0);
    const i = Math.trunc(VectorRecording.kDivisionsPerBeat *
      (ts.beatFrac % VectorRecording.kBeatsRecorded));
    let beatsSkipped =
      (i - this.lastBeat + VectorRecording.kTotalDivisions) %
      VectorRecording.kTotalDivisions;
    while (beatsSkipped > 0) {
      --beatsSkipped;
      this.lastBeat = (this.lastBeat + 1) % VectorRecording.kTotalDivisions;
      if (!this.positionRecord[this.lastBeat]) {
        this.recordInternal(this.lastBeat);
      } else {
        this.target.position.copy(this.positionRecord[this.lastBeat]);
        this.target.rotation.copy(this.rotationRecord[this.lastBeat]);
      }
    }
  }
}

export class Robot implements Ticker {
  private head: AFRAME.Entity;
  private left: AFRAME.Entity;
  private right: AFRAME.Entity;

  private headRecord: VectorRecording;
  private leftRecord: VectorRecording;
  private rightRecord: VectorRecording;

  constructor(
    private headRef: AFRAME.Entity,
    private leftRef: AFRAME.Entity,
    private rightRef: AFRAME.Entity,
    private container: AFRAME.Entity,
    private gameTime: GameTime) {

    this.head = document.createElement('a-entity');
    {
      const headNeon = document.createElement('a-entity');
      headNeon.setAttribute('obj-model', 'obj: url(obj/robot-head-neon.obj);')
      headNeon.setAttribute('position', '0 0 0');
      headNeon.setAttribute('rotation', '0 -90 0');
      headNeon.setAttribute('scale', '0.15 0.15 0.15');
      headNeon.setAttribute('material', 'shader: flat; color: #00f;');
      this.head.appendChild(headNeon);
      const headMain = document.createElement('a-entity');
      headMain.setAttribute('obj-model', 'obj: url(obj/robot-head-dark.obj);')
      headMain.setAttribute('position', '0 0 0');
      headMain.setAttribute('rotation', '0 -90 0');
      headMain.setAttribute('scale', '0.15 0.15 0.15');
      headMain.setAttribute('material', 'color: #006;');
      this.head.appendChild(headMain);
    }

    this.left = document.createElement('a-box');
    this.left.setAttribute('color', '#006');
    this.left.setAttribute('width', '0.15');
    this.left.setAttribute('height', '0.15');
    this.left.setAttribute('depth', '0.15');
    this.left.setAttribute('position', '0 0 0');
    this.right = document.createElement('a-box');
    this.right.setAttribute('color', '#006');
    this.right.setAttribute('width', '0.15');
    this.right.setAttribute('height', '0.15');
    this.right.setAttribute('depth', '0.15');
    this.right.setAttribute('position', '0 0 0');
    container.appendChild(this.head);
    container.appendChild(this.left);
    container.appendChild(this.right);

    this.headRecord =
      new VectorRecording(gameTime, headRef.object3D, this.head.object3D);
    this.leftRecord =
      new VectorRecording(gameTime, leftRef.object3D, this.left.object3D);
    this.rightRecord =
      new VectorRecording(gameTime, rightRef.object3D, this.right.object3D);

    this.track();
  }

  private track() {
    if (
      this.headRef.object3D.position.y < this.leftRef.object3D.position.y ||
      this.headRef.object3D.position.y < this.rightRef.object3D.position.y) {
      this.headRecord.record();
      this.leftRecord.record();
      this.rightRecord.record();
    } else {
      this.headRecord.playback();
      this.leftRecord.playback();
      this.rightRecord.playback();
    }
  }

  tick(timeMs: number, timeDeltaMs: number) {
    this.track();
  }
}