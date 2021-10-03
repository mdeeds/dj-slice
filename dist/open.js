/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 648:
/***/ (function(__unused_webpack_module, exports) {


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