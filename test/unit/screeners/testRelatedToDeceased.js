'use strict';

const journey = require('app/journeys/intestacy');
const initSteps = require('../../../app/core/initSteps');
const expect = require('chai').expect;
const steps = initSteps([`${__dirname}/../../../app/steps/action/`, `${__dirname}/../../../app/steps/ui`]);
const RelatedToDeceased = steps.RelatedToDeceased;

describe('RelatedToDeceased', () => {
    describe('getUrl()', () => {
        it('should return the correct url', (done) => {
            const url = RelatedToDeceased.constructor.getUrl();
            expect(url).to.equal('/related-to-deceased');
            done();
        });
    });

    describe('getContextData()', () => {
        it('should return the correct context on GET', (done) => {
            const req = {
                method: 'GET',
                sessionID: 'dummy_sessionId',
                session: {
                    form: {
                        ccdCase: {
                            id: 1234567890123456,
                            state: 'Draft'
                        }
                    },
                    caseType: 'gop'
                },
                body: {
                    related: 'optionYes'
                }
            };
            const res = {};

            const ctx = RelatedToDeceased.getContextData(req, res);
            expect(ctx).to.deep.equal({
                sessionID: 'dummy_sessionId',
                related: 'optionYes',
                caseType: 'gop',
                userLoggedIn: false,
                ccdCase: {
                    id: 1234567890123456,
                    state: 'Draft'
                }
            });
            done();
        });
    });

    describe('nextStepUrl()', () => {
        it('should return the correct url when Yes is given', (done) => {
            const req = {
                session: {
                    journey: journey,
                    form: {
                        screeners: {
                            deathCertificate: 'Yes',
                            domicile: 'Yes',
                            completed: 'Yes',
                            left: 'No',
                            diedAfter: 'Yes'
                        }
                    }
                }
            };
            const ctx = {
                related: 'optionYes'
            };
            const nextStepUrl = RelatedToDeceased.nextStepUrl(req, ctx);
            expect(nextStepUrl).to.equal('/other-applicants');
            done();
        });

        it('should return the correct url when No is given', (done) => {
            const req = {
                session: {
                    journey: journey,
                    form: {
                        screeners: {
                            deathCertificate: 'Yes',
                            domicile: 'Yes',
                            completed: 'Yes',
                            left: 'No',
                            diedAfter: 'Yes'
                        }
                    }
                }
            };
            const ctx = {
                related: 'optionNo'
            };
            const nextStepUrl = RelatedToDeceased.nextStepUrl(req, ctx);
            expect(nextStepUrl).to.equal('/stop-page/notRelated');
            done();
        });
    });

    describe('nextStepOptions()', () => {
        it('should return the correct options', (done) => {
            const nextStepOptions = RelatedToDeceased.nextStepOptions();
            expect(nextStepOptions).to.deep.equal({
                options: [{
                    key: 'related',
                    value: 'optionYes',
                    choice: 'related'
                }]
            });
            done();
        });
    });
});
