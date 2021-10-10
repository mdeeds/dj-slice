import * as AFRAME from "aframe";

export class Debug {
  private static text: AFRAME.Entity = null;
  static init(container: AFRAME.Entity) {
    Debug.text = document.createElement('a-entity');
    Debug.text.setAttribute('text', 'value: "Hello, World!";');
    Debug.text.setAttribute('position', '0 0.3 -1');
    container.appendChild(Debug.text);
  }

  static set(message: string) {
    if (Debug.text) {
      Debug.text.setAttribute('text', `value: ${message};`);
    }
  }
}