import { BlockFactory } from "./flyingBlocks";
import { GameTime } from "./gameTime";

export class Sequence {
  private blockFactory: BlockFactory;
  private gameTime: GameTime;
  private lastBeat: number;
  private tracks: string[];
  private bpm: number;
  private millisecondsPerBeat: number;
  private millisecondsPerSubdivision: number;
  private nibbles: string;
  private running: boolean;
  constructor(blockFactory: BlockFactory, gameTime: GameTime) {
    this.blockFactory = blockFactory;
    this.gameTime = gameTime;
    this.lastBeat = -1;
    this.tracks = [
      "",  // 0
      "1   ",  // 1
      "    1               1               1   ",  // 2
      "        1   1   1   1   1   1   1   1   ",  // 3
      "          1   1   1   1   1   1   1   1 ",  // 4
      "                21 1 1 121 1 1 121 1 1 1",  // 5
      "                ",  // 6
      "                                             1",  // 7
      "                ",  // 8
      "                                               1",  // 9
    ];
    this.bpm = gameTime.getBpm();
    this.millisecondsPerBeat = 1000 * 60 / this.bpm;
    this.millisecondsPerSubdivision = this.millisecondsPerBeat / 4;
    this.nibbles = "0123456789abcdef";
    // 1             o o o o o o o o
    // e              oo  oo  oo  oo
    // +                oooo    oooo
    // a                    oooooooo
    this.running = false;
  }

  tick(timeMs: number, timeDeltaMs: number) {
    const currentBeat = Math.trunc(this.gameTime.getElapsedMs() / this.millisecondsPerBeat);
    const beatMs = currentBeat * this.millisecondsPerBeat;
    while (currentBeat > this.lastBeat) {
      ++this.lastBeat;
      for (let trackIndex = 0; trackIndex < this.tracks.length; ++trackIndex) {
        const track = this.tracks[trackIndex];
        if (this.lastBeat < 0 || this.lastBeat >= track.length) {
          continue;
        }
        const d = this.millisecondsPerSubdivision;
        let nibble = this.nibbles.indexOf(track[this.lastBeat]);
        if (nibble <= 0) {
          continue;
        }
        if (nibble & 0x1) {
          this.blockFactory(trackIndex, beatMs);
        }
        if (nibble & 0x2) {
          this.blockFactory(trackIndex, beatMs + d);
        }
        if (nibble & 0x4) {
          this.blockFactory(trackIndex, beatMs + 2 * d);
        }
        if (nibble & 0x8) {
          this.blockFactory(trackIndex, beatMs + 3 * d);
        }
      }
    }
  }
}