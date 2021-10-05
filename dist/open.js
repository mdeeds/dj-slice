/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 648:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Common = void 0;
class Common {
    static getContext() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Common.audioCtx) {
                return Common.audioCtx;
            }
            return new Promise((resolve) => {
                const context = new window.AudioContext();
                if (context.state === 'running') {
                    resolve(context);
                }
                else {
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        resolve(yield Common.getContext());
                    }), 500);
                }
            });
        });
    }
    static indexToTheta(index) {
        return (index * 2 * Math.PI) / 16 - Math.PI;
    }
}
exports.Common = Common;
Common.audioCtx = null;
//# sourceMappingURL=common.js.map

/***/ }),

/***/ 669:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GameTime = void 0;
const common_1 = __webpack_require__(648);
class GameTime {
    constructor(bpm) {
        console.assert(bpm);
        this.bpm = bpm;
        this.elapsedMs = 0;
        this.running = false;
        this.audioCtx = null;
        this.audioCtxZero = 0;
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.audioCtx = yield common_1.Common.getContext();
        });
    }
    start() {
        if (this.audioCtx) {
            this.running = true;
            this.audioCtxZero = this.audioCtx.currentTime - this.elapsedMs * 1000;
        }
    }
    getBpm() {
        return this.bpm;
    }
    getElapsedMs() {
        return this.elapsedMs;
    }
    getAudioTimeForGameTime(gameMs) {
        return this.audioCtxZero + gameMs / 1000;
    }
    getAudioTimeNow() {
        return this.audioCtxZero + this.elapsedMs / 1000;
    }
    roundQuantizeAudioTime(audioTimeS) {
        const secondsPerBeat = 60 / this.bpm / 4;
        const beat = Math.round(audioTimeS / secondsPerBeat);
        return beat * secondsPerBeat;
    }
    getRoundQuantizedAudioTimeNow() {
        return this.roundQuantizeAudioTime(this.getAudioTimeNow());
    }
    tick(timeMs, timeDeltaMs) {
        if (this.running) {
            this.elapsedMs += timeDeltaMs;
        }
    }
}
exports.GameTime = GameTime;
//# sourceMappingURL=gameTime.js.map

/***/ }),

/***/ 367:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(648);
const gameTime_1 = __webpack_require__(669);
const sample_1 = __webpack_require__(263);
const FFT = __importStar(__webpack_require__(437));
const url = new URL(document.URL);
function transients(frames) {
    const result = [];
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
function topNIndexes(arr, n) {
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
function foldFrequencies(magnitudes) {
    const target = new Float32Array(magnitudes.length);
    for (let base = 1; base < magnitudes.length; ++base) {
        for (let source = base; source < magnitudes.length; source += base) {
            target[base] += magnitudes[source];
        }
    }
    return target;
}
function renderWave(canvas, buffer, audioCtx) {
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
function renderBuffer(ctx, canvas, audioCtx, frames, bpm) {
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
function renderBars(canvas, frames, audioCtx, bpm) {
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
function initCanvas(body) {
    const peaksCanvas = document.createElement('canvas');
    peaksCanvas.id = 'peaks';
    peaksCanvas.width = 1000;
    peaksCanvas.height = 600;
    peaksCanvas.style.setProperty('visibility', 'hidden');
    body.appendChild(peaksCanvas);
    const barsCanvas = document.createElement('canvas');
    barsCanvas.id = 'bars';
    barsCanvas.width = 1000;
    barsCanvas.height = 600;
    body.appendChild(barsCanvas);
    const selectionCanvas = document.createElement('canvas');
    selectionCanvas.id = 'selection';
    selectionCanvas.width = 1000;
    selectionCanvas.height = 600;
    body.appendChild(selectionCanvas);
    return [peaksCanvas, barsCanvas, selectionCanvas];
}
class Granules {
    constructor(audioBuffer, audioCtx) {
        this.audioBuffer = audioBuffer;
        this.numSamples = audioBuffer.getChannelData(0).length;
        this.audioCtx = audioCtx;
        this.controlPoints = [0, this.numSamples / audioCtx.sampleRate];
        this.playbackPoints = [0, this.numSamples / audioCtx.sampleRate];
        this.activePoint = 0;
    }
    getXForPoint(index, canvas) {
        const x = (canvas.width * this.controlPoints[index]) /
            (this.numSamples / this.audioCtx.sampleRate);
        return x;
    }
    getXForPlayback(index, canvas) {
        const x = (canvas.width * this.playbackPoints[index]) /
            (this.numSamples / this.audioCtx.sampleRate);
        return x;
    }
    render(canvas, peaksCanvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#66f';
        for (let i = 0; i < this.controlPoints.length - 1; ++i) {
            const width = this.getXForPoint(i + 1, canvas) -
                this.getXForPoint(i, canvas);
            if (i === this.activePoint) {
                ctx.fillStyle = '#aaf';
            }
            else if (i % 2 === 0) {
                ctx.fillStyle = '#aaa';
            }
            else {
                ctx.fillStyle = '#ddd';
            }
            ctx.fillRect(this.getXForPlayback(i, canvas), 0, width, canvas.height);
            ctx.drawImage(peaksCanvas, this.getXForPoint(i, canvas), 0, width, canvas.height, this.getXForPlayback(i, canvas), 0, width, canvas.height);
        }
    }
    changeStart(delta) {
        this.controlPoints[this.activePoint] =
            Math.max(0, this.controlPoints[this.activePoint] + delta);
        this.playbackPoints[this.activePoint] =
            Math.max(0, this.playbackPoints[this.activePoint] + delta);
    }
    changePlayStart(delta) {
        this.playbackPoints[this.activePoint] =
            Math.max(0, this.playbackPoints[this.activePoint] + delta);
    }
    changeEnd(delta) {
        this.controlPoints[this.activePoint + 1] += delta;
        this.playbackPoints[this.activePoint + 1] += delta;
    }
    next(dir) {
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
    splitInternal(a, i) {
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
function getBpmFromFrames(numFrames, audioCtx) {
    const durationS = numFrames / audioCtx.sampleRate;
    let bpm = 60 / durationS;
    while (bpm < 120 * Math.sqrt(0.5)) {
        bpm *= 2;
    }
    return bpm;
}
function go() {
    return __awaiter(this, void 0, void 0, function* () {
        const audioCtx = yield common_1.Common.getContext();
        const sampleUri = url.searchParams.get('s');
        const gameTime = new gameTime_1.GameTime(120);
        const sample = new sample_1.Sample(sampleUri, gameTime);
        const buffer = yield sample.getData();
        const body = document.getElementsByTagName('body')[0];
        const [peaksCanvas, barsCanvas, selectionCanvas] = initCanvas(body);
        barsCanvas.tabIndex = 0;
        const peaksCtx = peaksCanvas.getContext('2d');
        const frames = buffer.getChannelData(0);
        const bpm = getBpmFromFrames(frames.length, audioCtx);
        const granules = new Granules(buffer, audioCtx);
        const waveCanvas = document.createElement('canvas');
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
        barsCanvas.addEventListener('keydown', (ev) => {
            let actionTaken = true;
            switch (ev.code) {
                case 'KeyS':
                    granules.split();
                    break;
                case 'KeyJ':
                    granules.changePlayStart(-0.01);
                    break;
                case 'KeyK':
                    granules.changePlayStart(0.01);
                    break;
                case 'Delete':
                case 'Backspace':
                    granules.join();
                    break;
                case 'ArrowLeft':
                    granules.changeStart(-0.01);
                    break;
                case 'ArrowRight':
                    granules.changeStart(0.01);
                    break;
                case 'ArrowDown':
                    granules.changeEnd(-0.01);
                    break;
                case 'ArrowUp':
                    granules.changeEnd(0.01);
                    break;
                case 'Tab':
                    if (ev.shiftKey) {
                        granules.next(-1);
                    }
                    else {
                        granules.next(1);
                    }
                    break;
                case 'Space':
                    granules.play();
                    break;
            }
            if (actionTaken) {
                console.log(`Action: ${ev.code}`);
                ev.preventDefault();
                selectionCanvas.getContext('2d')
                    .clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
                granules.render(selectionCanvas, peaksCanvas);
            }
        });
    });
}
go();
//# sourceMappingURL=open.js.map

/***/ }),

/***/ 263:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Sample = void 0;
const common_1 = __webpack_require__(648);
class Sample {
    constructor(url, gameTime) {
        this.url = url;
        this.gameTime = gameTime;
        this.audioCtx = null;
        this.buffer = null;
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.buffer = yield this.getData();
        });
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.audioCtx = yield common_1.Common.getContext();
            const request = new XMLHttpRequest();
            request.open('GET', this.url, true);
            request.responseType = 'arraybuffer';
            return new Promise((resolve, reject) => {
                request.onload = () => {
                    const audioData = request.response;
                    this.audioCtx.decodeAudioData(audioData, function (buffer) {
                        resolve(buffer);
                    }, reject);
                };
                request.send();
            });
        });
    }
    _play(audioTimeS) {
        if (!this.audioCtx || !this.buffer) {
            console.error('Sample is not loaded!');
            return;
        }
        const audioNode = this.audioCtx.createBufferSource();
        audioNode.buffer = this.buffer;
        audioNode.connect(this.audioCtx.destination);
        const nowAudioTime = this.audioCtx.currentTime;
        const timeInFuture = audioTimeS - nowAudioTime;
        audioNode.start(nowAudioTime + Math.max(timeInFuture, 0), Math.max(0, -timeInFuture));
    }
    playQuantized(gameTimeMs) {
        const audioTimeS = this.gameTime.getAudioTimeForGameTime(gameTimeMs);
        const quantizedAudioTimeS = this.gameTime.roundQuantizeAudioTime(audioTimeS);
        this._play(quantizedAudioTimeS);
    }
}
exports.Sample = Sample;
//# sourceMappingURL=sample.js.map

/***/ }),

/***/ 460:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * Bit twiddling hacks for JavaScript.
 *
 * Author: Mikola Lysenko
 *
 * Ported from Stanford bit twiddling hack library:
 *    http://graphics.stanford.edu/~seander/bithacks.html
 */

 "use restrict";

//Number of bits in an integer
var INT_BITS = 32;

//Constants
exports.INT_BITS  = INT_BITS;
exports.INT_MAX   =  0x7fffffff;
exports.INT_MIN   = -1<<(INT_BITS-1);

//Returns -1, 0, +1 depending on sign of x
exports.sign = function(v) {
  return (v > 0) - (v < 0);
}

//Computes absolute value of integer
exports.abs = function(v) {
  var mask = v >> (INT_BITS-1);
  return (v ^ mask) - mask;
}

//Computes minimum of integers x and y
exports.min = function(x, y) {
  return y ^ ((x ^ y) & -(x < y));
}

//Computes maximum of integers x and y
exports.max = function(x, y) {
  return x ^ ((x ^ y) & -(x < y));
}

//Checks if a number is a power of two
exports.isPow2 = function(v) {
  return !(v & (v-1)) && (!!v);
}

//Computes log base 2 of v
exports.log2 = function(v) {
  var r, shift;
  r =     (v > 0xFFFF) << 4; v >>>= r;
  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
  return r | (v >> 1);
}

//Computes log base 10 of v
exports.log10 = function(v) {
  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
}

//Counts number of bits
exports.popCount = function(v) {
  v = v - ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
}

//Counts number of trailing zeros
function countTrailingZeros(v) {
  var c = 32;
  v &= -v;
  if (v) c--;
  if (v & 0x0000FFFF) c -= 16;
  if (v & 0x00FF00FF) c -= 8;
  if (v & 0x0F0F0F0F) c -= 4;
  if (v & 0x33333333) c -= 2;
  if (v & 0x55555555) c -= 1;
  return c;
}
exports.countTrailingZeros = countTrailingZeros;

//Rounds to next power of 2
exports.nextPow2 = function(v) {
  v += v === 0;
  --v;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v + 1;
}

//Rounds down to previous power of 2
exports.prevPow2 = function(v) {
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v - (v>>>1);
}

//Computes parity of word
exports.parity = function(v) {
  v ^= v >>> 16;
  v ^= v >>> 8;
  v ^= v >>> 4;
  v &= 0xf;
  return (0x6996 >>> v) & 1;
}

var REVERSE_TABLE = new Array(256);

(function(tab) {
  for(var i=0; i<256; ++i) {
    var v = i, r = i, s = 7;
    for (v >>>= 1; v; v >>>= 1) {
      r <<= 1;
      r |= v & 1;
      --s;
    }
    tab[i] = (r << s) & 0xff;
  }
})(REVERSE_TABLE);

//Reverse bits in a 32 bit word
exports.reverse = function(v) {
  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
           REVERSE_TABLE[(v >>> 24) & 0xff];
}

//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
exports.interleave2 = function(x, y) {
  x &= 0xFFFF;
  x = (x | (x << 8)) & 0x00FF00FF;
  x = (x | (x << 4)) & 0x0F0F0F0F;
  x = (x | (x << 2)) & 0x33333333;
  x = (x | (x << 1)) & 0x55555555;

  y &= 0xFFFF;
  y = (y | (y << 8)) & 0x00FF00FF;
  y = (y | (y << 4)) & 0x0F0F0F0F;
  y = (y | (y << 2)) & 0x33333333;
  y = (y | (y << 1)) & 0x55555555;

  return x | (y << 1);
}

//Extracts the nth interleaved component
exports.deinterleave2 = function(v, n) {
  v = (v >>> n) & 0x55555555;
  v = (v | (v >>> 1))  & 0x33333333;
  v = (v | (v >>> 2))  & 0x0F0F0F0F;
  v = (v | (v >>> 4))  & 0x00FF00FF;
  v = (v | (v >>> 16)) & 0x000FFFF;
  return (v << 16) >> 16;
}


//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
exports.interleave3 = function(x, y, z) {
  x &= 0x3FF;
  x  = (x | (x<<16)) & 4278190335;
  x  = (x | (x<<8))  & 251719695;
  x  = (x | (x<<4))  & 3272356035;
  x  = (x | (x<<2))  & 1227133513;

  y &= 0x3FF;
  y  = (y | (y<<16)) & 4278190335;
  y  = (y | (y<<8))  & 251719695;
  y  = (y | (y<<4))  & 3272356035;
  y  = (y | (y<<2))  & 1227133513;
  x |= (y << 1);
  
  z &= 0x3FF;
  z  = (z | (z<<16)) & 4278190335;
  z  = (z | (z<<8))  & 251719695;
  z  = (z | (z<<4))  & 3272356035;
  z  = (z | (z<<2))  & 1227133513;
  
  return x | (z << 2);
}

//Extracts nth interleaved component of a 3-tuple
exports.deinterleave3 = function(v, n) {
  v = (v >>> n)       & 1227133513;
  v = (v | (v>>>2))   & 3272356035;
  v = (v | (v>>>4))   & 251719695;
  v = (v | (v>>>8))   & 4278190335;
  v = (v | (v>>>16))  & 0x3FF;
  return (v<<22)>>22;
}

//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
exports.nextCombination = function(v) {
  var t = v | (v - 1);
  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
}



/***/ }),

/***/ 437:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*===========================================================================*\
 * Fast Fourier Transform (Cooley-Tukey Method)
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/
module.exports = {
    fft: __webpack_require__(291).fft,
    ifft: __webpack_require__(362).ifft,
    fftInPlace: __webpack_require__(291).fftInPlace,
    util: __webpack_require__(84),
    dft: __webpack_require__(548),
    idft: __webpack_require__(694)
};


/***/ }),

/***/ 246:
/***/ ((module) => {

//-------------------------------------------------
// Add two complex numbers
//-------------------------------------------------
var complexAdd = function (a, b)
{
    return [a[0] + b[0], a[1] + b[1]];
};

//-------------------------------------------------
// Subtract two complex numbers
//-------------------------------------------------
var complexSubtract = function (a, b)
{
    return [a[0] - b[0], a[1] - b[1]];
};

//-------------------------------------------------
// Multiply two complex numbers
//
// (a + bi) * (c + di) = (ac - bd) + (ad + bc)i
//-------------------------------------------------
var complexMultiply = function (a, b) 
{
    return [(a[0] * b[0] - a[1] * b[1]), 
            (a[0] * b[1] + a[1] * b[0])];
};

//-------------------------------------------------
// Calculate |a + bi|
//
// sqrt(a*a + b*b)
//-------------------------------------------------
var complexMagnitude = function (c) 
{
    return Math.sqrt(c[0]*c[0] + c[1]*c[1]); 
};

//-------------------------------------------------
// Exports
//-------------------------------------------------
module.exports = {
    add: complexAdd,
    subtract: complexSubtract,
    multiply: complexMultiply,
    magnitude: complexMagnitude
};


/***/ }),

/***/ 548:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*===========================================================================*\
 * Discrete Fourier Transform (O(n^2) brute-force method)
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/

//------------------------------------------------
// Note: this code is not optimized and is
// primarily designed as an educational and testing
// tool.
//------------------------------------------------
var complex = __webpack_require__(246);
var fftUtil = __webpack_require__(84);

//-------------------------------------------------
// Calculate brute-force O(n^2) DFT for vector.
//-------------------------------------------------
var dft = function(vector) {
  var X = [],
      N = vector.length;

  for (var k = 0; k < N; k++) {
    X[k] = [0, 0]; //Initialize to a 0-valued complex number.

    for (var i = 0; i < N; i++) {
      var exp = fftUtil.exponent(k * i, N);
      var term;
      if (Array.isArray(vector[i]))
        term = complex.multiply(vector[i], exp)//If input vector contains complex numbers
      else
        term = complex.multiply([vector[i], 0], exp);//Complex mult of the signal with the exponential term.  
      X[k] = complex.add(X[k], term); //Complex summation of X[k] and exponential
    }
  }

  return X;
};

module.exports = dft;

/***/ }),

/***/ 291:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*===========================================================================*\
 * Fast Fourier Transform (Cooley-Tukey Method)
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/

//------------------------------------------------
// Note: Some of this code is not optimized and is
// primarily designed as an educational and testing
// tool.
// To get high performace would require transforming
// the recursive calls into a loop and then loop
// unrolling. All of this is best accomplished
// in C or assembly.
//-------------------------------------------------

//-------------------------------------------------
// The following code assumes a complex number is
// an array: [real, imaginary]
//-------------------------------------------------
var complex = __webpack_require__(246),
    fftUtil = __webpack_require__(84),
    twiddle = __webpack_require__(460);

module.exports = {
  //-------------------------------------------------
  // Calculate FFT for vector where vector.length
  // is assumed to be a power of 2.
  //-------------------------------------------------
  fft: function fft(vector) {
    var X = [],
        N = vector.length;

    // Base case is X = x + 0i since our input is assumed to be real only.
    if (N == 1) {
      if (Array.isArray(vector[0])) //If input vector contains complex numbers
        return [[vector[0][0], vector[0][1]]];      
      else
        return [[vector[0], 0]];
    }

    // Recurse: all even samples
    var X_evens = fft(vector.filter(even)),

        // Recurse: all odd samples
        X_odds  = fft(vector.filter(odd));

    // Now, perform N/2 operations!
    for (var k = 0; k < N / 2; k++) {
      // t is a complex number!
      var t = X_evens[k],
          e = complex.multiply(fftUtil.exponent(k, N), X_odds[k]);

      X[k] = complex.add(t, e);
      X[k + (N / 2)] = complex.subtract(t, e);
    }

    function even(__, ix) {
      return ix % 2 == 0;
    }

    function odd(__, ix) {
      return ix % 2 == 1;
    }

    return X;
  },
  //-------------------------------------------------
  // Calculate FFT for vector where vector.length
  // is assumed to be a power of 2.  This is the in-
  // place implementation, to avoid the memory
  // footprint used by recursion.
  //-------------------------------------------------
  fftInPlace: function(vector) {
    var N = vector.length;

    var trailingZeros = twiddle.countTrailingZeros(N); //Once reversed, this will be leading zeros

    // Reverse bits
    for (var k = 0; k < N; k++) {
      var p = twiddle.reverse(k) >>> (twiddle.INT_BITS - trailingZeros);
      if (p > k) {
        var complexTemp = [vector[k], 0];
        vector[k] = vector[p];
        vector[p] = complexTemp;
      } else {
        vector[p] = [vector[p], 0];
      }
    }

    //Do the DIT now in-place
    for (var len = 2; len <= N; len += len) {
      for (var i = 0; i < len / 2; i++) {
        var w = fftUtil.exponent(i, len);
        for (var j = 0; j < N / len; j++) {
          var t = complex.multiply(w, vector[j * len + i + len / 2]);
          vector[j * len + i + len / 2] = complex.subtract(vector[j * len + i], t);
          vector[j * len + i] = complex.add(vector[j * len + i], t);
        }
      }
    }
  }
};


/***/ }),

/***/ 84:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*===========================================================================*\
 * Fast Fourier Transform Frequency/Magnitude passes
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/

//-------------------------------------------------
// The following code assumes a complex number is
// an array: [real, imaginary]
//-------------------------------------------------
var complex = __webpack_require__(246);


//-------------------------------------------------
// By Eulers Formula:
//
// e^(i*x) = cos(x) + i*sin(x)
//
// and in DFT:
//
// x = -2*PI*(k/N)
//-------------------------------------------------
var mapExponent = {},
    exponent = function (k, N) {
      var x = -2 * Math.PI * (k / N);

      mapExponent[N] = mapExponent[N] || {};
      mapExponent[N][k] = mapExponent[N][k] || [Math.cos(x), Math.sin(x)];// [Real, Imaginary]

      return mapExponent[N][k];
};

//-------------------------------------------------
// Calculate FFT Magnitude for complex numbers.
//-------------------------------------------------
var fftMag = function (fftBins) {
    var ret = fftBins.map(complex.magnitude);
    return ret.slice(0, ret.length / 2);
};

//-------------------------------------------------
// Calculate Frequency Bins
// 
// Returns an array of the frequencies (in hertz) of
// each FFT bin provided, assuming the sampleRate is
// samples taken per second.
//-------------------------------------------------
var fftFreq = function (fftBins, sampleRate) {
    var stepFreq = sampleRate / (fftBins.length);
    var ret = fftBins.slice(0, fftBins.length / 2);

    return ret.map(function (__, ix) {
        return ix * stepFreq;
    });
};

//-------------------------------------------------
// Exports
//-------------------------------------------------
module.exports = {
    fftMag: fftMag,
    fftFreq: fftFreq,
    exponent: exponent
};


/***/ }),

/***/ 694:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*===========================================================================*\
 * Inverse Discrete Fourier Transform (O(n^2) brute-force method)
 *
 * (c) Maximilian Bügler. 2016
 *
 * Based on and using the code by
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/

//------------------------------------------------
// Note: Some of this code is not optimized and is
// primarily designed as an educational and testing
// tool.
//-------------------------------------------------

//-------------------------------------------------
// The following code assumes a complex number is
// an array: [real, imaginary]
//-------------------------------------------------
var dft = __webpack_require__(548);

function idft(signal) {
    //Interchange real and imaginary parts
    var csignal = [];
    for (var i = 0; i < signal.length; i++) {
        csignal[i] = [signal[i][1], signal[i][0]];
    }

    //Apply dft
    var ps = dft(csignal);

    //Interchange real and imaginary parts and normalize
    var res = [];
    for (var j = 0; j < ps.length; j++) {
        res[j] = [ps[j][1] / ps.length, ps[j][0] / ps.length];
    }
    return res;
}

module.exports = idft;

/***/ }),

/***/ 362:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*===========================================================================*\
 * Inverse Fast Fourier Transform (Cooley-Tukey Method)
 *
 * (c) Maximilian Bügler. 2016
 *
 * Based on and using the code by
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/

//------------------------------------------------
// Note: Some of this code is not optimized and is
// primarily designed as an educational and testing
// tool.
// To get high performace would require transforming
// the recursive calls into a loop and then loop
// unrolling. All of this is best accomplished
// in C or assembly.
//-------------------------------------------------

//-------------------------------------------------
// The following code assumes a complex number is
// an array: [real, imaginary]
//-------------------------------------------------

var fft = __webpack_require__(291).fft;


module.exports = {
    ifft: function ifft(signal){
        //Interchange real and imaginary parts
        var csignal=[];
        for(var i=0; i<signal.length; i++){
            csignal[i]=[signal[i][1], signal[i][0]];
        }
    
        //Apply fft
        var ps=fft(csignal);
        
        //Interchange real and imaginary parts and normalize
        var res=[];
        for(var j=0; j<ps.length; j++){
            res[j]=[ps[j][1]/ps.length, ps[j][0]/ps.length];
        }
        return res;
    }
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_require__(367);
/******/ })()
;
//# sourceMappingURL=open.js.map