export class Common {
  private static audioCtx: AudioContext = null;
  static async getContext(): Promise<AudioContext> {
    if (Common.audioCtx) {
      return Common.audioCtx;
    }
    return new Promise((resolve) => {
      const context = new window.AudioContext();
      if (context.state === 'running') {
        resolve(context);
      } else {
        setTimeout(async () => {
          resolve(await Common.getContext());
        }, 500);
      }
    });
  }

  static indexToTheta(index: number): number {
    return (index * 2 * Math.PI) / 16 - Math.PI;
  }
}