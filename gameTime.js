class GameTime {
  constructor() {
    this.elapsedMs = 0;
    this.running = false;
  }

  start() {
    this.running = true;
  }

  tick(timeMs, timeDeltaMs) {
    if (this.running) {
      this.elapsedMs += timeDeltaMs;
    }
  }
}