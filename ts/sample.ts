import { Common } from "./common";
import { Debug } from "./debug";
import { GameTime } from "./gameTime";

export class Sample {
  private buffer: AudioBuffer;

  constructor(private url: string, private gameTime: GameTime) {
    this.buffer = null;
    this.init();
  }

  async init() {
    this.buffer = await this.getData();
  }

  private static numDecoded = 0;
  async getData(): Promise<AudioBuffer> {
    const request = new XMLHttpRequest();
    request.open('GET', this.url, true);
    request.responseType = 'arraybuffer';
    return new Promise((resolve, reject) => {
      request.onload = () => {
        const audioData = request.response;
        Common.audioContext().decodeAudioData(audioData, function (buffer) {
          Debug.set(`Decoded ${++(Sample.numDecoded)}`)
          resolve(buffer);
        }, function (err) {
          Debug.set(`Failed to decode ${this.url}`);
          reject(err);

        });
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

  private range() {
    let a = 0;
    let b = 0;
    for (const x of this.buffer.getChannelData(0)) {
      a = Math.min(a, x);
      b = Math.max(b, x);
    }
    return `${a.toFixed(4)} to ${b.toFixed(4)}`;
  }

  playAt(audioTimeS: number) {
    if (!this.buffer) {
      console.error('Sample is not loaded!');
      Debug.set(`Not loaded: ${this.url}`);
      return;
    } else {
      Debug.set(`Play @ ${audioTimeS.toFixed(3)}\n${this.url}` +
        `\nlength: ${this.buffer.length}` +
        `\nrange: ${this.range()}`);
    }
    const audioNode = Common.audioContext().createBufferSource();
    this.previousNode = audioNode;
    audioNode.buffer = this.buffer;
    audioNode.connect(Common.audioContext().destination);
    const nowAudioTime = Common.audioContext().currentTime;
    const timeInFuture = audioTimeS - nowAudioTime;
    // console.log(`play in ${timeInFuture.toFixed(2)} seconds.`);
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
