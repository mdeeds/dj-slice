import { GameTime } from "./gameTime";
import { Sample } from "./sample";

export class AudioScene {
  private gameTime: GameTime;
  private samples: Sample[];
  constructor(gameTime) {
    this.gameTime = gameTime;
    this.samples = [];
    this.loadScene2();
  }

  loadScene1() {
    this.samples.push(null);
    this.samples.push(null);
    this.samples.push(null);
    this.samples.push(new Sample(
      "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Fkick.wav?v=1631392733145",
      this.gameTime));
    this.samples.push(new Sample(
      "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Fhats.wav?v=1631392739980",
      this.gameTime));
    this.samples.push(new Sample(
      "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Fvirtual.wav?v=1631392748787",
      this.gameTime));
    this.samples.push(new Sample(
      "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Freality.wav?v=1631392757731",
      this.gameTime));
  }

  loadScene2() {
    this.samples.push(null);
    this.samples.push(new Sample("samples/rimshot4.mp3", this.gameTime));
    this.samples.push(new Sample("samples/bass.mp3", this.gameTime));
    this.samples.push(new Sample("samples/bass-drum.mp3", this.gameTime));
    this.samples.push(new Sample("samples/snare-drum.mp3", this.gameTime));
    this.samples.push(new Sample("samples/handclap.mp3", this.gameTime));
    this.samples.push(new Sample("samples/shaker.mp3", this.gameTime));
    this.samples.push(new Sample("samples/tom-run.mp3", this.gameTime));
    this.samples.push(new Sample("samples/beep.mp3", this.gameTime));
    this.samples.push(new Sample("samples/cymbol.mp3", this.gameTime));
  }

  triggerTrackAt(track: number, gameTimeMs: number) {
    const sample = this.samples[track];
    if (sample) {
      sample.playAt(this.gameTime.getAudioTimeForGameTime(gameTimeMs));
    }
  }

  triggerTrack(track) {
    this.triggerTrackAt(track, this.gameTime.getElapsedMs());
  }

  getSample(track) {
    return this.samples[track];
  }
}