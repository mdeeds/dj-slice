import * as AFRAME from "aframe";
import * as THREE from "three";

export type CollisionCallback = () => void;


class CollisionPair {
  constructor(
    private a: AFRAME.Entity,
    private b: AFRAME.Entity,
    private r: number,
    private f: CollisionCallback) {
  }
  private aPos = new THREE.Vector3();
  private bPos = new THREE.Vector3();
  private isColliding = false;
  tick(timeMs: number, timeDeltaMs: number) {
    this.a.object3D.getWorldPosition(this.aPos);
    this.b.object3D.getWorldPosition(this.bPos);
    this.aPos.sub(this.bPos);
    if (this.aPos.length() <= this.r) {
      if (!this.isColliding) {
        this.isColliding = true;
        this.f();
      }
    } else {
      this.isColliding = false;
    }
  }
}

export class CollisionHandler {
  private pairs: CollisionPair[] = [];
  constructor() { }

  addPair(a: AFRAME.Entity, b: AFRAME.Entity, r: number, f: CollisionCallback) {
    this.pairs.push(new CollisionPair(a, b, r, f));
  }

  tick(timeMs: number, timeDeltaMs: number) {
    for (const p of this.pairs) {
      p.tick(timeMs, timeDeltaMs);
    }
  }
}