class GameTime {
  constructor(bpm) {
    console.assert(bpm);
    this.bpm = bpm;
    this.elapsedMs = 0;
    this.running = false;
    this.audioCtx = null;
    this.audioCtxZero = 0;
    this.init();
  }

  async init() {
    this.audioCtx = await getContext();
  }

  start() {
    if (this.audioCtx) {
      this.running = true;
      this.audioCtxZero = this.audioCtx.currentTime - this.elapsedMs * 1000;
    }
  }

  getAudioTimeForGameTime(gameMs) {
    return this.audioCtxZero + gameMs / 1000;
  }

  getAudioTimeNow() {
    return this.audioCtxZero + this.elapsedMs / 1000;
  }

  roundQuantizeAudioTime(audioTimeS) {
    const secondsPerBeat = 60 / this.bpm;
    const beat = Math.round(audioTimeS / secondsPerBeat);
    return beat * secondsPerBeat;
  }

  getRoundQuantizedAudioTimeNow() {
    return this.roundQuantizeAudioTime(this.getAudioTimeNow());
  }

  tick(timeMs, timeDeltaMs) {
    if (this.running) {
      this.elapsedMs += timeDeltaMs;
    }
  }
}