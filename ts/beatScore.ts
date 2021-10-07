
// OVERKILL!!!!
//
// class CircularBuffer {
//   private size = 0;
//   private index = 0;
//   private buffer: Float64Array;
//   constructor(private n: number) {
//     this.buffer = new Float64Array(n);
//   }
//   length() {
//     return this.size;
//   }
//   push(x: number) {
//     this.buffer[this.index] = x;
//   }

// }


export class BeatScore {
  private previousEventTimeS: number[] = [];
  private secondsPerBeat: number;
  private cumulativeError: number = 0.5;
  constructor(private bpm: number) {
    this.secondsPerBeat = 60 / bpm;
  }

  public strike(eventTimeS: number): number {
    if (this.previousEventTimeS.length === 0) {
      this.previousEventTimeS.push(eventTimeS);
      return 0;
    }
    let totalError = 0;
    for (const prevS of this.previousEventTimeS) {
      const deltaS = eventTimeS - prevS;
      const beatNumber = Math.round(deltaS / this.secondsPerBeat);
      // 0.0 is exactly on beat, 1.0 is exactly off beat.
      const errorS = 2 * (deltaS - beatNumber * this.secondsPerBeat) /
        this.secondsPerBeat;
      totalError += Math.abs(errorS);
    }
    this.previousEventTimeS.push(eventTimeS);
    if (this.previousEventTimeS.length > 4) {
      this.previousEventTimeS.splice(0, 1);
    }
    const meanError = totalError / this.previousEventTimeS.length;
    this.cumulativeError = (0.5 * this.cumulativeError) + (0.5 * meanError);
    return meanError;
  }

  public getCumulativeError(): number {
    return this.cumulativeError;
  }

}