import * as AFRAME from "aframe";
import { GameTime, TimeSummary } from "./gameTime";

export interface Chunk {
  // adds geometry into `container`.  The geometry should
  // fit inside +/- 5m in the z direction.
  render(container: AFRAME.Entity): void;
}

export class BuildingChunk implements Chunk {
  render(container: AFRAME.Entity): void {
    const geometry = new AFRAME.THREE.Group();
    const streetTex = new AFRAME.THREE.MeshStandardMaterial({
      color: Math.trunc(Math.random() * 256 * 256 * 256)
    });
    const buildingTex = new AFRAME.THREE.MeshStandardMaterial({
      color: 0xffffff
    });

    const street = new AFRAME.THREE.PlaneGeometry(500, 10)
      .rotateX(-Math.PI / 2);
    const blackStreet = new AFRAME.THREE.Mesh(street, streetTex);
    geometry.add(blackStreet);

    for (let x = -200; x <= 200; x += 40) {
      if (Math.abs(x) < 100) {
        continue;
      }
      const h = Math.random() * 50 + 30;
      const building = new AFRAME.THREE.BoxGeometry(30, h, 9)
        .translate(x, h / 2, 0);
      const whiteBuilding = new AFRAME.THREE.Mesh(building, buildingTex);
      geometry.add(whiteBuilding);
    }

    container.object3D = geometry;
  }
}

export class StreetChunk implements Chunk {
  render(container: AFRAME.Entity): void {
    const geometry = new AFRAME.THREE.Group();
    const streetTex = new AFRAME.THREE.MeshStandardMaterial({
      color: 0x331122
    });
    const street = new AFRAME.THREE.PlaneGeometry(500, 10)
      .rotateX(-Math.PI / 2);
    const blackStreet = new AFRAME.THREE.Mesh(street, streetTex);
    geometry.add(blackStreet);
    container.object3D = geometry;
  }
}

export class WoodlandChunk implements Chunk {
  private treeTex = new AFRAME.THREE.MeshStandardMaterial({ color: 0x33ff55 });
  private neonTex = new AFRAME.THREE.MeshBasicMaterial({ color: 0xff33aa });

  render(container: AFRAME.Entity): void {
    const geometry = new AFRAME.THREE.Group();
    const floorTex = new AFRAME.THREE.MeshStandardMaterial({ color: 0x443311 });
    const floor = new AFRAME.THREE.PlaneGeometry(500, 10)
      .rotateX(-Math.PI / 2);
    const brownFloor = new AFRAME.THREE.Mesh(floor, floorTex);
    geometry.add(brownFloor);

    for (let x = -200; x <= 200; x += 35 + Math.random() * 20) {
      const h = Math.random() * 10 + 5;
      const theta = 2 * Math.PI * Math.random();
      const r = 0.5 + 2 * Math.random();
      const z = (Math.random() - 0.5) * 10;
      {
        const tree = new AFRAME.THREE.ConeGeometry(
          r, h, 3, 1, /*open-ended=*/true)
          .rotateY(theta)
          .translate(x, h / 2, z);
        const greenTree = new AFRAME.THREE.Mesh(tree, this.treeTex);
        geometry.add(greenTree);
      }
      {
        const tree = new AFRAME.THREE.ConeGeometry(
          r * 0.9, h - 1, 3, 1, /*open-ended=*/true)
          .rotateY(theta + Math.PI / 4)
          .translate(x, h / 2, z);
        const neonTree = new AFRAME.THREE.Mesh(tree, this.neonTex);
        neonTree.layers.set(2);
        geometry.add(neonTree);
      }
    }
    container.object3D = geometry;
  }
}

export class OrchardChunk implements Chunk {
  private treeTex = new AFRAME.THREE.MeshStandardMaterial({ color: 0x33ff55 });
  private neonTex = new AFRAME.THREE.MeshBasicMaterial({ color: 0xff33aa });

  render(container: AFRAME.Entity): void {
    const geometry = new AFRAME.THREE.Group();
    const floorTex = new AFRAME.THREE.MeshStandardMaterial({ color: 0x443311 });
    const floor = new AFRAME.THREE.PlaneGeometry(500, 10)
      .rotateX(-Math.PI / 2);
    const brownFloor = new AFRAME.THREE.Mesh(floor, floorTex);
    geometry.add(brownFloor);

    for (let x = -200; x <= 200; x += 35 + Math.random() * 20) {
      const h = Math.random() * 2 + 3;
      const theta = 2 * Math.PI * Math.random();
      const r = 3 + 2 * Math.random();
      const z = (Math.random() - 0.5) * 10;
      {
        const tree = new AFRAME.THREE.BoxGeometry(
          r, r, r)
          .rotateY(theta)
          .translate(x, h, z);
        const greenTree = new AFRAME.THREE.Mesh(tree, this.treeTex);
        geometry.add(greenTree);
      }
      {
        const tree = new AFRAME.THREE.BoxGeometry(
          0.1, h, 0.1)
          .rotateY(theta + Math.PI / 4)
          .translate(x, h / 2, z);
        const neonTree = new AFRAME.THREE.Mesh(tree, this.neonTex);
        // neonTree.layers.set(1);
        geometry.add(neonTree);
      }
    }
    container.object3D = geometry;
  }
}

export class MountainChunk implements Chunk {
  constructor() { }
  private mountain(hillTex: any, sign: number): any {
    const w = Math.random() * 100 + 100;
    const hill = new AFRAME.THREE.BoxGeometry(10, w, w)
      .rotateX(Math.PI / 4 + (Math.random() - 0.5) * 0.1)
      .rotateZ(-sign * (Math.PI / 4 + Math.random() * 0.2))
      .translate(sign * (10 + Math.random() * 10), 0, 0);
    const blueHill = new AFRAME.THREE.Mesh(hill, hillTex);
    return blueHill;
  }

  render(container: AFRAME.Entity): void {
    const geometry = new AFRAME.THREE.Group();
    const hillTex = new AFRAME.THREE.MeshStandardMaterial({ color: 0x4422cc });

    const floor = new AFRAME.THREE.PlaneGeometry(500, 10)
      .rotateX(-Math.PI / 2);
    const blueFloor = new AFRAME.THREE.Mesh(floor, hillTex);
    geometry.add(blueFloor);
    geometry.add(this.mountain(hillTex, 1));
    geometry.add(this.mountain(hillTex, -1));
    container.object3D = geometry;
  }
}

export class TronChunk implements Chunk {
  render(container: AFRAME.Entity): void {
    const wallTex = new AFRAME.THREE.MeshStandardMaterial({ color: 0x555555 });
    const neonTex = new AFRAME.THREE.MeshBasicMaterial({ color: 0x00ff00 });

    const geometry = new AFRAME.THREE.Group();
    const l = -Math.random() * 40 - 2;
    const r = Math.random() * 40 + 2;
    const h = 20 + Math.random() * 10;
    const w = 50;
    {
      const left = new AFRAME.THREE.BoxGeometry(w + l, h, 1)
        .translate((l - w) / 2, h / 2, 0);
      const right = new AFRAME.THREE.BoxGeometry(w - r, h, 1)
        .translate((r + w) / 2, h / 2, 0);
      const header = 50 - h;
      const top = new AFRAME.THREE.BoxGeometry(
        w * 2, header, 1)
        .translate(0, h + header / 2, 0);

      geometry.add(new AFRAME.THREE.Mesh(left, wallTex));
      geometry.add(new AFRAME.THREE.Mesh(right, wallTex));
      geometry.add(new AFRAME.THREE.Mesh(top, wallTex));
    }

    const left = new AFRAME.THREE.BoxGeometry(0.10, h, 1)
      .translate(l - 0.3, h / 2, 0.1);
    const right = new AFRAME.THREE.BoxGeometry(0.10, h, 1)
      .translate(r + 0.3, h / 2, 0.1);
    const top = new AFRAME.THREE.BoxGeometry(
      r - l, 0.10, 1)
      .translate((l + r) / 2, h + 0.3, 0.1);

    geometry.add(new AFRAME.THREE.Mesh(left, neonTex));
    geometry.add(new AFRAME.THREE.Mesh(right, neonTex));
    geometry.add(new AFRAME.THREE.Mesh(top, neonTex));

    // Floor
    const streetTex = new AFRAME.THREE.MeshStandardMaterial({
      color: 0x221133
    });
    const street = new AFRAME.THREE.PlaneGeometry(500, 10)
      .rotateX(-Math.PI / 2);
    const blackStreet = new AFRAME.THREE.Mesh(street, streetTex);
    geometry.add(blackStreet);


    container.object3D = geometry;
  }
}

export class CityChunk implements Chunk {
  render(container: AFRAME.Entity): void {
    const city = document.createElement('a-entity') as AFRAME.Entity;
    city.setAttribute('obj-model',
      "obj: url(obj/city.obj); mtl: url(obj/city.mtl);");
    city.setAttribute('rotation', '0 180 0');
    console.log('city');
    container.appendChild(city);
  }
}