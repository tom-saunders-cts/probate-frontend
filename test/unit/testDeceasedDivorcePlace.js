'use strict';

const journey = require('app/journeys/intestacy');
const initSteps = require('app/core/initSteps');
const expect = require('chai').expect;
const steps = initSteps([`${__dirname}/../../app/steps/action/`, `${__dirname}/../../app/steps/ui`]);
const DivorcePlace = steps.DivorcePlace;
const contentMaritalStatus = require('app/resources/en/translation/deceased/maritalstatus');
const content = require('app/resources/en/translation/deceased/divorceplace');
const commonContent = require('app/resources/en/translation/common');

describe('DivorcePlace', () => {
    describe('getUrl()', () => {
        it('should return the correct url', (done) => {
            const url = DivorcePlace.constructor.getUrl();
            expect(url).to.equal('/deceased-divorce-place');
            done();
        });
    });

    describe('getContextData()', () => {
        let ctx;
        let req;

        it('should return the context with the legal process string in case of divorce', (done) => {
            req = {
                session: {
                    form: {
                        deceased: {
                            maritalStatus: contentMaritalStatus.optionDivorced
                        }
                    }
                }
            };

            ctx = DivorcePlace.getContextData(req);
            expect(ctx.legalProcess).to.equal(contentMaritalStatus.divorce);
            done();
        });

        it('should return the context with the legal process string in case of separation', (done) => {
            req = {
                session: {
                    form: {
                        deceased: {
                            maritalStatus: contentMaritalStatus.optionSeparated
                        }
                    }
                }
            };

            ctx = DivorcePlace.getContextData(req);
            expect(ctx.legalProcess).to.equal(contentMaritalStatus.separation);
            done();
        });
    });

    describe('generateFields()', () => {
        it('should return the correct content fields', (done) => {
            const ctx = {
                legalProcess: 'divorce'
            };
            const errors = [];

            const fields = DivorcePlace.generateFields(ctx, errors);
            expect(fields).to.deep.equal({
                legalProcess: {
                    error: false,
                    value: 'divorce'
                },
                title: {
                    value: `Where the divorce took place - ${commonContent.serviceName}`
                }
            });
            done();
        });
    });

    describe('nextStepUrl()', () => {
        it('should return the correct url when Yes is given', (done) => {
            const req = {
                session: {
                    journey: journey
                }
            };
            const ctx = {
                divorcePlace: content.optionYes
            };
            const nextStepUrl = DivorcePlace.nextStepUrl(req, ctx);
            expect(nextStepUrl).to.equal('/tasklist');
            done();
        });

        it('should return the correct url when No is given', (done) => {
            const req = {
                session: {
                    journey: journey
                }
            };
            const ctx = {
                divorcePlace: content.optionNo
            };
            const nextStepUrl = DivorcePlace.nextStepUrl(req, ctx);
            expect(nextStepUrl).to.equal('/stop-page/divorcePlace');
            done();
        });
    });

    describe('nextStepOptions()', () => {
        it('should return the correct options', (done) => {
            const nextStepOptions = DivorcePlace.nextStepOptions();
            expect(nextStepOptions).to.deep.equal({
                options: [{
                    key: 'divorcePlace',
                    value: content.optionYes,
                    choice: 'inEnglandOrWales'
                }]
            });
            done();
        });
    });

    describe('action()', () => {
        it('test that context variables are removed and empty object returned', () => {
            let formdata = {};
            let ctx = {
                legalProcess: 'divorce'
            };
            [ctx, formdata] = DivorcePlace.action(ctx, formdata);
            expect(ctx).to.deep.equal({});
        });
    });
});
