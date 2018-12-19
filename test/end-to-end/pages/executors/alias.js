'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/executors/alias/index');

module.exports = function () {
    const I = this;

    I.seeCurrentUrlEquals(pageUnderTest.getUrl());

    I.click('#alias-optionYes');

    I.click(commonContent.saveAndContinue);

};
