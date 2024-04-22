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
