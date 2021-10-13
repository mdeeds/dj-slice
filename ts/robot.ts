import * as AFRAME from "aframe";
import * as THREE from "three";
import { Debug } from "./debug";

export class Robot {

  private head: AFRAME.Entity;
  private left: AFRAME.Entity;
  private right: AFRAME.Entity;
  constructor(
    private headRef: AFRAME.Entity,
    private leftRef: AFRAME.Entity,
    private rightRef: AFRAME.Entity,
    private container: AFRAME.Entity) {
    this.head = document.createElement('a-box');
    this.head.setAttribute('color', '#fff');
    this.head.setAttribute('width', '0.5');
    this.head.setAttribute('height', '0.25');
    this.head.setAttribute('depth', '0.25');
    this.head.setAttribute('position', '0 0 0');
    this.left = document.createElement('a-box');
    this.left.setAttribute('color', '#fff');
    this.left.setAttribute('width', '0.15');
    this.left.setAttribute('height', '0.15');
    this.left.setAttribute('depth', '0.15');
    this.left.setAttribute('position', '0 0 0');
    this.right = document.createElement('a-box');
    this.right.setAttribute('color', '#fff');
    this.right.setAttribute('width', '0.15');
    this.right.setAttribute('height', '0.15');
    this.right.setAttribute('depth', '0.15');
    this.right.setAttribute('position', '0 0 0');
    container.appendChild(this.head);
    container.appendChild(this.left);
    container.appendChild(this.right);

    this.track();
  }

  private track() {
    this.head.object3D.position.copy(this.headRef.object3D.position);
    this.left.object3D.position.copy(this.leftRef.object3D.position);
    this.right.object3D.position.copy(this.rightRef.object3D.position);
    this.head.object3D.rotation.copy(this.headRef.object3D.rotation);
    this.left.object3D.rotation.copy(this.leftRef.object3D.rotation);
    this.right.object3D.rotation.copy(this.rightRef.object3D.rotation);
  }

  tick(timeMs: number, timeDeltaMs: number) {
    this.track();
  }
}