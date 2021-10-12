import { GameTime } from "./gameTime";
import { Sample } from "./sample";

export class LooperTrack {
  private samples: Sample[] = [];
  private currentIndex: number = 0;
  private nextLoopAudioTimeS: number;
  constructor(private gameTime: GameTime) { }

  addSample(sample: Sample) {
    this.samples.push(sample);
  }

  private enqueue() {
    const sample = this.samples[this.currentIndex];
    sample.playQuantized();
    this.nextLoopAudioTimeS += sample.durationS();
  }

  startLooping() {
    if (this.samples.length == 0) {
      return;
    }
    this.samples[this.currentIndex].stop();
    this.nextLoopAudioTimeS = this.gameTime.getAudioTimeNow();
    this.enqueue();
  }

  stopLooping() {
    this.nextLoopAudioTimeS = null;
  }

  isLooping(): boolean {
    return !!this.nextLoopAudioTimeS;
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.samples.length;
  }

  tick(elapsedMs: number, deltaMs: number) {
    if (this.nextLoopAudioTimeS != null &&
      this.nextLoopAudioTimeS - this.gameTime.getAudioTimeNow() < 0.5) {
      this.enqueue();
    }
  }
}