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

async function go() {
  const audioCtx = await Common.getContext();
  const sampleUri = url.searchParams.get('s');
  const gameTime = new GameTime(120);
  const sample = new Sample(sampleUri, gameTime);
  const buffer = await sample.getData();
  const body = document.getElementsByTagName('body')[0];

  const canvas: HTMLCanvasElement =
    document.createElement('canvas') as unknown as HTMLCanvasElement;
  canvas.width = 1000;
  canvas.height = 600;
  body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const frames = buffer.getChannelData(0);

  const bpm = 110;
  const framesPerBeat = Math.round(audioCtx.sampleRate * 60 / bpm);

  const t = transients(frames);
  ctx.fillStyle = '#6f6';
  for (const i of t) {
    ctx.fillRect(Math.round(i / frames.length * 1000) - 1, 0, 3, canvas.height);
  }

  let x = 0;
  ctx.fillStyle = 'pink';
  let framesUntilNextBeat = 0;
  for (let i = 0; i < frames.length; ++i) {
    const y = 200 * frames[i];
    ctx.fillRect(x, 300 - y, 1, 2 * y);
    if (framesUntilNextBeat <= 0) {
      framesUntilNextBeat += framesPerBeat;
      ctx.fillStyle = 'black';
      ctx.fillRect(Math.round(x), 100, 1, canvas.height - 200);
      ctx.fillStyle = 'pink';
    }
    framesUntilNextBeat -= 1;
    x += 1000 / frames.length;
  }
}

go();