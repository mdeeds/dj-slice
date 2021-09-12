class FlyingBlock {
  constructor(scene, n) {
    this.box = document.createElement("a-box");
    this.toTheta = (n * 2 * Math.PI) / 16 - Math.PI;
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
    this.p += 0.005;
    if (this.p >= 1.0) {
      this.box.remove();
      this.box = null;
    }
  }
}

class PlayableBlocks {
  constructor(keyboardState) {
    const sceneEl = document.querySelector("a-scene");
    this.clips = [];
    this.clips.push(
      new Audio(
        "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Fkick.wav?v=1631392733145"
      )
    );
    this.clips.push(
      new Audio(
        "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Fhats.wav?v=1631392739980"
      )
    );
    this.clips.push(
      new Audio(
        "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Fvirtual.wav?v=1631392748787"
      )
    );
    this.clips.push(
      new Audio(
        "https://cdn.glitch.com/19df276e-5dfe-4bab-915a-410c481a8b0d%2Freality.wav?v=1631392757731"
      )
    );
    let theta = -Math.PI + 3 * Math.PI / 8;
    
    for (const clip of this.clips) {
      const box = document.createElement("a-box");
      box.object3D.position.set(Math.cos(theta) * 4, 0.5, Math.sin(theta) * 4);
      box.setAttribute("color", "#55f");
      box.setAttribute("opacity", 0.5);
      box.object3D.rotation.set(0, -theta, 0);
      sceneEl.appendChild(box);
      box.addEventListener("mouseenter", () => {
        box.setAttribute("color", "#f55");
        clip.currentTime = 0;
        clip.play();
      });
      box.addEventListener("mouseleave", () => {
        box.setAttribute("color", "#5f5");
      });
      box.addEventListener("mousedown", () => {
      });
      box.classList.add("clickable");
      theta += (2 * Math.PI) / 16;
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

  tick(time, timeDelta) {
    const camera = document.querySelector("a-camera");
    camera.object3D.getWorldQuaternion(this.cameraQuaternion);
    this.cameraQuaternion.normalize();
    const a = this.cameraQuaternion.toArray();
    const cameraAngle = -2 * Math.atan2(a[1], a[3]) - 0.5 * Math.PI;
    for (let i = 0; i < this.flyingBlocks.length; ) {
      const fb = this.flyingBlocks[i];
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
    return (trackIndex) => {
      this.flyingBlocks.push(new FlyingBlock(this.sceneEl, trackIndex));
    }
  }
}
