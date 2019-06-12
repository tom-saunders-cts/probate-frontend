'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/screeners/ihtcompleted');

module.exports = function (answer) {
    const I = this;

    I.waitInUrl(pageUnderTest.getUrl());
    I.click(`#completed-option${answer}`);

    I.waitForNavigationToComplete(commonContent.continue);
};
