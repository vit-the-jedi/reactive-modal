"use strict";

import { reactive } from "../lightweight-reactivity/src/index.js";
import { transpileToHTML } from "./utils.js";

export const modal = reactive({
  open: false,
  clickAction: "X",
  modalTarget: document.querySelector("#modalTarget"),
  properties: {},
  focusedElement: null,
  scripts: {},
  effects() {
    return {
      open: {
        toggleVisibility: () => {
          this.modal.classList.toggle("open");

          //return focus to the element that triggered the modal after the modal closes
          if (this.open === false && this.focusedElement) {
            this.focusedElement.focus();
          }
        },
        trackFocusedElement: () => {
          this.focusedElement = document.activeElement;
        },
      },
      properties: {
        updateContent: () => {
          console.log(this.properties);
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
            transform: translateX(0%);
            position: relative;
          }
        }
        @keyframes slideOutLeft {
          0% {
            transform: translateX(0%);
            position: relative;
          }
          100% {
            transform: translateX(105%);
            position: absolute;
          }
        }
        @keyframes slideUp {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0%);
            position: relative;
          }
        }
        @keyframes slideDown{
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(100%);
            position: relative;
          }
        }
        body:has(.dialog.open) {
          overflow: hidden;
        }
        #${this.modalTarget.id} {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          overflow: hidden;
          outline: 0;
          z-index: -1;
          transition: all 0.15s;
        }
        #${this.modalTarget.id}:has(.dialog.open)  {
          z-index: 999;
          background-color: rgba(0, 0, 0, 0.5);
        }
        #${this.modalTarget.id}:has(.dialog.open) .button-container {
          display: block;
        }
        .dialog {
          opacity: 0;
          min-height: 85vh;
          height: 0;
          font-family: Arial, sans-serif;
          position: relative;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
          border-radius: 5px;
          padding: 20px;
          width: 90%;
          right: -8%;
          height: 100%;
          transition: opacity ease-in-out 0.25s;
          background: #ffffff;
          transform: translateX(105%);
          animation: slideOutLeft 0.5s;
        }
        .dialog.open {
          top: 5%;
          height: 85vh;
          min-height: 50vh;
          opacity: 1;
          display: inline-block;
          animation: slideInLeft 0.5s;
          overflow-y: scroll;
          transform: translateX(0%);
        }
        .button-container {
          top:10px;
          left: 30px;
          border-radius: 50px;
          background: #e6e6e6;
          width: 30px;
          height: 30px;
          padding: 10px;
          position: absolute;
          display: none;
          text-align: center;

        }
        .button-container button {
          border: none;
          background-color: transparent;
          position: relative;
          width: 100%;
          height: 100%;
          font-size: 1.25em;
          cursor: pointer;
        }
        .modal-button {
          border: none;
          background: none;
        }
        .dialog .inner {
          width: 90%;
          margin: auto;
          display: inline-block;
          background: url('https://impressure-c630.kxcdn.com/loading.c5de814fe527fa434435.gif') no-repeat center center / 20px;
          position: relative;
        }
        .dialog .inner #content-output {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          min-height: 100vh;
          display:inline-block;
        }
        @media screen and (max-width: 767px){
          .dialog {
            right: 0;
            left: 0;
            width: 100%;
            animation: slideDown 0.5s;
            transform: translateY(100%);
          }
          .dialog.open {
            height: 80vh;
            min-height: 80vh;
            margin-top: 15%;
            bottom: 0;
            top: unset;
            animation: slideUp 0.5s;
            transform: translateY(0%);
            transform: translateX(0%);
          }
          #${this.modalTarget.id}:has(.dialog.open) .button-container {
            left: calc(50% - 30px);
          }
        }
      `;
  },
  registerKeyEvents() {},
  handleVisibility() {
    this.open = !this.open;
  },
  createModal() {
    const modal = document.createElement("div");
    modal.id = `in-app-modal`;
    modal.className = "dialog";

    this.registerKeyEvents();

    modal.innerHTML = `<style>${this.styles}</style>
    <div class="inner">
        <div id="content-output">
        </div>
    </div>`;
    return modal;
  },
  createModalButton() {
    //method we want the buttons to run when clicked, passed as string name
    const modalButtonAction = "handleVisibility";
    const transpiledButton = transpileToHTML(`  
    <button id="closeModalTop" class="top-button" @click:id(closeModalTop)=${modalButtonAction}>${this.clickAction}</button> `);
    this.events = transpiledButton[1];
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    buttonContainer.innerHTML = transpiledButton[0];
    return buttonContainer;
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
    this.modal.setAttribute("data-modal-type", this.properties.type);
  },
  preprocessModal() {
    //add event listeners to modal based on events we extracted from the transpiled html template
    this.events.forEach((event) => {
      document
        .querySelector(`${event.get("elementDomIdPrefix")}${event.get("elementDomIdValue")}`)
        .addEventListener(event.get("eventType"), this[event.get("eventListenerCallback")].bind(this));
    });
    return this.modal;
  },
  injectScript() {
    //inject the proper script for the modal
    const scriptExists = document.querySelector(`script[src="${this.script}"]`);
    if (scriptExists) {
      scriptExists.remove();
    }
    const injScript = document.createElement("script");
    injScript.src = this.script;
    injScript.type = "text/javascript";
    injScript.setAttribute("page", `generic-${this.properties.content}`);
    injScript.setAttribute("brand", this.properties.brand);
    document.body.appendChild(injScript);
    this.scripts[this.properties.type] = injScript;
  },
  init() {
    //create the inital modal, which is hidden and has no content
    this.modal = this.createModal();
    //append the processed modal to the DOM target
    this.modalTarget.appendChild(this.createModalButton());
    this.modalTarget.appendChild(this.preprocessModal());
  },
});