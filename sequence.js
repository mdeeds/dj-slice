class Sequence {
  constructor() {
    this.elapsedMs = 0;
    this.lastSubdivision = -1;
    this.bpm = 120;
    this.tracks = [
      "1   1   1   1   ",
      "  1   1   1   1 ",
      "21 1 1 121 1 1 1",
    ];
    this.subdivisions = 4;  // Per beat
    
    this.millisecondsPerSubdivision = 1000 * 60 / this.bpm / this.subdivisions; 
  }
  
  tick(timeMs, timeDeltaMs) {
    this.elapsedMs += timeDeltaMs;
    const currentSubdivision = Math.trunc(this.elapsedMs / this.millisecondsPerSubdivision);
    while (currentSubdivision > this.lastSubdivision) {
      ++this.lastSubdivision;
      // TODO create the flying blocks.
    }
  }
}