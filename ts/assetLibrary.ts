import * as AFRAME from "aframe";


export class AssetLibrary {
  private idMap = new Map<string, string>();
  constructor(private assetCollection: AFRAME.Entity) { }


  private addImage(url: string) {
    const img = document.createElement('img');
    img.setAttribute('src', url);
    img.id = `asset${this.idMap.size}`;
    this.assetCollection.appendChild(img);
    this.idMap.set(url, img.id);
    return img.id;
  }

  private addItem(url: string) {
    // <a-asset-item id="horse-obj" src="horse.obj"></a-asset-item>
    // <a-asset-item id="horse-mtl" src="horse.mtl"></a-asset-item>
    const item = document.createElement('a-asset-item');
    item.setAttribute('src', url);
    item.id = `asset${this.idMap.size}`;
    this.assetCollection.appendChild(item);
    this.idMap.set(url, item.id);
    return item.id;
  }


  getId(url: string) {
    if (this.idMap.has(url)) {
      return this.idMap.get(url);
    }
    if (url.toLowerCase().endsWith('.obj') ||
      url.toLocaleLowerCase().endsWith('.mtl')) {
      return this.addItem(url);
    }
    return this.addImage(url);
  }
}