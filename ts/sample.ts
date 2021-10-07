import { Common } from "./common";
import { GameTime } from "./gameTime";

export class Sample {
  private audioCtx: AudioContext;
  private buffer: AudioBuffer;

  constructor(private url: string, private gameTime: GameTime) {
    this.audioCtx = null;
    this.buffer = null;
    this.init();
  }

  async init() {
    this.buffer = await this.getData();
  }

  async getData(): Promise<AudioBuffer> {
    this.audioCtx = await Common.getContext();
    const request = new XMLHttpRequest();
    request.open('GET', this.url, true);
    request.responseType = 'arraybuffer';
    return new Promise((resolve, reject) => {
      request.onload = () => {
        const audioData = request.response;
        this.audioCtx.decodeAudioData(audioData, function (buffer) {
          resolve(buffer);
        },
          reject);
      }
      request.send();
    });
  }

  private previousNode: AudioBufferSourceNode = null;

  stop() {
    if (this.previousNode) {
      this.previousNode.stop();
      this.previousNode = null;
    }
  }

  playAt(audioTimeS: number) {
    if (!this.audioCtx || !this.buffer) {
      console.error('Sample is not loaded!');
      return;
    }
    const audioNode = this.audioCtx.createBufferSource();
    this.previousNode = audioNode;
    audioNode.buffer = this.buffer;
    audioNode.connect(this.audioCtx.destination);
    const nowAudioTime = this.audioCtx.currentTime;
    const timeInFuture = audioTimeS - nowAudioTime;
    console.log(`play in ${timeInFuture.toFixed(2)} seconds.`);
    audioNode.start(nowAudioTime + Math.max(timeInFuture, 0),
      Math.max(0, -timeInFuture));
  }

  playQuantized(gameTimeMs) {
    const audioTimeS = this.gameTime.getAudioTimeForGameTime(gameTimeMs);
    const quantizedAudioTimeS = this.gameTime.roundQuantizeAudioTime(audioTimeS);
    this.playAt(quantizedAudioTimeS);
  }

  durationS(): number {
    return this.buffer.duration;
  }
}
