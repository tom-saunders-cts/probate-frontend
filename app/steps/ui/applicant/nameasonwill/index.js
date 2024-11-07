'use strict';

const ValidationStep = require('app/core/steps/ValidationStep');
const {get} = require('lodash');
const WillWrapper = require('app/wrappers/Will');

class ApplicantNameAsOnWill extends ValidationStep {

    static getUrl() {
        return '/applicant-name-as-on-will';
    }

    isSoftStop (formdata) {
        return {
            stepName: this.constructor.name,
            isSoftStop: get(formdata, 'applicant.nameAsOnTheWill') === 'optionNo'
        };
    }

    generateContent(ctx = {}, formdata = {}, language = 'en') {
        this.setCodicilFlagInCtx(ctx, formdata);
        return super.generateContent(ctx, formdata, language);
    }

    handleGet(ctx, formdata) {
        this.setCodicilFlagInCtx(ctx, formdata);
        return [ctx];
    }

    setCodicilFlagInCtx(ctx, formdata) {
        ctx.codicilPresent = (new WillWrapper(formdata.will)).hasCodicils();
    }

    handlePost(ctx, errors) {
        if (ctx.nameAsOnTheWill !== 'optionNo') {
            delete ctx.alias;
            delete ctx.aliasReason;
            delete ctx.otherReason;
        }
        return [ctx, errors];
    }

    nextStepOptions() {
        return {
            options: [
                {key: 'nameAsOnTheWill', value: 'optionNo', choice: 'hasAlias'}
            ]
        };
    }

    action(ctx, formdata) {
        super.action(ctx, formdata);

        if (ctx.nameAsOnTheWill === 'optionYes') {
            delete ctx.alias;
            delete ctx.aliasReason;
            delete ctx.otherReason;
            delete formdata.alias;
            delete formdata.aliasReason;
            delete formdata.otherReason;
        }

        return [ctx, formdata];
    }
}

module.exports = ApplicantNameAsOnWill;
