import { Common } from "./common";
import { GameTime } from "./gameTime";

export class Sample {
  private url: string;
  private gameTime: GameTime;
  private audioCtx: AudioContext;
  private buffer: AudioBuffer;

  constructor(url, gameTime) {
    this.url = url;
    this.gameTime = gameTime;
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

  _play(audioTimeS) {
    if (!this.audioCtx || !this.buffer) {
      return;
    }
    const audioNode = this.audioCtx.createBufferSource();
    audioNode.buffer = this.buffer;
    audioNode.connect(this.audioCtx.destination);
    const nowAudioTime = this.audioCtx.currentTime;
    const timeInFuture = audioTimeS - nowAudioTime;
    audioNode.start(nowAudioTime + Math.max(timeInFuture, 0),
      Math.max(0, -timeInFuture));
  }

  playQuantized(gameTimeMs) {
    const audioTimeS = this.gameTime.getAudioTimeForGameTime(gameTimeMs);
    const quantizedAudioTimeS = this.gameTime.roundQuantizeAudioTime(audioTimeS);
    this._play(quantizedAudioTimeS);
  }
}
