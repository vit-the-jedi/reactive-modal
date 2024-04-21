"use strict";

export const modal = {
  open: false,
  clickAction: "Close X",
  modalTarget: null,
  properties: props,
  extractProperties(node) {
    const o = {};
    const a = node.attributes;
    [...a].forEach((attr) => {
      o[attr.nodeName] = attr.nodeValue;
    });
    return o;
  },
  mapClasses(classArray) {
    return classArray.map((className) => {
      let c = "";
      if (typeof className === "string") {
        c = className;
      } else if (typeof className === "boolean") {
        c = `${className ? "open" : ""}`;
      }
      return c;
    });
  },
  transpileToHTML(string) {
    //get our special template event listenr syntax, transpile it to usable js event listener props
    //return html string with special event listener template removed
    this.events = [];
    const r = new RegExp(/@(\w+):(\w+)\((\w+)\)=(\w+)/g);
    string.match(r).forEach((match) => {
      const eventsMap = new Map();
      eventsMap.set("eventType", match.split("@")[1].split(":")[0]);
      eventsMap.set("elementDomIdPrefix", match.split(":")[1].split("(")[0] === "id" ? "#" : ".");
      eventsMap.set("elementDomIdValue", match.split("(")[1].split(")")[0]);
      eventsMap.set("eventListenerCallback", match.split("=")[1]);
      this.events.push(eventsMap);
    });
    return string.replace(/@(\w+):(\w+)\((\w+)\)=(\w+)/g, "");
  },
  createModal() {
    const modal = document.createElement("div");
    modal.id = `${this.properties.type}-modal`;
    modal.className = this.mapClasses(["dialog", this.open]).join(" ");

    const modalEvents = {
      close: "handleClose",
      open: "handleOpen",
    };
    modal.innerHTML = this.transpileToHTML(`<style>${this.styles}</style>
    <button id="closeModalTop" class="top-button" @click:id(closeModalTop)=${modalEvents.close}>${
      this.clickAction
    }</button>
    <div class="inner">
      ${this.createModalContent()}
      <button id="closeModalBottom" @click:id(closeModalBottom)=${modalEvents.close}>${this.clickAction}</button>
    </div>`);
    return modal;
  },
  createModalContent() {
    switch (this.properties.type) {
      case "terms-privacy":
      default:
        this.script = `https://distro.quick-cdn.com/build/compliance/legal-page-injector.js`;
        return `
        <h1 legal-element="title"></h1>
        <main id="data-output" legal-element="content"></main>`;
      case "partners":
        this.script = `https://leads.digitalmediasolutions.com/js/partners.js?vertical=${this.properties.vertical}`;
        return `
        <h1>Marketing Partners:</h1>
        <ul id="${this.properties.vertical}-list"></ul>`;
    }
  },
  preprocessModal() {
    this.events.forEach((event) => {
      this.modal
        .querySelector(`${event.get("elementDomIdPrefix")}${event.get("elementDomIdValue")}`)
        .addEventListener(event.get("eventType"), this[event.get("eventListenerCallback")].bind(this));
    });
    return this.modal;
  },
  injectScript() {
    const injScript = document.createElement("script");
    injScript.src = this.script;
    injScript.type = "text/javascript";
    if (this.properties.type === "terms-privacy") {
      injScript.setAttribute("page", `generic-${this.properties.contenttype}`);
      injScript.setAttribute("brand", this.properties.brand);
    }
    document.body.appendChild(injScript);
  },
  init() {
    //this.properties = this.extractProperties(this.modalTarget);
    this.modal = this.createModal();
    this.injectScript();
    this.modalTarget.appendChild(this.preprocessModal());
    if (this.eventsRegistered) {
      return;
    }
    document.addEventListener("open-modal", this.handleOpen.bind(this));
    document.addEventListener("reset-modal", this.reset.bind(this));
    this.eventsRegistered = true;
  },
};
