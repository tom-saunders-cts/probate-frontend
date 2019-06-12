'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/applicant/name');

module.exports = function (firstname, lastname) {
    const I = this;
    I.waitInUrl(pageUnderTest.getUrl());
    I.fillField('#firstName', firstname);
    I.fillField('#lastName', lastname);

    I.waitForNavigationToComplete(commonContent.saveAndContinue);
};
