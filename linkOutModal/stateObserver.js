"use strict";

class StateObserver {
  constructor() {
    this.target = null;
  }
  update(data) {
    console.log(this.target, data);
    document.dispatchEvent(new CustomEvent("reset-modal"));
  }
}

export { StateObserver };
