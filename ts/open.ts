import { Common } from "./common";
import { GameTime } from "./gameTime";
import { Sample } from "./sample";

const url = new URL(document.URL);

function transients(frames: Float32Array): number[] {
  const result: number[] = [];

  let sum = 0.0;
  const bufferSize = Math.round(44000 / 20);

  for (let i = frames.length - bufferSize; i < frames.length; ++i) {
    sum += frames[i] * frames[i];
  }

  let lastTransient = -bufferSize;
  for (let i = 0; i < frames.length; ++i) {
    const x2 = frames[i] * frames[i];
    if ((x2 > 0.02) && (x2 / (sum / bufferSize) > 10)) {
      if (i - lastTransient >= bufferSize) {
        result.push(i);
        lastTransient = i;
      }
    }
    const prevX = frames[(i - bufferSize + frames.length) % frames.length];
    sum += x2 - prevX * prevX;
  }
  return result;
}

function renderBuffer(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  audioCtx: AudioContext,
  frames: Float32Array, bpm: number) {
  const framesPerBeat = Math.round(audioCtx.sampleRate * 60 / bpm);

  const t = transients(frames);
  ctx.fillStyle = '#6f6';
  for (const i of t) {
    ctx.fillRect(Math.round(i / frames.length * 1000) - 1, 0, 3, canvas.height);
  }

  let x = 0;
  ctx.fillStyle = '#f992';
  let framesUntilNextBeat = 0;
  for (let i = 0; i < frames.length; ++i) {
    const y = 200 * frames[i];
    ctx.fillRect(x, 300 - y, 1, 2 * y);
    if (framesUntilNextBeat <= 0) {
      framesUntilNextBeat += framesPerBeat;
      ctx.fillStyle = 'black';
      ctx.fillRect(Math.round(x), 100, 1, canvas.height - 200);
      ctx.fillStyle = '#f992';
    }
    framesUntilNextBeat -= 1;
    x += 1000 / frames.length;
  }
}

function initCanvas(body: HTMLElement): HTMLCanvasElement[] {
  const peaksCanvas: HTMLCanvasElement =
    document.createElement('canvas') as unknown as HTMLCanvasElement;
  peaksCanvas.id = 'peaks';
  peaksCanvas.width = 1000;
  peaksCanvas.height = 600;
  body.appendChild(peaksCanvas);

  const selectionCanvas: HTMLCanvasElement =
    document.createElement('canvas') as unknown as HTMLCanvasElement;
  selectionCanvas.id = 'selection';
  selectionCanvas.width = 1000;
  selectionCanvas.height = 600;
  body.appendChild(selectionCanvas);

  return [peaksCanvas, selectionCanvas];
}

class Granules {
  private audioBuffer: AudioBuffer;
  private controlPoints: number[];
  private activePoint: number;
  private audioCtx: AudioContext;
  private numSamples: number;
  constructor(audioBuffer: AudioBuffer, audioCtx: AudioContext) {
    this.audioBuffer = audioBuffer;
    this.numSamples = audioBuffer.getChannelData(0).length;
    this.audioCtx = audioCtx;
    this.controlPoints = [0, this.numSamples / audioCtx.sampleRate];
    this.activePoint = 0;
  }

  private getXForPoint(index: number, canvas: HTMLCanvasElement) {
    const x = (canvas.width * this.controlPoints[index]) /
      (this.numSamples / this.audioCtx.sampleRate);
    return x;
  }

  render(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#66f'
    for (let i = 0; i < this.controlPoints.length - 1; ++i) {
      const width = this.getXForPoint(i + 1, canvas) -
        this.getXForPoint(i, canvas);
      if (i === this.activePoint) {
        ctx.fillStyle = '#66f';
        ctx.fillRect(
          this.getXForPoint(i, canvas), 0,
          width, canvas.height);
      } else {
        ctx.fillStyle = '#88d';
        ctx.fillRect(
          this.getXForPoint(i, canvas) + 10, 10,
          width - 20, canvas.height - 20);
      }
    }
  }

  changeStart(delta: number) {
    this.controlPoints[this.activePoint] += delta;
  }
  changeEnd(delta: number) {
    this.controlPoints[this.activePoint + 1] += delta;
  }
  next() {
    if (this.activePoint >= this.controlPoints.length - 2) {
      this.activePoint = 0;
    } else {
      this.activePoint++;
    }
  }

  play() {
    console.log('playing');
    const audioNode = this.audioCtx.createBufferSource();
    audioNode.buffer = this.audioBuffer;
    audioNode.connect(this.audioCtx.destination);
    const duration = this.controlPoints[this.activePoint + 1]
      - this.controlPoints[this.activePoint];
    audioNode.start(0, this.controlPoints[this.activePoint], duration);
  }

  split() {
    const mid = (this.controlPoints[this.activePoint] +
      this.controlPoints[this.activePoint + 1]) / 2;
    this.controlPoints.splice(this.activePoint + 1, 0, mid);
  }
}

async function go() {
  const audioCtx = await Common.getContext();
  const sampleUri = url.searchParams.get('s');
  const gameTime = new GameTime(120);
  const sample = new Sample(sampleUri, gameTime);
  const buffer = await sample.getData();
  const body = document.getElementsByTagName('body')[0];

  const [peaksCanvas, selectionCanvas] = initCanvas(body);
  peaksCanvas.tabIndex = 0;
  const peaksCtx = peaksCanvas.getContext('2d');

  const frames = buffer.getChannelData(0);
  const bpm = 110;
  const granules = new Granules(buffer, audioCtx);

  peaksCtx.clearRect(0, 0, peaksCanvas.width, peaksCanvas.height);
  renderBuffer(peaksCtx, peaksCanvas, audioCtx, frames, bpm);

  granules.render(selectionCanvas);

  peaksCanvas.addEventListener('keydown', (ev: KeyboardEvent) => {
    let actionTaken = true;
    switch (ev.code) {
      case 'KeyS': granules.split(); break;
      case 'ArrowLeft': granules.changeStart(-0.01); break;
      case 'ArrowRight': granules.changeStart(0.01); break;
      case 'ArrowDown': granules.changeEnd(-0.01); break;
      case 'ArrowUp': granules.changeEnd(0.01); break;
      case 'Tab': granules.next(); break;
      case 'Space': granules.play(); break;
    }
    if (actionTaken) {
      ev.preventDefault();
      selectionCanvas.getContext('2d')
        .clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
      granules.render(selectionCanvas);
    }
  });
}

go();