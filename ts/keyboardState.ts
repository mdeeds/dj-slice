import { AudioScene } from "./audioScene";

export class KeyboardState {
  private scene: AudioScene;
  private keysDown: Set<string> = new Set<string>();
  constructor(scene: AudioScene) {
    this.scene = scene;
    console.log('initializing keyboard');
    const body = document.getElementsByTagName('body')[0];
    body.addEventListener('keydown', (ev) => { this.handle(ev); });
    body.addEventListener('keyup', (ev) => { this.handle(ev); });
  }

  handle(ev: KeyboardEvent) {
    switch (ev.type) {
      case 'keydown':
        if (!this.keysDown.has(ev.code)) {
          this.keysDown.add(ev.code);
          this.handleTracks(ev.code);
        }
        break;
      case 'keyup': this.keysDown.delete(ev.code); break;
    }
  }

  handleTracks(code: string) {
    switch (code) {
      case 'Digit0': this.scene.triggerTrack(0); break;
      case 'Digit1': this.scene.triggerTrack(1); break;
      case 'Digit2': this.scene.triggerTrack(2); break;
      case 'Digit3': this.scene.triggerTrack(3); break;
      case 'Digit4': this.scene.triggerTrack(4); break;
      case 'Digit5': this.scene.triggerTrack(5); break;
      case 'Digit6': this.scene.triggerTrack(6); break;
      case 'Digit7': this.scene.triggerTrack(7); break;
      case 'Digit8': this.scene.triggerTrack(8); break;
      case 'Digit9': this.scene.triggerTrack(9); break;
    }
  }

  isDown(code: string) {
    return this.keysDown.has(code);
  }
}