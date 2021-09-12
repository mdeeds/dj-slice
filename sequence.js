class Sequence {
  constructor(blockFactory) {
    this.blockFactory = blockFactory;
    this.elapsedMs = 0;
    this.lastSubdivision = -1;
    this.bpm = 96;
    this.tracks = [
      "",
      "",
      "",
      "1   1   1   1   1   1   1   1   ",
      "  1   1   1   1                 ",
      "                21 1 1 121 1 1 1",
    ];
    this.subdivisions = 4;  // Per beat
    
    this.millisecondsPerSubdivision = 1000 * 60 / this.bpm / this.subdivisions; 
  }
  
  tick(timeMs, timeDeltaMs) {
    this.elapsedMs += timeDeltaMs;
    const currentSubdivision = Math.trunc(this.elapsedMs / this.millisecondsPerSubdivision);
    while (currentSubdivision > this.lastSubdivision) {
      ++this.lastSubdivision;
      for (let trackIndex = 0; trackIndex < this.tracks.length; ++trackIndex) {
        const track = this.tracks[trackIndex];
        if (this.lastSubdivision < 0 || this.lastSubdivision >= track.length) {
          continue;
        }
        switch (track[this.lastSubdivision]) {
          case '1': case '2': this.blockFactory(trackIndex); break;
        }
      }
    }
  }
}