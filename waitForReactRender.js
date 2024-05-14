"use strict";

function waitForReactRenderOfElement(parent = document, selector) {
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
      const element = parent.querySelector(selector);
      //clear the interval and resolve the promise with the found element
      if (element) {
        clearInterval(intervalId);
        resolve(element);
      }
    }
    const intervalId = setInterval(checkForElement, 50);
  });
}
