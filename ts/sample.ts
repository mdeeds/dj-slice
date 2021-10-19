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

  async getData(): Promise<AudioBuffer> {
    const request = new XMLHttpRequest();
    request.open('GET', this.url, true);
    request.responseType = 'arraybuffer';
    return new Promise((resolve, reject) => {
      request.onload = () => {
        const audioData = request.response;
        Common.audioContext().decodeAudioData(audioData, function (buffer) {
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
      const quantizedAudioTimeS = this.gameTime.
        roundQuantizeAudioTime1n(Common.audioContext().currentTime);
      this.previousNode.stop(quantizedAudioTimeS);
      this.previousNode = null;
    }
  }

  public playAt(audioTimeS: number) {
    if (!this.buffer) {
      console.error('Sample is not loaded!');
      Debug.set(`Not loaded: ${this.url}`);
      return;
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

  durationS(): number {
    return this.buffer.duration;
  }
}
