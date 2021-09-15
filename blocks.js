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
    this.perfection =
      (this.gameTime.elapsedMs - this.endFlyingMs) / this.timing;
    if (this.perfection > 1.0) {
      this.box.remove();
      this.box = null;
      this.p = 0;
    } else if (this.perfection > 0.25) {
      this.setColor('#f00');
    } else if (this.perfection > -0.25) {
      this.setColor('#ff0');
    } else if (this.perfection > -1) {
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

class PlayableBlock {
  constructor(sceneEl, trackIndex, gameTime, scene) {
    this.gameTime = gameTime;
    this.scene = scene;
    const theta = indexToTheta(trackIndex);
    this.box = document.createElement("a-sphere");
    this.box.setAttribute('radius', '0.2');
    this.box.object3D.position.set(Math.cos(theta) * 3, 1.5, Math.sin(theta) * 3);
    this.box.setAttribute("color", "#55f");
    this.box.setAttribute("opacity", 0.5);
    this.box.object3D.rotation.set(0, -theta, 0);
    sceneEl.appendChild(this.box);
    this.box.addEventListener("mouseenter", () => {
      this.box.setAttribute("color", "#f55");
      this.scene.triggerTrack(trackIndex, this.gameTime.elapsedMs);
    });
    this.box.addEventListener("mouseleave", () => {
      this.box.setAttribute("color", "#5f5");
    });
    this.box.addEventListener("mousedown", () => {
    });
    this.bpm = 110;
    this.millisecondsPerBeat = 1000 * 60 / this.bpm;
  }

  tick(timeMs, timeDeltaMs) {
    const prevAngle = this.box.object3D.rotation.toArray()[1];
    const quarterTurnDuration = 1000 * 60 / this.bpm;
    this.box.object3D.rotation.set(
      0, prevAngle + Math.PI / 2 * timeDeltaMs / quarterTurnDuration, 0);
  }
}

class PlayableBlocks {
  constructor(gameTime, scene) {
    const sceneEl = document.querySelector("a-scene");
    this.pbs = [];
    for (let trackIndex = 0; trackIndex < 16; ++trackIndex) {
      if (scene.getSample(trackIndex)) {
        this.pbs.push(new PlayableBlock(sceneEl, trackIndex, gameTime, scene));
      }
    }
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
      //TODO: end flying needs to be on the beat.
    }
  }
}
