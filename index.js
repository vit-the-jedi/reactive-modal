"use strict";

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
  const getCategory = (url) => {
    //skip empty hostnames
    if (url.hostname.length === 0) return null;
    const domainSplit = url.hostname.split(".");
    const linkDomain = returnDomainWithoutSubDomain(domainSplit);
    const hostUrl = new URL(window.location.href);
    //check if we're in impressure or impressure preview
    const hostDomain = hostUrl.hostname.includes("impressure")
      ? returnDomainWithoutSubDomain(hostUrl.pathname.replace("/embed/", "").split("."))
      : hostDomain.hostname;
    const blacklistedLinkParts = ["notice", "privacy", "terms", "partners", "priv"];
    //if hostnames don't match, leave them alone
    if (linkDomain !== hostDomain) return null;
    for (const part of blacklistedLinkParts) {
      //return the part of the URL that matches an entry in blacklisted parts
      if (url.pathname.includes(part)) {
        return part;
      }
    }
    return null;
  };
  /**
   *
   * @param {Array} domainPartsArray
   * @description Function to return the domain without the subdomain or TLD
   * @returns string of domain without subdomain or TLD
   */
  const returnDomainWithoutSubDomain = (domainPartsArray) => {
    return domainPartsArray.length > 2 ? domainPartsArray.slice(1).join(".") : domainPartsArray.join(".");
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
    //modal.modalTarget.addEventListener("click", handleCloseButtonClick);
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
      let category = getCategory(new URL(anchor.href));
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
