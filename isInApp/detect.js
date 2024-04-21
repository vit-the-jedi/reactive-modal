"use strict";

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

export { UserAgentDetector };
