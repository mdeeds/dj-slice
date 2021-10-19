import * as Tone from "tone";
import { GameTime, TimeSummary } from "./gameTime";

import { Positron, PositronConfig } from "./positron";

const config = PositronConfig.patch808;
let positronPtr = {
  pos: new Positron(config)
};


function load() {
  try {
    const tmp = PositronConfig.fromString(ta.value);
    Object.assign(config, tmp);
    positronPtr.pos.setConfig(config);
  } catch (e) {
    console.log(e);
  }
}

const body = document.getElementsByTagName('body')[0];
{
  const div = document.createElement('div');
  div.innerText = "Click!";
  div.addEventListener('click', (ev: MouseEvent) => {
    load();
    const now = Tone.now();
    positronPtr.pos.triggerAttackRelease('a1', '8n', now);
    positronPtr.pos.triggerAttackRelease('e1', '8n', now + 0.25);
    positronPtr.pos.triggerAttackRelease('d1', '8n', now + 0.5);
    positronPtr.pos.triggerAttackRelease('a1', '8n', now + 1);
  });
  body.appendChild(div);
}

{
  for (const n of ['a2', 'a3', 'a4', 'b4', 'c5']) {
    const div = document.createElement('div');
    div.innerText = n;
    div.addEventListener('pointerdown', (ev: MouseEvent) => {
      load();
      const now = Tone.now();
      positronPtr.pos.triggerAttack(n, now);
    });
    div.addEventListener('pointerup', (ev: MouseEvent) => {
      load();
      const now = Tone.now();
      positronPtr.pos.triggerRelease(n, now);
    });
    body.appendChild(div);
  }
}

const loopDiv = document.createElement('div');
loopDiv.innerText = 'loop';
loopDiv.addEventListener('pointerdown', (ev: PointerEvent) => {
  loopDiv.classList.toggle('looping');
});
body.appendChild(loopDiv);

const notes = ['c3', 'c3', 'a3', 'g3', 'd3', 'd3', 'e3', 'd3'];
var gameTime: GameTime = null;
async function startGameTimer() {
  gameTime = await GameTime.make(120);
  gameTime.start();
  gameTime.addBeatCallback((ts: TimeSummary) => {
    if (loopDiv.classList.contains('looping')) {
      const n = notes[ts.beatInt % notes.length];
      positronPtr.pos.triggerAttackRelease(n, '8n', ts.audioTimeS);
    }
  })
}
startGameTimer();

let start: number;
function step(timestamp: number) {
  if (start === undefined)
    start = timestamp;
  const elapsed = timestamp - start;
  gameTime.tick(timestamp, elapsed);
  requestAnimationFrame(step);
}
requestAnimationFrame(step);

const modify = function (obj: object, path: string[], delta: number,
  index: number = 0) {
  if (index == path.length - 1) {
    obj[path[index]] = Math.max(0, obj[path[index]] + delta);
  } else {
    modify(obj[path[index]], path, delta, index + 1);
  }
};

const ta = document.createElement('textarea') as unknown as HTMLTextAreaElement;
ta.value = JSON.stringify(config, null, 2);
ta.style.setProperty('width', '90vw');
ta.style.setProperty('height', '80vh');

const makeKnob = function (label: string, path: string[]) {
  const k = document.createElement('span');
  k.classList.add('knob');
  k.innerText = label;
  k.addEventListener('wheel', (ev: WheelEvent) => {
    if (ev.deltaY < 0) {
      modify(config, path, 0.01);
    } else {
      modify(config, path, -0.01);
    }
    ta.value = JSON.stringify(config, null, 2);
    positronPtr.pos.setConfig(config);
  });
  body.appendChild(k);
}

makeKnob('V attack', ['env', 'attack']);
makeKnob('V decay', ['env', 'decay']);
makeKnob('V sustain', ['env', 'sustain']);
makeKnob('V release', ['env', 'release']);

makeKnob('F attack', ['filterEnv', 'attack']);
makeKnob('F decay', ['filterEnv', 'decay']);
makeKnob('F sustain', ['filterEnv', 'sustain']);
makeKnob('F release', ['filterEnv', 'release']);

makeKnob('Freq', ['filterScale']);

body.appendChild(ta);

const style = document.createElement('link');
style.setAttribute('rel', 'stylesheet');
style.setAttribute('type', 'text/css');
style.setAttribute('href', "synth.css");

document.head.appendChild(style);
