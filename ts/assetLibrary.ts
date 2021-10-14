import * as AFRAME from "aframe";


export class AssetLibrary {
  private idMap = new Map<string, string>();
  constructor(private assetCollection: AFRAME.Entity) { }

  getId(url: string) {
    if (this.idMap.has(url)) {
      return this.idMap.get(url);
    }
    const img = document.createElement('img');
    img.setAttribute('src', url);
    img.id = `asset${this.idMap.size}`;
    this.assetCollection.appendChild(img);
    this.idMap.set(url, img.id);
    return img.id;
  }
}