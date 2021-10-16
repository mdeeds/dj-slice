import * as AFRAME from "aframe";
import { Ticker } from "./ticker";

export type CollisionDirection = 'up' | 'down';
export type CollisionCallback = (dir: CollisionDirection) => void;

class CollisionPair implements Ticker {
  constructor(
    private a: AFRAME.Entity,
    private b: AFRAME.Entity,
    private r: number,
    private f: CollisionCallback,
    private g: CollisionCallback) {
  }
  private aPos = new AFRAME.THREE.Vector3();
  private bPos = new AFRAME.THREE.Vector3();
  private isColliding = false;
  tick(timeMs: number, timeDeltaMs: number) {
    this.a.object3D.getWorldPosition(this.aPos);
    this.b.object3D.getWorldPosition(this.bPos);
    this.aPos.sub(this.bPos);
    if (this.aPos.length() <= this.r) {
      if (!this.isColliding) {
        this.isColliding = true;
        this.f(this.aPos.y < 0 ? 'down' : 'up');
      }
    } else if (this.isColliding) {
      if (!!this.g) {
        this.g(this.aPos.y < 0 ? 'up' : 'down');
      }
      this.isColliding = false;
    }
  }
}

export class CollisionHandler implements Ticker {
  private pairs: CollisionPair[] = [];
  constructor() { }

  addPair(a: AFRAME.Entity, b: AFRAME.Entity, r: number,
    f: CollisionCallback, g: CollisionCallback = null) {
    this.pairs.push(new CollisionPair(a, b, r, f, g));
  }

  tick(timeMs: number, timeDeltaMs: number) {
    for (const p of this.pairs) {
      p.tick(timeMs, timeDeltaMs);
    }
  }
}