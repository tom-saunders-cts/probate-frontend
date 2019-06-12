'use strict';

const pageUnderTest = require('app/steps/ui/summary');

module.exports = function (redirect) {
    const I = this;

    I.waitInUrl(pageUnderTest.getUrl(redirect));

    if (!I.isInternetExplorer()) {
        I.click('#checkAnswerHref');
    }

    I.waitForNavigationToComplete('.button');
};
