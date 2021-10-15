import * as AFRAME from "aframe";

export class ModelUtil {
  static makeGlowingModel(name: string): AFRAME.Entity {
    const result = document.createElement('a-entity');
    result.setAttribute('obj-model',
      `obj: url(obj/${name}.obj); ` +
      `mtl: url(obj/${name}.mtl`);
    result.setAttribute('shader', 'flat');
    return result
  }
}