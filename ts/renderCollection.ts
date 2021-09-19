export interface Renderable {
  render(): void;
  tick(timeMs: number, timeDeltaMs: number): void;
}

export class RenderCollection {
  private collection = new Set<Renderable>();

  constructor() {
  }

  add(r: Renderable) {
    this.collection.add(r);
  }

  delete(r: Renderable) {
    this.collection.delete(r);
  }

  render() {
    for (const r of this.collection.values()) {
      r.render();
    }
  }

  tick(timeMs: number, timeDeltaMs: number) {
    for (const r of this.collection.values()) {
      r.tick(timeMs, timeDeltaMs);
    }
  }
}