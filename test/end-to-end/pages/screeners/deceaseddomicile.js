'use strict';

const contentEn = require('app/resources/en/translation/common');
const contentCy = require('app/resources/cy/translation/common');
const deceasedDomicileEn = require('app/resources/en/translation/screeners/deceaseddomicile');
const deceasedDomicileCy = require('app/resources/cy/translation/screeners/deceaseddomicile');
const pagePath = require('app/steps/ui/screeners/deceaseddomicile');

module.exports = async function(language ='en') {
    const I = this;
    const commonContent = language === 'en' ? contentEn : contentCy;
    const deceasedDomicileContent = language === 'en' ? deceasedDomicileEn : deceasedDomicileCy;

    await I.seeInCurrentUrl(pagePath.getUrl());
    if (language === 'en') {
        await I.waitForText(deceasedDomicileContent.question);
        await I.see(deceasedDomicileContent.hintText1);
    }

    await I.click(deceasedDomicileContent.optionYes);
    await I.navByClick(commonContent.continue);
};
