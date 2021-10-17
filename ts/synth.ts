import * as Tone from "tone";

import { Positron, PositronConfig } from "./positron";

let positronPtr = {
  pos: new Positron(PositronConfig.patchSaw)
};

function load(config: string) {
  try {
    positronPtr.pos = new Positron(PositronConfig.fromString(config));
  } catch (e) {
    console.log(e);
  }
}

const body = document.getElementsByTagName('body')[0];
{
  const div = document.createElement('div');
  div.innerText = "Click!";
  div.addEventListener('click', (ev: MouseEvent) => {
    load(ta.value);
    const now = Tone.now();
    positronPtr.pos.triggerAttackRelease('a1', '8n', now);
    positronPtr.pos.triggerAttackRelease('e1', '8n', now + 0.25);
    positronPtr.pos.triggerAttackRelease('d1', '8n', now + 0.5);
    positronPtr.pos.triggerAttackRelease('a1', '8n', now + 1);
  });
  body.appendChild(div);
}

{
  for (const n of ['a1', 'a2', 'b2', 'c3', 'd4']) {
    const div = document.createElement('div');
    div.innerText = n;
    div.addEventListener('pointerdown', (ev: MouseEvent) => {
      load(ta.value);
      const now = Tone.now();
      positronPtr.pos.triggerAttack(n, now);
    });
    div.addEventListener('pointerup', (ev: MouseEvent) => {
      load(ta.value);
      const now = Tone.now();
      positronPtr.pos.triggerRelease(n, now);
    });
    body.appendChild(div);
  }
}

const ta = document.createElement('textarea') as unknown as HTMLTextAreaElement;
ta.value = JSON.stringify(PositronConfig.patchSaw, null, 2);
ta.style.setProperty('width', '90vw');
ta.style.setProperty('height', '80vh');
// ta.addEventListener('change', () => {
//   load(ta.value);
// })
body.appendChild(ta);
