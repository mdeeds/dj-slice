class KeyboardState {
  constructor() {
    console.log('initializing keyboard');
    this.keysDown = new Set();
    this.freshKeys = new Set();
    const body = document.getElementsByTagName('body')[0];
    body.addEventListener('keydown', (ev) => { this.handle(ev); });
    body.addEventListener('keyup', (ev) => { this.handle(ev); });
  }

  handle(ev) {
    console.log(`${ev.type}: ${ev.code}`);
    switch (ev.type) {
      case 'keydown':
        if (!this.keysDown.has(ev.code)) {
          this.keysDown.add(ev.code);
          this.freshKeys.add(ev.code);
        }
        break;
      case 'keyup': this.keysDown.delete(ev.code); break;
    }
  }

  isDown(code) {
    return this.keysDown.has(code);
  }

  justPressed(code) {
    if (this.freshKeys.has(code)) {
      this.freshKeys.delete(code);
      console.log(`Got: ${code}`);
      return true;
    } else {
      return false;
    }
  }
}