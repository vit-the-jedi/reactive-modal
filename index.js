"use strict";

//import { modal } from "./modal.js";
import { UserAgentDetector } from "./isInApp/detect.js";
import { modal } from "./modal.js";
import { waitForReactRenderOfElement } from "./utils.js";

const uaDetector = new UserAgentDetector(window.navigator.userAgent);

export function modifyLinkTags(parent = document) {
  const linkCategories = {
    privacy: { content: "privacy-policy", type: "terms-privacy" },
    terms: { content: "terms", type: "terms-privacy" },
    partners: { vertical: modal.modalTarget.getAttribute("vertical"), type: "partners" },
    notice: { content: "privacy-notice", type: "terms-privacy" },
  };
  // Function to determine the category of a link based on its href
  const getCategory = (href) => {
    const blacklistedLinkParts = ["notice", "privacy", "terms", "partners", "priv"];
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
    const contentKey = event.target.dataset.modalCategory !== "partners" ? "content" : "vertical";
    const { [contentKey]: content, type } = linkCategories[event.target.dataset.modalCategory];
    modal.properties = { brand: modal.modalTarget.getAttribute("brand"), [contentKey]: content, type: type };
    modal.open = !modal.open;
    modal.modalTarget.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", handleCloseButtonClick);
    });
  };
  const handleInModalLinkClick = (event) => {
    event.preventDefault();
    modal.open = false;
    //must invoke the reactive modal's getter on each property we want to be reactive
    //otherwise our reactive function won't track changes
    const contentKey = event.target.dataset.modalCategory !== "partners" ? "content" : "vertical";
    const { [contentKey]: content, type } = linkCategories[event.target.dataset.modalCategory];
    modal.properties = { brand: modal.modalTarget.getAttribute("brand"), [contentKey]: content, type: type };
    modal.open = !modal.open;
    modal.modal.scrollTo(0, 0);
  };

  const handleCloseButtonClick = () => {
    modal.open = !modal.open;
  };
  //go through all links on page and transform the ones we need to
  //only target links that are redirecting to privacy, terms, or partners
  [...parent.querySelectorAll("a")]
    .filter((anchor) => {
      if (anchor.href.includes("javascript") || anchor.href.includes("#")) {
        return false;
      }
      let category = getCategory(anchor.href);
      if (category) {
        if (category === "priv") category = "privacy";
        if (parent.id === "content-output") anchor.dataset.isInModal = true;
        anchor.dataset.modalCategory = category;
        anchor.href = "javascript:void(0)";
        return true;
      }
      return false;
    })
    .forEach((tag) => {
      if (tag.dataset.isInModal) {
        tag.addEventListener("click", handleInModalLinkClick);
      } else {
        tag.addEventListener("click", handleLinkClick);
      }
    });
}

// check when impressure navigation occurs
const watchForPageChange = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const pageElement = document.querySelector(".survey .page");
        if (pageElement) {
          waitForReactRenderOfElement(document, "#modalTarget").then((el) => {
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
  //initialize all reactive props here
  waitForReactRenderOfElement(document, "#modalTarget").then((el) => {
    let modalTarget = modal.modalTarget;
    modal.modalTarget = el;
    let currentPage = modal.currentPage;
    modal.currentPage = "";
    let modalProps = modal.properties;
    //initialize links
    modifyLinkTags();
    //set up watcher for navigation
    watchForPageChange();
  });
}
