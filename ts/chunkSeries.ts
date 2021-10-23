import * as AFRAME from "aframe";

import { Chunk } from "./chunk";

export type ChunkFactory = (i: number) => Chunk;

class ChunkInSlot {
  constructor(readonly i: number, readonly chunk: AFRAME.Entity) { }
}

export class ChunkSeries {
  static kChunkSpacing = 50;

  private chunks = new Set<ChunkInSlot>();
  private minIndex = 0;
  private maxIndex = 0;
  constructor(private factory: ChunkFactory,
    private radius: number,
    private scene: AFRAME.Entity) {
    this.pushChunk(0);
    this.setPosition(0);
  }

  private pushChunk(i: number) {
    const entity = document.createElement('a-entity');
    entity.setAttribute('position', `0 0 ${i * ChunkSeries.kChunkSpacing}`);
    const chunk = this.factory(i);
    chunk.render(entity);
    this.scene.appendChild(entity);
    this.chunks.add(new ChunkInSlot(i, entity));
  }

  private previousPosition = -1;
  setPosition(z: number) {
    const i = Math.round(z / 10);
    if (i === this.previousPosition) { return; }
    this.previousPosition = i;

    const firstIndex = Math.round((z - this.radius) / ChunkSeries.kChunkSpacing);
    const lastIndex = Math.round((z + this.radius) / ChunkSeries.kChunkSpacing);

    const chunksToDelete: ChunkInSlot[] = [];
    for (const c of this.chunks) {
      if (c.i < firstIndex || c.i > lastIndex) {
        chunksToDelete.push(c);
      }
    }
    for (const c of chunksToDelete) {
      c.chunk.remove();
      this.chunks.delete(c);
    }
    while (this.minIndex > firstIndex) {
      --this.minIndex;
      this.pushChunk(this.minIndex);
    }
    while (this.maxIndex < lastIndex) {
      ++this.maxIndex;
      this.pushChunk(this.maxIndex);
    }
  }
}