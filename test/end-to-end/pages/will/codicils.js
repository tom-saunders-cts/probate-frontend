'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/will/codicils');

module.exports = function (option) {
    const I = this;

    I.waitInUrl(pageUnderTest.getUrl());
    I.click(`#codicils-option${option}`);

    I.waitForNavigationToComplete(commonContent.saveAndContinue);
};
