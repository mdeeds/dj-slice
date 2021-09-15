function indexToTheta(index) {
  return (index * 2 * Math.PI) / 16 - Math.PI;
}

class FlyingBlock {
  constructor(scene, n, startFlyingMs, endFlyingMs, gameTime) {
    this.gameTime = gameTime;
    this.box = document.createElement("a-box");
    this.setSize(0.3);
    this.setColor('#ccc');
    this.toTheta = indexToTheta(n);
    this.startFlyingMs = startFlyingMs;
    this.endFlyingMs = endFlyingMs;
    this.p = 0;
    this.box.object3D.rotation.set(0, -this.toTheta, 0);
    scene.appendChild(this.box);
    this.timing = 1000 * 60 / gameTime.bpm / 2;
  }

  setSize(size) {
    if (this.size != size) {
      this.box.setAttribute('width', size);
      this.box.setAttribute('height', size);
      this.box.setAttribute('depth', size);
    }
  }

  setColor(color) {
    if (this.color != color) {
      this.box.setAttribute('color', color);
      this.color = color;
    }
  }

  render(cameraAngle) {
    if (!this.box) {
      return;
    }
    const r = (1 - this.p) * 50 + this.p * 3;
    const t = (1 - this.p) * cameraAngle + this.p * this.toTheta;
    this.box.object3D.position.set(
      Math.cos(t) * r,
      (r * r) / 80 + 3,
      Math.sin(t) * r
    );
  }
  tick(timeMs, timeDeltaMs) {
    const perfection =
      (this.gameTime.elapsedMs - this.endFlyingMs) / this.timing;
    if (perfection > 1.0) {
      this.box.remove();
      this.box = null;
      this.p = 0;
    } else if (perfection > 0.25) {
      this.setColor('#f00');
    } else if (perfection > -0.25) {
      this.setColor('#ff0');
    } else if (perfection > -1) {
      this.setColor('#0f0');
    } else {
      this.setColor('#ccc');
    }
    this.p = (this.gameTime.elapsedMs - this.startFlyingMs) /
      (this.endFlyingMs - this.startFlyingMs);
  }
}

var _audioCtx = null;
async function getContext() {
  if (_audioCtx) {
    return _audioCtx;
  }
  return new Promise((resolve) => {
    const context = new window.AudioContext();
    if (context.state === 'running') {
      resolve(context);
    } else {
      setTimeout(async () => {
        resolve(await getContext());
      }, 500);
    }
  });
}

class Sample {
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

  async getData() {
    this.audioCtx = await getContext();
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

class PlayableBlock {
  constructor(keyboardState, keyCode, url, sceneEl, trackIndex, gameTime) {
    this.keyboardState = keyboardState;
    this.code = keyCode;
    this.gameTime = gameTime;
    const theta = indexToTheta(trackIndex);
    this.sample = new Sample(url, gameTime);
    this.box = document.createElement("a-sphere");
    this.box.setAttribute('radius', '0.2');
    this.box.object3D.position.set(Math.cos(theta) * 3, 1.5, Math.sin(theta) * 3);
    this.box.setAttribute("color", "#55f");
    this.box.setAttribute("opacity", 0.5);
    this.box.object3D.rotation.set(0, -theta, 0);
    sceneEl.appendChild(this.box);
    this.box.addEventListener("mouseenter", () => {
      this.box.setAttribute("color", "#f55");
      this.sample.playQuantized(this.gameTime.elapsedMs);
    });
    this.box.addEventListener("mouseleave", () => {
      this.box.setAttribute("color", "#5f5");
    });
    this.box.addEventListener("mousedown", () => {
    });
    // this.box.classList.add("clickable");
    this.bpm = 110;
    this.millisecondsPerBeat = 1000 * 60 / this.bpm;
  }

  tick(timeMs, timeDeltaMs) {
    const prevAngle = this.box.object3D.rotation.toArray()[1];
    const quarterTurnDuration = 1000 * 60 / this.bpm;
    this.box.object3D.rotation.set(
      0, prevAngle + Math.PI / 2 * timeDeltaMs / quarterTurnDuration, 0);
    if (this.keyboardState.justPressed(this.code)) {
      this.sample.playQuantized(this.gameTime.elapsedMs);
    }
  }
}

function importLevel1(sceneEl, pbs, gameTime) {
  pbs.splice(0);
  pbs.push(new PlayableBlock(keyboardState, 'Digit1',
    "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Fkick.wav?v=1631392733145",
    sceneEl, 3, gameTime));
  pbs.push(new PlayableBlock(keyboardState, 'Digit2',
    "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Fhats.wav?v=1631392739980",
    sceneEl, 4, gameTime));
  pbs.push(new PlayableBlock(keyboardState, 'Digit3',
    "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Fvirtual.wav?v=1631392748787",
    sceneEl, 5, gameTime));
  pbs.push(new PlayableBlock(keyboardState, 'Digit4',
    "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Freality.wav?v=1631392757731",
    sceneEl, 6, gameTime));
}

function importLevel2(sceneEl, pbs, gameTime) {
  pbs.splice(0);
  pbs.push(new PlayableBlock(keyboardState, 'Digit0',
    "samples/rimshot4.mp3",
    sceneEl, 1, gameTime));
  pbs.push(new PlayableBlock(keyboardState, 'Digit1',
    "samples/bass.mp3",
    sceneEl, 2, gameTime));
  pbs.push(new PlayableBlock(keyboardState, 'Digit2',
    "samples/bass-drum.mp3",
    sceneEl, 3, gameTime));
  pbs.push(new PlayableBlock(keyboardState, 'Digit3',
    "samples/snare-drum.mp3",
    sceneEl, 4, gameTime));
  pbs.push(new PlayableBlock(keyboardState, 'Digit4',
    "samples/handclap.mp3",
    sceneEl, 5, gameTime));
  pbs.push(new PlayableBlock(keyboardState, 'Digit5',
    "samples/shaker.mp3",
    sceneEl, 6, gameTime));
  pbs.push(new PlayableBlock(keyboardState, 'Digit6',
    "samples/tom-run.mp3",
    sceneEl, 7, gameTime));
  pbs.push(new PlayableBlock(keyboardState, 'Digit7',
    "samples/beep.mp3",
    sceneEl, 8, gameTime));
  pbs.push(new PlayableBlock(keyboardState, 'Digit8',
    "samples/cymbol.mp3",
    sceneEl, 9, gameTime));
}

class PlayableBlocks {
  constructor(keyboardState, gameTime) {
    const sceneEl = document.querySelector("a-scene");
    this.pbs = [];
    importLevel2(sceneEl, this.pbs, gameTime);
  }

  tick(timeMs, timeDeltaMs) {
    for (const pb of this.pbs) {
      pb.tick(timeMs, timeDeltaMs);
    }
  }
}

class FlyingBlocks {
  constructor(gameTime) {
    this.gameTime = gameTime;
    this.sceneEl = document.querySelector("a-scene");
    this.cameraQuaternion = new THREE.Quaternion();
    this.frameNumber = 0;
    this.beatNumber = 0;
    this.flyingBlocks = [];
  }

  tick(timeMs, timeDeltaMs) {
    const camera = document.querySelector("a-camera");
    camera.object3D.getWorldQuaternion(this.cameraQuaternion);
    this.cameraQuaternion.normalize();
    const a = this.cameraQuaternion.toArray();
    const cameraAngle = -2 * Math.atan2(a[1], a[3]) - 0.5 * Math.PI;
    for (let i = 0; i < this.flyingBlocks.length;) {
      const fb = this.flyingBlocks[i];
      fb.tick(timeMs, timeDeltaMs);
      fb.render(cameraAngle);
      if (fb.box) {
        ++i;
      } else {
        this.flyingBlocks.splice(i, 1);
      }
    }
    ++this.frameNumber;
  }

  getFactory() {
    return (trackIndex, startFlyingMs) => {
      this.flyingBlocks.push(
        new FlyingBlock(this.sceneEl, trackIndex,
          startFlyingMs, startFlyingMs + 4000, this.gameTime));
    }
  }
}
