import { AudioScene } from "./audioScene";
import { GameTime } from "./gameTime";
import { PlayableBlock } from "./playableBlock";

export class PlayableBlocks {
  pbs: PlayableBlock[];
  constructor(gameTime: GameTime, scene: AudioScene) {
    const sceneEl = document.querySelector("a-scene");
    this.pbs = [];
    for (let trackIndex = 0; trackIndex < 16; ++trackIndex) {
      if (scene.getSample(trackIndex)) {
        this.pbs.push(new PlayableBlock(sceneEl, trackIndex, gameTime, scene));
      }
    }
  }

  tick(timeMs: number, timeDeltaMs: number) {
    for (const pb of this.pbs) {
      pb.tick(timeMs, timeDeltaMs);
    }
  }
}