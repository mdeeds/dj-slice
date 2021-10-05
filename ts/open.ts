import { Common } from "./common";
import { GameTime } from "./gameTime";
import { Sample } from "./sample";
import * as FFT from "fft-js";

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

function topNIndexes(arr: number[] | Float32Array, n: number): number[] {
  const kvs = [];
  for (const [i, x] of arr.entries()) {
    kvs.push({ k: i, v: x });
  }
  kvs.sort((a, b) => { return b.v - a.v; });
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(kvs[i].k);
  }
  return result;
}

function foldFrequencies(magnitudes: number[]) {
  const target = new Float32Array(magnitudes.length);
  for (let base = 1; base < magnitudes.length; ++base) {
    for (let source = base; source < magnitudes.length; source += base) {
      target[base] += magnitudes[source];
    }
  }
  return target;
}

function renderWave(canvas: HTMLCanvasElement, buffer: Float32Array,
  audioCtx: AudioContext) {
  console.log('render');
  const windowSize = 16384;
  const ctx = canvas.getContext('2d');

  let offset = 0;
  let t = Math.PI;
  const numFFTs = buffer.length / windowSize * 16;
  while (offset + windowSize < buffer.length) {
    const samples = new Float32Array(windowSize);
    for (let i = 0; i < windowSize; ++i) {
      samples[i] = buffer[i + offset];
    }
    const fourier = FFT.fft(samples);
    const frequencies = FFT.util.fftFreq(fourier, audioCtx.sampleRate);
    const rawMagnitudes = FFT.util.fftMag(fourier);
    const magnitudes = foldFrequencies(rawMagnitudes);

    const indices = topNIndexes(magnitudes, 12);
    ctx.fillStyle = '#444';
    for (const index of indices) {
      const freq = frequencies[index];
      if (freq == 0) {
        continue;
      }
      const mag = magnitudes[index];
      const r = 60 * Math.log(freq);
      const x = r * Math.cos(t) + canvas.width / 2;
      const y = r * Math.sin(t) + canvas.height / 2;
      ctx.beginPath();
      ctx.arc(x, y, mag / 50, -Math.PI, Math.PI);
      ctx.fill();
    }

    t -= 2 * Math.PI / numFFTs * (10 / 12);
    // Overlapping windows
    offset += Math.round(windowSize / 16);
  }
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
    framesUntilNextBeat -= 1;
    x += 1000 / frames.length;
  }
}

function renderBars(canvas: HTMLCanvasElement, frames: Float32Array, audioCtx: AudioContext, bpm: number) {
  const ctx = canvas.getContext('2d');
  const framesPerBeat = Math.round(audioCtx.sampleRate * 60 / bpm);
  let x = 0;
  ctx.fillStyle = '#f992';
  let framesUntilNextBeat = 0;
  for (let i = 0; i < frames.length; ++i) {
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
  peaksCanvas.style.setProperty('visibility', 'hidden');
  body.appendChild(peaksCanvas);

  const barsCanvas: HTMLCanvasElement =
    document.createElement('canvas') as unknown as HTMLCanvasElement;
  barsCanvas.id = 'bars';
  barsCanvas.width = 1000;
  barsCanvas.height = 600;
  body.appendChild(barsCanvas);

  const selectionCanvas: HTMLCanvasElement =
    document.createElement('canvas') as unknown as HTMLCanvasElement;
  selectionCanvas.id = 'selection';
  selectionCanvas.width = 1000;
  selectionCanvas.height = 600;
  body.appendChild(selectionCanvas);

  return [peaksCanvas, barsCanvas, selectionCanvas];
}

class Granules {
  private audioBuffer: AudioBuffer;
  private controlPoints: number[];
  private playbackPoints: number[];
  private activePoint: number;
  private audioCtx: AudioContext;
  private numSamples: number;
  constructor(audioBuffer: AudioBuffer, audioCtx: AudioContext) {
    this.audioBuffer = audioBuffer;
    this.numSamples = audioBuffer.getChannelData(0).length;
    this.audioCtx = audioCtx;
    this.controlPoints = [0, this.numSamples / audioCtx.sampleRate];
    this.playbackPoints = [0, this.numSamples / audioCtx.sampleRate];
    this.activePoint = 0;
  }

  private getXForPoint(index: number, canvas: HTMLCanvasElement) {
    const x = (canvas.width * this.controlPoints[index]) /
      (this.numSamples / this.audioCtx.sampleRate);
    return x;
  }
  private getXForPlayback(index: number, canvas: HTMLCanvasElement) {
    const x = (canvas.width * this.playbackPoints[index]) /
      (this.numSamples / this.audioCtx.sampleRate);
    return x;
  }

  render(canvas: HTMLCanvasElement, peaksCanvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#66f'
    for (let i = 0; i < this.controlPoints.length - 1; ++i) {
      const width = this.getXForPoint(i + 1, canvas) -
        this.getXForPoint(i, canvas);
      if (i === this.activePoint) {
        ctx.fillStyle = '#aaf';
      } else if (i % 2 === 0) {
        ctx.fillStyle = '#aaa';
      } else {
        ctx.fillStyle = '#ddd'
      }
      ctx.fillRect(
        this.getXForPlayback(i, canvas), 0,
        width, canvas.height);

      ctx.drawImage(peaksCanvas,
        this.getXForPoint(i, canvas), 0, width, canvas.height,
        this.getXForPlayback(i, canvas), 0, width, canvas.height)
    }
  }

  changeStart(delta: number) {
    this.controlPoints[this.activePoint] =
      Math.max(0, this.controlPoints[this.activePoint] + delta);
    this.playbackPoints[this.activePoint] =
      Math.max(0, this.playbackPoints[this.activePoint] + delta);
  }
  changePlayStart(delta: number) {
    this.playbackPoints[this.activePoint] =
      Math.max(0, this.playbackPoints[this.activePoint] + delta);
  }
  changeEnd(delta: number) {
    this.controlPoints[this.activePoint + 1] += delta;
    this.playbackPoints[this.activePoint + 1] += delta;
  }
  next(dir: number) {
    this.activePoint += dir;
    this.activePoint = this.activePoint % (this.controlPoints.length - 1);
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

  private splitInternal(a: number[], i: number): number {
    const mid = (a[i] + a[i + 1]) / 2;
    a.splice(i + 1, 0, mid);
    return mid;
  }

  split() {
    this.splitInternal(this.controlPoints, this.activePoint);
    this.splitInternal(this.playbackPoints, this.activePoint);
  }

  join() {
    if (this.controlPoints.length > 2 && this.activePoint > 0) {
      this.controlPoints.splice(this.activePoint, 1);
      this.playbackPoints.splice(this.activePoint, 1);
    }
  }
}

function getBpmFromFrames(numFrames: number, audioCtx: AudioContext) {
  const durationS = numFrames / audioCtx.sampleRate;
  let bpm = 60 / durationS;
  while (bpm < 120 * Math.sqrt(0.5)) {
    bpm *= 2;
  }
  return bpm;
}

async function go() {
  const audioCtx = await Common.getContext();
  const sampleUri = url.searchParams.get('s');
  const gameTime = new GameTime(120);
  const sample = new Sample(sampleUri, gameTime);
  const buffer = await sample.getData();
  const body = document.getElementsByTagName('body')[0];

  const [peaksCanvas, barsCanvas, selectionCanvas] = initCanvas(body);
  barsCanvas.tabIndex = 0;
  const peaksCtx = peaksCanvas.getContext('2d');

  const frames = buffer.getChannelData(0);
  const bpm = getBpmFromFrames(frames.length, audioCtx);
  const granules = new Granules(buffer, audioCtx);

  const waveCanvas = document.createElement('canvas') as
    any as HTMLCanvasElement;
  waveCanvas.width = 1000;
  waveCanvas.height = 1000;
  waveCanvas.style.setProperty('position', 'absolute');
  waveCanvas.style.setProperty('top', '500px');
  renderWave(waveCanvas, frames, audioCtx);
  body.appendChild(waveCanvas);

  peaksCtx.clearRect(0, 0, peaksCanvas.width, peaksCanvas.height);
  renderBuffer(peaksCtx, peaksCanvas, audioCtx, frames, bpm);
  renderBars(barsCanvas, frames, audioCtx, bpm);

  granules.render(selectionCanvas, peaksCanvas);

  barsCanvas.addEventListener('keydown', (ev: KeyboardEvent) => {
    let actionTaken = true;
    switch (ev.code) {
      case 'KeyS': granules.split(); break;
      case 'KeyJ': granules.changePlayStart(-0.01); break;
      case 'KeyK': granules.changePlayStart(0.01); break;
      case 'Delete': case 'Backspace': granules.join(); break;
      case 'ArrowLeft': granules.changeStart(-0.01); break;
      case 'ArrowRight': granules.changeStart(0.01); break;
      case 'ArrowDown': granules.changeEnd(-0.01); break;
      case 'ArrowUp': granules.changeEnd(0.01); break;
      case 'Tab':
        if (ev.shiftKey) {
          granules.next(-1);
        } else {
          granules.next(1);
        }
        break;
      case 'Space': granules.play(); break;
    }
    if (actionTaken) {
      console.log(`Action: ${ev.code}`);
      ev.preventDefault();
      selectionCanvas.getContext('2d')
        .clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
      granules.render(selectionCanvas, peaksCanvas);
    }
  });
}

go();