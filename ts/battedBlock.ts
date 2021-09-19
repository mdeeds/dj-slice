import * as AFRAME from 'aframe';
import * as THREE from 'three';
import { Renderable } from './renderCollection';

export class BattedBlock implements Renderable {
  private position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private tmp = new THREE.Vector3(0, 0, 0);
  private static gravity = new THREE.Vector3(0, -0.001, 0);
  private static groundPlane = new THREE.Vector3(0, 1, 0);
  private entity: AFRAME.Entity;
  private bounce: number;
  constructor(sceneEl: AFRAME.Scene, position: THREE.Vector3, color: string, perfection: number) {
    this.bounce = 0.9 - Math.abs(perfection);
    this.position.copy(position);
    this.velocity.copy(position);
    this.tmp.random();
    this.tmp.multiplyScalar(0.5);
    this.velocity.add(this.tmp);
    this.velocity.normalize();
    this.velocity.multiplyScalar(0.4);

    this.entity = document.createElement('a-sphere');
    this.entity.setAttribute('radius', 0.3);
    this.entity.setAttribute('color', color);
    this.entity.object3D.position.copy(position);
    sceneEl.appendChild(this.entity);
  }

  render() {
    this.entity.object3D.position.copy(this.position);
  }

  tick(timeMs: number, timeDeltaMs: number) {
    this.position.add(this.velocity);
    this.tmp.copy(BattedBlock.gravity);
    this.tmp.multiplyScalar(timeDeltaMs);
    this.velocity.add(this.tmp);
    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.reflect(BattedBlock.groundPlane);
      this.velocity.multiplyScalar(this.bounce);
    }
  }

}