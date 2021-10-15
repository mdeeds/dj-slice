import * as AFRAME from "aframe";

export interface Chunk {
  // adds geometry into `container`.  The geometry should
  // fit inside +/- 5m in the z direction.
  render(container: AFRAME.Entity): void;
}

export class BuildingChunk implements Chunk {
  render(container: AFRAME.Entity): void {
    console.log('Render building.');
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
    console.log('Render street.');
    const geometry = new AFRAME.THREE.Group();
    const streetTex = new AFRAME.THREE.MeshStandardMaterial({
      color: Math.trunc(Math.random() * 256 * 256 * 256)
    });
    const street = new AFRAME.THREE.PlaneGeometry(500, 10)
      .rotateX(-Math.PI / 2);
    const blackStreet = new AFRAME.THREE.Mesh(street, streetTex);
    geometry.add(blackStreet);
    container.object3D = geometry;
  }
}

export class WoodlandChunk implements Chunk {
  render(container: AFRAME.Entity): void {
    console.log('Render woodland.');
    const geometry = new AFRAME.THREE.Group();
    const floorTex = new AFRAME.THREE.MeshStandardMaterial({ color: 0x443311 });
    const floor = new AFRAME.THREE.PlaneGeometry(500, 10)
      .rotateX(-Math.PI / 2);
    const brownFloor = new AFRAME.THREE.Mesh(floor, floorTex);
    geometry.add(brownFloor);

    const treeTex = new AFRAME.THREE.MeshStandardMaterial({ color: 0x33ff55 });
    const neonTex = new AFRAME.THREE.MeshBasicMaterial({ color: 0xff33aa });
    for (let x = -200; x <= 200; x += 15 + Math.random() * 20) {
      const h = Math.random() * 10 + 5;
      const theta = 2 * Math.PI * Math.random();
      const r = 0.5 + Math.random();
      const z = (Math.random() - 0.5) * 10;
      {
        const tree = new AFRAME.THREE.ConeGeometry(
          r, h, 4, 1, /*open-ended=*/true)
          .rotateY(theta)
          .translate(x, h / 2, z);
        const greenTree = new AFRAME.THREE.Mesh(tree, treeTex);
        geometry.add(greenTree);
      }
      {
        const tree = new AFRAME.THREE.ConeGeometry(
          r * 0.9, h - 1, 4, 1, /*open-ended=*/true)
          .rotateY(theta + Math.PI / 4)
          .translate(x, h / 2, z);
        const greenTree = new AFRAME.THREE.Mesh(tree, neonTex);
        geometry.add(greenTree);
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
    console.log('Render mountain.');
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