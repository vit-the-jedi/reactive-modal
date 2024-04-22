import{reactive as l}from"https://vit-the-jedi.github.io/lightweight-reactivity/src/index.js";(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(t){if(t.ep)return;t.ep=!0;const o=n(t);fetch(t.href,o)}})();class c{constructor(i){this.userAgent=i}detect(i="fb"){switch(i){case"fb":return this.isFacebookInAppBrowser();default:return!1}}isFacebookInAppBrowser(){return/FBAN|FBAV|FBIOS|FBOP|FBDV|FBSV|FBSS|FBCR|FBID|FBLC|FBOP|FB_IAB/.test(this.userAgent)}}function d(e){let i=[];const n=new RegExp(/@(\w+):(\w+)\((\w+)\)=(\w+)/g);return e.match(n).forEach(r=>{const t=new Map;t.set("eventType",r.split("@")[1].split(":")[0]),t.set("elementDomIdPrefix",r.split(":")[1].split("(")[0]==="id"?"#":"."),t.set("elementDomIdValue",r.split("(")[1].split(")")[0]),t.set("eventListenerCallback",r.split("=")[1]),i.push(t)}),[e.replace(/@(\w+):(\w+)\((\w+)\)=(\w+)/g,""),i]}const s=l({open:!1,clickAction:"X",modalTarget:document.querySelector("#modalTarget"),properties:{},focusedElement:null,scripts:{},effects(){return{open:{toggleVisibility:()=>{this.modal.classList.toggle("open"),this.open===!1&&this.focusedElement&&this.focusedElement.focus()},trackFocusedElement:()=>{this.focusedElement=document.activeElement}},properties:{updateContent:()=>{console.log(this.properties),this.createModalContent(),this.injectScript()}}}},get styles(){return`
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
      `},registerKeyEvents(){},handleVisibility(){this.open=!this.open},createModal(){const e=document.createElement("div");return e.id="in-app-modal",e.className="dialog",this.registerKeyEvents(),e.innerHTML=`<style>${this.styles}</style>
    <div class="inner">
        <div id="content-output">
        </div>
    </div>`,e},createModalButton(){const i=d(`  
    <button id="closeModalTop" class="top-button" @click:id(closeModalTop)=handleVisibility>${this.clickAction}</button> `);this.events=i[1];const n=document.createElement("div");return n.className="button-container",n.innerHTML=i[0],n},createModalContent(){let e="";switch(this.properties.type){case"terms-privacy":default:this.script="https://distro.quick-cdn.com/build/compliance/legal-page-injector.js",e=`
    <h1 legal-element="title"></h1>
    <main id="data-output" legal-element="content"></main>`;break;case"partners":this.script=`https://leads.digitalmediasolutions.com/js/partners.js?vertical=${this.properties.vertical}`,e=`
    <h1>Marketing Partners:</h1>
    <ul id="${this.properties.vertical}-list"></ul>`;break}this.modal.querySelector("#content-output").innerHTML=e,this.modal.setAttribute("data-modal-type",this.properties.type)},preprocessModal(){return this.events.forEach(e=>{document.querySelector(`${e.get("elementDomIdPrefix")}${e.get("elementDomIdValue")}`).addEventListener(e.get("eventType"),this[e.get("eventListenerCallback")].bind(this))}),this.modal},injectScript(){const e=document.querySelector(`script[src="${this.script}"]`);e&&e.remove();const i=document.createElement("script");i.src=this.script,i.type="text/javascript",i.setAttribute("page",`generic-${this.properties.content}`),i.setAttribute("brand",this.properties.brand),document.body.appendChild(i),this.scripts[this.properties.type]=i},init(){this.modal=this.createModal(),this.modalTarget.appendChild(this.createModalButton()),this.modalTarget.appendChild(this.preprocessModal())}});Object.defineProperty(window.navigator,"userAgent",{value:"Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.121 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/35.0.0.48.273;]",writable:!0});const p=new c(window.navigator.userAgent);if(p.detect("fb")){s.init();const e={privacy:{content:"privacy-policy",type:"terms-privacy"},terms:{content:"terms",type:"terms-privacy"},partners:{vertical:"medicare-oo",type:"partners"},notice:{content:"privacy-notice",type:"terms-privacy"}},i=r=>{const t=["notice","privacy","terms","partners"];for(const o of t)if(r.includes(o))return o;return null},n=r=>{r.preventDefault(),s.properties=s.properties||{};const t=r.target.dataset.modalCategory!=="partners"?"content":"vertical",{[t]:o,type:a}=e[r.target.dataset.modalCategory];s.properties={brand:s.modalTarget.getAttribute("brand"),[t]:o,type:a},s.open=!s.open};[...document.querySelectorAll("a")].filter(r=>{const t=i(r.href);return t?(r.dataset.modalCategory=t,r.href="javascript:void(0)",!0):!1}).forEach(r=>{r.addEventListener("click",n)})}
