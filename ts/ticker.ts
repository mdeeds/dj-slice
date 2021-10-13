export interface Ticker {
  tick(timeMs: number, timeDeltaMs: number): void;
}