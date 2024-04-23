"use strict";

//import { modal } from "./modal.js";
import { UserAgentDetector } from "./isInApp/detect.js";
import { modal } from "./modal.js";

Object.defineProperty(window.navigator, "userAgent", {
  value:
    "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.121 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/35.0.0.48.273;]",
  writable: true,
});

const uaDetector = new UserAgentDetector(window.navigator.userAgent);

if (uaDetector.detect("fb")) {
  //initialize modal
  modal.init();

  const linkCategories = {
    privacy: { content: "privacy-policy", type: "terms-privacy" },
    terms: { content: "terms", type: "terms-privacy" },
    partners: { vertical: "medicare-oo", type: "partners" },
    notice: { content: "privacy-notice", type: "terms-privacy" },
  };
  // Function to determine the category of a link based on its href
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
    //must invoke the reactive modal's getter on each property we want to be reactive
    //otherwise our reactive function won't track changes
    modal.properties = modal.properties || {};
    const contentKey = event.target.dataset.modalCategory !== "partners" ? "content" : "vertical";
    const { [contentKey]: content, type } = linkCategories[event.target.dataset.modalCategory];

    modal.properties = { brand: modal.modalTarget.getAttribute("brand"), [contentKey]: content, type: type };
    //invoking getter for other reactive property
    modal.open = !modal.open;
  };

  //go through all links on page and transform the ones we need to
  //only target links that are redirecting to privacy, terms, or partners
  [...document.querySelectorAll("a")]
    .filter((anchor) => {
      const category = getCategory(anchor.href);
      if (category) {
        anchor.dataset.modalCategory = category;
        anchor.href = "javascript:void(0)";
        return true;
      }
      return false;
    })
    .forEach((tag) => {
      tag.addEventListener("click", handleLinkClick);
    });
}