'use strict';

const contentEn = require('app/resources/en/translation/common');
const contentCy = require('app/resources/cy/translation/common');
const applicantExecutorEn = require('app/resources/en/translation/screeners/applicantexecutor');
const applicantExecutorCy = require('app/resources/cy/translation/screeners/applicantexecutor');
const pageUnderTest = require('app/steps/ui/screeners/applicantexecutor');

module.exports = async function(language ='en', answer) {
    const I = this;
    const commonContent = language === 'en' ? contentEn : contentCy;
    const applicantExecutorContent = language === 'en' ? applicantExecutorEn : applicantExecutorCy;

    await I.seeInCurrentUrl(pageUnderTest.getUrl());
    if (language === 'en') {
        await I.waitForText(applicantExecutorContent.question);
        await I.see(applicantExecutorContent.hintText1);
        await I.see(applicantExecutorContent.hintText2);
    }
    const locator = {css: `#executor${answer}`};
    await I.waitForElement(locator);
    await I.click(locator);
    await I.navByClick(commonContent.continue);
};
