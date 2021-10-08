export class TrackEntity {
  //   private track: LooperTrack = null;
  // private imageEntity = null;
  // var lastBeat = -1;

  // async function buildTracks() {
  //   gameTime = await GameTime.make(115);
  //   beatScore = new BeatScore(gameTime.getBpm());
  //   track = new LooperTrack(gameTime);
  //   for (const i of [1, 2, 3, 4]) {
  //     track.addSample(new Sample(`samples/funk/bass-${i}.m4a`, gameTime));
  //   }
  //   console.log('start');
  //   gameTime.start();
  // }

  // const htmlImage2 = document.createElement('img');
  // htmlImage2.setAttribute('src', `img/output.png`);
  // htmlImage2.id = `sample`;
  // assets.appendChild(htmlImage2);

  // const dialEntity = document.createElement('a-entity');
  // dialEntity.setAttribute('position', '0, 1.5, -1');
  // dialEntity.setAttribute('rotation', '0 0 0');
  // {
  //   let idNumber = 0;
  //   for (const i of [1, 2, 3, 4]) {
  //     for (const j of [1, 2, 3, 4]) {
  //       const htmlImage = document.createElement('img');
  //       htmlImage.setAttribute('src', `img/dial/dial_${i}_${j}.png`);
  //       htmlImage.id = `dial${idNumber++}`;
  //       assets.appendChild(htmlImage);
  //     }
  //   }
  //   imageEntity = document.createElement('a-image') as AFRAME.Entity;
  //   imageEntity.setAttribute('src', '#dial0');
  //   imageEntity.setAttribute('width', '0.2');
  //   imageEntity.setAttribute('height', '0.2');
  //   imageEntity.setAttribute('position', '0, 0, -0.02');
  //   dialEntity.appendChild(imageEntity);
  // }
  // {
  //   const imageEntity2 = document.createElement('a-image') as AFRAME.Entity;
  //   imageEntity2.setAttribute('src', '#sample');
  //   imageEntity2.setAttribute('width', '0.2');
  //   imageEntity2.setAttribute('height', '0.2');
  //   dialEntity.appendChild(imageEntity2);
  // }
  // {
  //   const topBar = document.createElement('a-torus') as AFRAME.Entity;
  //   topBar.setAttribute('arc', '90');
  //   topBar.setAttribute('radius', '0.15');
  //   topBar.setAttribute('radius-tubular', '0.01');
  //   topBar.setAttribute('segments-radial', '8');
  //   topBar.setAttribute('segments-tubular', '4');
  //   topBar.setAttribute('rotation', '0 0 45');
  //   topBar.classList.add('clickable');
  //   topBar.addEventListener("mouseenter", () => {
  //     console.log('start');
  //     track.startLooping();
  //   });
  //   dialEntity.appendChild(topBar);
  // }
  // {
  //   const topBar = document.createElement('a-torus') as AFRAME.Entity;
  //   topBar.setAttribute('arc', '90');
  //   topBar.setAttribute('radius', '0.15');
  //   topBar.setAttribute('radius-tubular', '0.01');
  //   topBar.setAttribute('segments-radial', '8');
  //   topBar.setAttribute('segments-tubular', '4');
  //   topBar.setAttribute('rotation', '0 0 225');
  //   topBar.classList.add('clickable');
  //   topBar.addEventListener("mouseenter", () => {
  //     if (track.isLooping()) {
  //       track.stopLooping();
  //     } else {
  //       track.next();
  //     }
  //   });
  //   dialEntity.appendChild(topBar);
  // }
  // scene.appendChild(dialEntity);

}