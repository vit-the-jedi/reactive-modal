"use strict";

export function extractProperties(node) {
  //utility to extract all attributes from a node, in our case we are grabbing all the atts from
  // our modified terms/privacy/partners links
  const o = {};
  const a = node.attributes;
  [...a].forEach((attr) => {
    o[attr.nodeName] = attr.nodeValue;
  });
  return o;
}

export function transpileToHTML(string) {
  //get our special template event listenr syntax, transpile it to usable js event listener props
  //return html string with special event listener template removed
  let events = [];
  const r = new RegExp(/@(\w+):(\w+)\((\w+)\)=(\w+)/g);
  string.match(r).forEach((match) => {
    const eventsMap = new Map();
    eventsMap.set("eventType", match.split("@")[1].split(":")[0]);
    eventsMap.set("elementDomIdPrefix", match.split(":")[1].split("(")[0] === "id" ? "#" : ".");
    eventsMap.set("elementDomIdValue", match.split("(")[1].split(")")[0]);
    eventsMap.set("eventListenerCallback", match.split("=")[1]);
    events.push(eventsMap);
  });
  return [string.replace(/@(\w+):(\w+)\((\w+)\)=(\w+)/g, ""), events];
}

export function waitForReactRenderOfElement(selector) {
  //polls the DOM either until the element is found or the time limit is reached before throwing an error.
  //Alter the attempt limit value by multiplying your new attempt value * the interval ms value to get the desired amount of time to poll for.
  const attemptLimit = 100;
  return new Promise((resolve, reject) => {
    let intervalsRun = 0;
    function checkForElement() {
      //increase intervalsRun every time the interval is called
      intervalsRun++;
      if (intervalsRun === attemptLimit) {
        reject(
          new Error(
            `waitForReactRenderOfElement: Could not find element with selector: "${selector}". Attempt limit reached (${attemptLimit} attempts)`
          )
        );
      }
      const element = document.querySelector(selector);
      //clear the interval and resolve the promise with the found element
      if (element) {
        clearInterval(intervalId);
        resolve(element);
      }
    }
    const intervalId = setInterval(checkForElement, 50);
  });
}
