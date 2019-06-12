'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/deceased/maritalstatus');

module.exports = function (answer) {
    const I = this;
    I.waitInUrl(pageUnderTest.getUrl());
    I.click(`#maritalStatus-option${answer}`);

    I.waitForNavigationToComplete(commonContent.saveAndContinue);
};
