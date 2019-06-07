'use strict';

const Helper = codecept_helper;

class WebDriverHelper extends Helper {

    async waitForNavigationToComplete (locator, signIn = false) {
        const helper = this.helpers.WebDriverIO;

        helper.click(locator);

        // login from IDAM can take a bit longer so wait a little longer
        if (signIn) {
            await helper.wait(8);
        } else {
            await helper.wait(4);
        }
    }

    clickBrowserBackButton() {
        const browser = this.helpers.WebDriverIO.browser;

        return browser.back();
    }

    getBrowserName() {
        const browser = this.helpers.WebDriverIO.browser;

        return browser.browserName;
    }
}
module.exports = WebDriverHelper;
