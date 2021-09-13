function indexToTheta(index) {
  return (index * 2 * Math.PI) / 16 - Math.PI;
}

class FlyingBlock {
  constructor(scene, n, startFlyingMs, endFlyingMs) {
    this.box = document.createElement("a-box");
    this.toTheta = indexToTheta(n);
    this.startFlyingMs = startFlyingMs;
    this.endFlyingMs = endFlyingMs;
    this.p = 0;
    this.box.object3D.rotation.set(0, -this.toTheta, 0);
    scene.appendChild(this.box);
  }
  render(cameraAngle) {
    if (!this.box) {
      return;
    }
    const r = (1 - this.p) * 50 + this.p * 4;
    const t = (1 - this.p) * cameraAngle + this.p * this.toTheta;
    this.box.object3D.position.set(
      Math.cos(t) * r,
      (r * r) / 80,
      Math.sin(t) * r
    );
  }
  tick(timeMs, timeDeltaMs) {
    if (timeMs > this.endFlyingMs) {
      this.box.remove();
      this.box = null;
      this.p = 0;
    } else {
      this.p = (timeMs - this.startFlyingMs) /
        (this.endFlyingMs - this.startFlyingMs);
    }
  }
}

class PlayableBlock {
  constructor(keyboardState, keyCode, url, sceneEl, trackIndex) {
    this.keyboardState = keyboardState;
    this.code = keyCode;
    const theta = indexToTheta(trackIndex);
    this.audio = new Audio(url);
    this.box = document.createElement("a-box");
    this.box.object3D.position.set(Math.cos(theta) * 4, 0.5, Math.sin(theta) * 4);
    this.box.setAttribute("color", "#55f");
    this.box.setAttribute("opacity", 0.5);
    this.box.object3D.rotation.set(0, -theta, 0);
    sceneEl.appendChild(this.box);
    this.box.addEventListener("mouseenter", () => {
      this.box.setAttribute("color", "#f55");
      this.audio.currentTime = 0;
      this.audio.play();
    });
    this.box.addEventListener("mouseleave", () => {
      this.box.setAttribute("color", "#5f5");
    });
    this.box.addEventListener("mousedown", () => {
    });
    this.box.classList.add("clickable");
    this.elapsedMs = 0;
    this.bpm = 110;
    this.millisecondsPerBeat = 1000 * 60 / this.bpm;
  }

  tick(timeMs, timeDeltaMs) {
    this.elapsedMs += timeDeltaMs;
    const prevAngle = this.box.object3D.rotation.toArray()[1];
    const quarterTurnDuration = 1000 * 60 / this.bpm;
    this.box.object3D.rotation.set(
      0, prevAngle + Math.PI / 2 * timeDeltaMs / quarterTurnDuration, 0);
    if (this.keyboardState.justPressed(this.code)) {
      const currentBeat = Math.round(this.elapsedMs / this.millisecondsPerBeat);
      const beatMs = currentBeat * this.millisecondsPerBeat;
      if (beatMs < timeMs) {
        this.audio.currentTime = (timeMs - beatMs) / 1000;
        this.audio.play();
      } else {
        this.audio.currentTime = 0;
        this.audio.play();
        // TODO: Use WebAudio API instead for better timing.  THis timeout
        // does not perform well.
        // setTimeout(() => {
        //   this.audio.currentTime = 0;
        //   this.audio.play();
        // }, (beatMs - timeMs));
      }
    }
  }
}

function importLevel1(sceneEl, pbs) {
  pbs.splice(0);
  pbs.push(new PlayableBlock(keyboardState, 'Digit1',
    "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Fkick.wav?v=1631392733145",
    sceneEl, 3));
  pbs.push(new PlayableBlock(keyboardState, 'Digit2',
    "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Fhats.wav?v=1631392739980",
    sceneEl, 4));
  pbs.push(new PlayableBlock(keyboardState, 'Digit3',
    "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Fvirtual.wav?v=1631392748787",
    sceneEl, 5));
  pbs.push(new PlayableBlock(keyboardState, 'Digit4',
    "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Freality.wav?v=1631392757731",
    sceneEl, 6));
}

function importLevel2(sceneEl, pbs) {
  pbs.splice(0);
  pbs.push(new PlayableBlock(keyboardState, 'Digit0',
    "samples/rimshot4.mp3",
    sceneEl, 1));
  pbs.push(new PlayableBlock(keyboardState, 'Digit1',
    "samples/bass.mp3",
    sceneEl, 2));
  pbs.push(new PlayableBlock(keyboardState, 'Digit2',
    "samples/bass-drum.mp3",
    sceneEl, 3));
  pbs.push(new PlayableBlock(keyboardState, 'Digit3',
    "samples/snare-drum.mp3",
    sceneEl, 4));
  pbs.push(new PlayableBlock(keyboardState, 'Digit4',
    "samples/handclap.mp3",
    sceneEl, 5));
  pbs.push(new PlayableBlock(keyboardState, 'Digit5',
    "samples/shaker.mp3",
    sceneEl, 6));
  pbs.push(new PlayableBlock(keyboardState, 'Digit6',
    "samples/tom-run.mp3",
    sceneEl, 7));
  pbs.push(new PlayableBlock(keyboardState, 'Digit7',
    "samples/beep.mp3",
    sceneEl, 8));
  pbs.push(new PlayableBlock(keyboardState, 'Digit8',
    "samples/cymbol.mp3",
    sceneEl, 9));
}

class PlayableBlocks {
  constructor(keyboardState) {
    const sceneEl = document.querySelector("a-scene");
    this.pbs = [];
    importLevel2(sceneEl, this.pbs);
  }

  tick(timeMs, timeDeltaMs) {
    for (const pb of this.pbs) {
      pb.tick(timeMs, timeDeltaMs);
    }
  }
}

class FlyingBlocks {
  constructor() {
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
          startFlyingMs, startFlyingMs + 4000));
    }
  }
}
