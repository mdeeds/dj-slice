export class Common {
  private static audioCtx: AudioContext = null;
  static async getContext(): Promise<AudioContext> {

    return new Promise((resolve) => {
      if (Common.audioCtx) {
        console.log('Context established.');
        resolve(Common.audioCtx);
      } else {
        const context = new window.AudioContext();
        if (context.state === 'running') {
          Common.audioCtx = context;
          resolve(context);
        } else {
          setTimeout(async () => {
            resolve(await Common.getContext());
          }, 500);
        }
      }
    });
  }

  public static audioContext(): AudioContext {
    if (!Common.audioCtx) {
      throw new Error(`Context is not ready!`);
    }
    return Common.audioCtx;
  }

  static indexToTheta(index: number): number {
    return (index * 2 * Math.PI) / 16 - Math.PI;
  }
}