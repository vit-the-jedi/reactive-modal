(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class UserAgentDetector {
  constructor(userAgent) {
    this.userAgent = userAgent;
  }
  detect(appName = "fb") {
    switch (appName) {
      case "fb":
        return this.isFacebookInAppBrowser();
      default:
        return false;
    }
  }
  isFacebookInAppBrowser() {
    const fbInAppBrowserRegex = /FBAN|FBAV|FBIOS|FBOP|FBDV|FBSV|FBSS|FBCR|FBID|FBLC|FBOP|FB_IAB/;
    return fbInAppBrowserRegex.test(this.userAgent);
  }
}
const targetMap = /* @__PURE__ */ new WeakMap();
function reactive(target, effect) {
  const handler = {
    get(target2, key, reciever) {
      let result = Reflect.get(target2, key, reciever);
      track(target2, key);
      return result;
    },
    set(target2, key, value, reciever) {
      let oldValue = target2[key];
      let result = Reflect.set(target2, key, value, reciever);
      if (result && oldValue !== value) {
        trigger(target2, key);
      }
      return result;
    }
  };
  return new Proxy(target, handler);
}
function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, dep = /* @__PURE__ */ new Map());
  }
  if (target.effects) {
    const effects = Object.entries(target.effects());
    effects.forEach((effect) => {
      if (effect[0] === key) {
        dep.set(key, effect[1]);
      }
    });
  }
}
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let dep = depsMap.get(key);
  if (dep) {
    dep.forEach((effectName) => {
      Object.values(effectName).forEach((effectFn) => {
        effectFn();
      });
    });
  }
}
function transpileToHTML(string) {
  let events = [];
  const r = new RegExp(/@(\w+):(\w+)\((\w+)\)=(\w+)/g);
  string.match(r).forEach((match) => {
    const eventsMap = /* @__PURE__ */ new Map();
    eventsMap.set("eventType", match.split("@")[1].split(":")[0]);
    eventsMap.set("elementDomIdPrefix", match.split(":")[1].split("(")[0] === "id" ? "#" : ".");
    eventsMap.set("elementDomIdValue", match.split("(")[1].split(")")[0]);
    eventsMap.set("eventListenerCallback", match.split("=")[1]);
    events.push(eventsMap);
  });
  return [string.replace(/@(\w+):(\w+)\((\w+)\)=(\w+)/g, ""), events];
}
function waitForReactRenderOfElement(selector) {
  const attemptLimit = 100;
  return new Promise((resolve, reject) => {
    let intervalsRun = 0;
    function checkForElement() {
      intervalsRun++;
      if (intervalsRun === attemptLimit) {
        reject(
          new Error(
            `waitForReactRenderOfElement: Could not find element with selector: "${selector}". Attempt limit reached (${attemptLimit} attempts)`
          )
        );
      }
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(intervalId);
        resolve(element);
      }
    }
    const intervalId = setInterval(checkForElement, 50);
  });
}
const modal = reactive({
  open: false,
  clickAction: "&times",
  modalTarget: null,
  properties: {},
  focusedElement: null,
  scripts: {},
  created: false,
  currentPage: null,
  //Impressure only
  effects() {
    return {
      open: {
        toggleVisibility: () => {
          this.modal.classList.toggle("open");
          if (this.open === false && this.focusedElement) {
            this.focusedElement.focus();
          }
        },
        trackFocusedElement: () => {
          this.focusedElement = document.activeElement;
        }
      },
      properties: {
        updateContent: () => {
          this.createModalContent();
          this.injectScript();
        }
      },
      currentPage: {
        pageChange: () => {
          modifyLinkTags();
          this.create();
        }
      }
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
          text-align: left;
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
          font-size: 1.75em;
          cursor: pointer;
        }
        .modal-button {
          border: none;
          background: none;
        }
        .dialog{
          width: 90%;
          margin: auto;
          display: inline-block;
          background: #fff, url('https://impressure-c630.kxcdn.com/loading.c5de814fe527fa434435.gif') no-repeat center center / 20px;
          position: relative;
        }
        .dialog .inner {
          background: #fff;
        }
        .dialog .inner #content-output {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          min-height: 100vh;
          display:inline-block;
        }
        .dialog .inner p, .dialog .inner span, .dialog .inner td {
          text-align: left;
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
            height: 85vh;
            min-height: 85vh;
            margin-top: 15vh;
            bottom: 0;
            top: unset;
            animation: slideUp 0.5s;
            transform: translateY(0%);
            transform: translateX(0%);
          }
          #${this.modalTarget.id}:has(.dialog.open) .button-container {
            left: calc(50% - 30px);
            width: 45px;
            height: 45px;
            top: calc(15vh / 2);
          }
      `;
  },
  createModal() {
    const modal2 = document.createElement("div");
    modal2.id = `in-app-modal`;
    modal2.className = "dialog";
    modal2.innerHTML = `<style>${this.styles}</style>
    <div class="inner">
        <div id="content-output">
        </div>
    </div>`;
    return modal2;
  },
  createModalButton() {
    const transpiledButton = transpileToHTML(`  
    <button id="closeModalTop" class="top-button">${this.clickAction}</button> `);
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
  injectScript() {
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
  create() {
    this.modal = this.createModal();
    this.modalTarget.appendChild(this.modal);
    const buttonCont = document.createElement("div");
    buttonCont.innerHTML = `<button id="closeModalTop" class="top-button">${this.clickAction}</button> `;
    buttonCont.className = "button-container";
    this.modalTarget.prepend(buttonCont);
  }
});
const uaDetector = new UserAgentDetector(window.navigator.userAgent);
function modifyLinkTags() {
  const linkCategories = {
    privacy: { content: "privacy-policy", type: "terms-privacy" },
    terms: { content: "terms", type: "terms-privacy" },
    partners: { vertical: modal.modalTarget.getAttribute("vertical"), type: "partners" },
    notice: { content: "privacy-notice", type: "terms-privacy" }
  };
  const getCategory = (href) => {
    const blacklistedLinkParts = ["notice", "privacy", "terms", "partners"];
    for (const part of blacklistedLinkParts) {
      if (href.includes(part)) {
        return part;
      }
    }
    return null;
  };
  const handleLinkClick = (event) => {
    event.preventDefault();
    const contentKey = event.target.dataset.modalCategory !== "partners" ? "content" : "vertical";
    const { [contentKey]: content, type } = linkCategories[event.target.dataset.modalCategory];
    modal.properties = { brand: modal.modalTarget.getAttribute("brand"), [contentKey]: content, type };
    modal.open = !modal.open;
    modal.modalTarget.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", handleCloseButtonClick);
    });
  };
  const handleCloseButtonClick = () => {
    modal.open = !modal.open;
  };
  [...document.querySelectorAll("a")].filter((anchor) => {
    if (anchor.href.includes("javascript")) {
      return false;
    }
    const category = getCategory(anchor.href);
    if (category) {
      anchor.dataset.modalCategory = category;
      anchor.href = "javascript:void(0)";
      return true;
    }
    return false;
  }).forEach((tag) => {
    tag.addEventListener("click", handleLinkClick);
  });
}
const watchForPageChange = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const pageElement = document.querySelector(".survey .page");
        if (pageElement) {
          waitForReactRenderOfElement("#modalTarget").then((el) => {
            modal.modalTarget = el;
            modal.currentPage = pageElement.id;
          });
        }
      }
    });
  });
  const surveyElement = document.querySelector(".survey");
  observer.observe(surveyElement, { childList: true });
};
if (uaDetector.detect("fb")) {
  waitForReactRenderOfElement("#modalTarget").then((el) => {
    modal.modalTarget;
    modal.modalTarget = el;
    modal.currentPage;
    modal.currentPage = "";
    modal.properties;
    modifyLinkTags();
    watchForPageChange();
  });
}
