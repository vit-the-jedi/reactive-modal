"use strict";

//import { modal } from "./modal.js";
import { UserAgentDetector } from "../isInApp/detect.js";
import { reactive } from "../../reactivity/src/index.js";

Object.defineProperty(window.navigator, "userAgent", {
  value:
    "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.121 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/35.0.0.48.273;]",
  writable: true,
});

const uaDetector = new UserAgentDetector(window.navigator.userAgent);
if (uaDetector.detect("fb")) {
  const modal = reactive({
    open: false,
    clickAction: "Close X",
    modalTarget: document.querySelector("#modalTarget"),
    properties: {},
    effects() {
      return {
        open: {
          toggleVisibility: () => {
            this.modal.classList.toggle("open");
          },
          toggleHello: () => {
            console.log(`${this.open ? "opening" : "closing"} the ${this.properties.type} modal`);
          },
        },
        properties: {
          updateContent: () => {
            this.createModalContent();
            this.injectScript();
          },
        },
      };
    },
    get styles() {
      return `
        @keyframes slideInLeft {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translate(0%);
            position: relative;
          }
        }
        :host {
          display: flex;
          justify-content: flex-end;
        }
        .dialog {
          opacity: 0;
          min-height: 100vh;
          height: 100vh;
          font-family: Arial, sans-serif;
          position: relative;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
          border-radius: 5px;
          padding: 20px;
          width: 90%;
          right: -10%;
          height: 100%;
          transition: opacity ease-in-out 0.25s;
          animation: slieOutRight 0.5s;
        }
        .dialog.open {
          top: 0;
          height: 100%;
          min-height: 100vh;
          opacity: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: slideInLeft 0.5s;
        }
        .dialog .top-button {
          top: 10px;
          right: 5%;
          position: absolute;
        }
        .dialog .bottom-button {
          bottom: 10px;
          right: 5%;
          position: absolute;
        }
        .dialog .inner {
          width: 90%;
          margin: auto;
          background: url('https://impressure-c630.kxcdn.com/loading.c5de814fe527fa434435.gif') no-repeat center center / 20px;
        }
        .dialog .inner #content-output {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          min-height: 100vh;
        }
      `;
    },
    handleVisibility() {
      this.open = !this.open;
    },
    extractProperties(node) {
      //utility to extract all attributes from a node, in our case we are grabbing all the atts from
      // our modified terms/privacy/partners links
      const o = {};
      const a = node.attributes;
      [...a].forEach((attr) => {
        o[attr.nodeName] = attr.nodeValue;
      });
      return o;
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
      modal.className = "dialog";

      modal.innerHTML = this.transpileToHTML(`<style>${this.styles}</style>
  <button id="closeModalTop" class="top-button" @click:id(closeModalTop)=handleVisibility>${this.clickAction}</button>
  <div class="inner">
      <div id="content-output"></div>
  <button id="closeModalBottom" class="bottom-button" @click:id(closeModalBottom)=handleVisibility>${this.clickAction}</button>
  </div>`);
      return modal;
    },
    createModalContent() {
      let content = "";
      switch (this.properties.type) {
        case "terms-privacy":
        default:
          this.script = `https://distro.quick-cdn.com/build/compliance/legal-page-injector.js`;
          content = `
    <h1 legal-element="title"></h1>
    <main id="data-output" legal-element="content"></main>`;
          break;
        case "partners":
          this.script = `https://leads.digitalmediasolutions.com/js/partners.js?vertical=${this.properties.vertical}`;
          content = `
    <h1>Marketing Partners:</h1>
    <ul id="${this.properties.vertical}-list"></ul>`;
          break;
      }
      this.modal.querySelector("#content-output").innerHTML = content;
    },
    preprocessModal() {
      //add event listeners to modal based on events we extracted from the transpiled html template
      this.events.forEach((event) => {
        this.modal
          .querySelector(`${event.get("elementDomIdPrefix")}${event.get("elementDomIdValue")}`)
          .addEventListener(event.get("eventType"), this[event.get("eventListenerCallback")].bind(this));
      });
      return this.modal;
    },
    injectScript() {
      //inject the proper script for the modal
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
      //create the inital modal, which is hidden and has no content
      this.modal = this.createModal();
      //append the processed modal to the DOM target
      this.modalTarget.appendChild(this.preprocessModal());
    },
  });

  //initialize modal
  modal.init();

  //go through all links on page and transform the ones we need to
  //only target links that are redirecting to privacy, terms, or partners
  const blacklistedLinkParts = ["notice", "privacy", "terms", "partners"];
  const aTags = [...document.querySelectorAll("a")];
  const linkOutTags = aTags.filter((anchor) => {
    for (const part of blacklistedLinkParts) {
      if (anchor.href.includes(part)) {
        anchor.dataset.modalCategory = part;
        anchor.href = "javascript:void(0);";
        return anchor;
      }
    }
  });
  for (const tag of linkOutTags) {
    tag.addEventListener("click", function (ev) {
      modal.properties = modal.properties || {};
      const newProps = {};
      newProps.brand = "medicaredeluxe";
      switch (ev.target.dataset.modalCategory) {
        case "privacy":
        default:
          newProps.contenttype = "privacy-policy";
          newProps.type = "terms-privacy";
          break;
        case "terms":
          newProps.contenttype = "terms";
          newProps.type = "terms-privacy";
          break;
        case "partners":
          newProps.vertical = "medicare-oo";
          newProps.type = "partners";
          break;
        case "notice":
          newProps.contenttype = "privacy-notice";
          newProps.type = "terms-privacy";
          break;
      }
      //controls the modal via our reactive properties
      //all we have to do is update the open property to change visibility, and update the props to change the content
      modal.properties = newProps;
      modal.open = !modal.open;
    });
  }
}
