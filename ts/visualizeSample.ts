import * as FFT from "fft-js";

export class VisualizeSample {
  constructor(private samples: Float32Array, private sampleRate: number) { }

  private static kWindowSize = 4096;
  private static kStepSize = 128;  // stride

  private setPixel(data: ImageData, x: number, y: number, color: number[]) {
    const i = 4 * (Math.round(x) + data.width * Math.round(y));
    data.data[i + 0] = color[0];
    data.data[i + 1] = color[1];
    data.data[i + 2] = color[2];
    data.data[i + 3] = 255;
  }

  private renderSpectrogram(canvas: HTMLCanvasElement, spectogram: number[][]) {
    const imgSize = canvas.width;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const colors = [];
    const mag = [];
    for (const spec of spectogram) {
      const epsilon = 255 / spec.length;
      let b = 0;
      let g = 0;
      let r = 0;
      for (let i = 0; i < spec.length; ++i) {
        if (i < spec.length / 3) {
          b += spec[i] * epsilon;
        } else if (i < 2 * spec.length / 3) {
          g += spec[i] * epsilon;
        } else {
          r += spec[i] * epsilon;
        }
      }
      colors.push([b, g, r]);
      mag.push(b + g + r);
    }
    // polar plot FFT
    const thetaStart = Math.PI / 6;
    const thetaStop = 11 / 6 * Math.PI;
    const thetaLength = thetaStop - thetaStart;
    for (let theta = thetaStart; theta <= thetaStop; theta += Math.PI / 3000) {
      let index = Math.floor((theta - thetaStart) * colors.length / thetaLength)
      index = Math.min(index, colors.length - 1)
      const rStart = Math.floor((imgSize / 4) - mag[index] / 2)
      const rStop = Math.floor(Math.min(imgSize / 4 + mag[index] / 2, imgSize / 2 - 1))
      for (let r = rStart; r <= rStop; ++r) {
        const x = Math.floor(imgSize / 2 + Math.cos(theta) * r)
        const y = Math.floor(imgSize / 2 - Math.sin(theta) * r)
        this.setPixel(data, x, y, colors[index])
      }
    }
    ctx.putImageData(data, 0, 0);
  }

  private hamming(n: number): Float32Array {
    const result = new Float32Array(n);
    for (let i = 0; i < n; ++i) {
      // In the edge case where n = 3
      //   middle = 1
      //   Middle is both the index of the middle element
      //   as well as the number of elements to the left and right.
      const middle = (n - 1) / 2;
      const t = Math.PI * (i - middle) / middle;
      result[i] = (1 + Math.cos(t)) / 2;
    }
    return result;
  }

  // Multiplies a elementwise by b.
  private multiplyElements(a: number[] | Float32Array, b: number[] | Float32Array) {
    for (let i = 0; i < a.length; ++i) {
      a[i] *= b[i];
    }
  }

  visualize(canvas: HTMLCanvasElement) {
    const window = this.hamming(VisualizeSample.kWindowSize);
    const spectrogram: number[][] = [];

    for (let startSample = 0;
      startSample < this.samples.length - VisualizeSample.kWindowSize;
      startSample += VisualizeSample.kStepSize) {
      const endSample = startSample + VisualizeSample.kWindowSize;
      const slice = this.samples.slice(startSample, endSample);
      this.multiplyElements(slice, window);
      const fourier = FFT.fft(slice);
      spectrogram.push(FFT.util.fftMag(slice))
    }
    this.renderSpectrogram(canvas, spectrogram);
  }
}