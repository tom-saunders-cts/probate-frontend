'use strict';

const TestWrapper = require('test/util/TestWrapper');
const DeceasedAddress = require('app/steps/ui/deceased/address');
const testHelpBlockContent = require('test/component/common/testHelpBlockContent.js');
const config = require('app/config');
const nock = require('nock');
const featureToggleUrl = config.featureToggles.url;
const intestacyQuestionsFeatureTogglePath = `${config.featureToggles.path}/${config.featureToggles.intestacy_questions}`;
const featureTogglesNock = (status = 'true') => {
    nock(featureToggleUrl)
        .get(intestacyQuestionsFeatureTogglePath)
        .reply(200, status);
};

describe('deceased-details', () => {
    let testWrapper;
    const expectedNextUrlForDeceasedAddress = DeceasedAddress.getUrl();

    beforeEach(() => {
        testWrapper = new TestWrapper('DeceasedDetails');
        featureTogglesNock();
    });

    afterEach(() => {
        testWrapper.destroy();
        nock.cleanAll();
    });

    describe('Verify Content, Errors and Redirection', () => {
        testHelpBlockContent.runTest('DeceasedDetails', featureTogglesNock);

        it('test right content loaded on the page', (done) => {
            testWrapper.testContent(done, []);
        });

        it('test errors message displayed for missing data', (done) => {
            const errorsToTest = ['firstName', 'lastName', 'dob-day', 'dob-month', 'dob-year', 'dod-day', 'dod-month', 'dod-year'];
            const data = {};

            testWrapper.testErrors(done, data, 'required', errorsToTest);
        });

        it('test errors message displayed for invalid firstName', (done) => {
            const errorsToTest = ['firstName'];
            const data = {
                firstName: '<dee',
                lastName: 'ceased'
            };
            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test errors message displayed for invalid lastName', (done) => {
            const errorsToTest = ['lastName'];
            const data = {
                firstName: 'dee',
                lastName: '<ceased'
            };
            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test errors message displayed for invalid DoB day', (done) => {
            const errorsToTest = ['dob-day'];
            const data = {'dob-day': '32', 'dob-month': '9', 'dob-year': '2000'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test errors message displayed for invalid DoB month', (done) => {
            const errorsToTest = ['dob-month'];
            const data = {'dob-day': '13', 'dob-month': '14', 'dob-year': '2000'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test errors message displayed for non-numeric DoB day', (done) => {
            const errorsToTest = ['dob-day'];
            const data = {'dob-day': 'ab', 'dob-month': '09', 'dob-year': '2000'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test errors message displayed for non-numeric DoB month', (done) => {
            const errorsToTest = ['dob-month'];
            const data = {'dob-day': '13', 'dob-month': 'ab', 'dob-year': '2000'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test errors message displayed for non-numeric DoB year', (done) => {
            const errorsToTest = ['dob-year'];
            const data = {'dob-day': '13', 'dob-month': '12', 'dob-year': '20ab'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test errors message displayed for three digits in DoB year field', (done) => {
            const errorsToTest = ['dob-year'];
            const data = {'dob-day': '12', 'dob-month': '9', 'dob-year': '200'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test error message displayed for DoB in the future', (done) => {
            const errorsToTest = ['dob-date'];
            const data = {
                'firstName': 'Dee',
                'lastName': 'Ceased',
                'dob-day': '12',
                'dob-month': '9',
                'dob-year': '3000',
                'dod-day': '12',
                'dod-month': '9',
                'dod-year': '2018'
            };

            testWrapper.testErrors(done, data, 'dateInFuture', errorsToTest);
        });

        it('test error message displayed for invalid DoD day', (done) => {
            const errorsToTest = ['dod-day'];
            const data = {'dod-day': '32', 'dod-month': '09', 'dod-year': '2000'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test error message displayed for invalid DoD month', (done) => {
            const errorsToTest = ['dod-month'];
            const data = {'dod-day': '13', 'dod-month': '14', 'dod-year': '2000'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test error message displayed for non-numeric DoD day', (done) => {
            const errorsToTest = ['dod-day'];
            const data = {'dod-day': 'ab', 'dod-month': '09', 'dod-year': '2000'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test error message displayed for non-numeric DoD month', (done) => {
            const errorsToTest = ['dod-month'];
            const data = {'dod-day': '13', 'dod-month': 'ab', 'dod-year': '2000'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test error message displayed for non-numeric DoD year', (done) => {
            const errorsToTest = ['dod-year'];
            const data = {'dod-day': '13', 'dod-month': '12', 'dod-year': '20ab'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test error message displayed for three digits in DoD year field', (done) => {
            const errorsToTest = ['dod-year'];
            const data = {'dod-day': '12', 'dod-month': '9', 'dod-year': '200'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test error message displayed for DoD in the future', (done) => {
            const errorsToTest = ['dod-date'];
            const data = {
                'firstName': 'Dee',
                'lastName': 'Ceased',
                'dob-day': '12',
                'dob-month': '9',
                'dob-year': '2018',
                'dod-day': '12',
                'dod-month': '9',
                'dod-year': '3000'
            };

            testWrapper.testErrors(done, data, 'dateInFuture', errorsToTest);
        });

        it('test error message displayed for DoD before DoB', (done) => {
            const errorsToTest = ['dob-date'];
            const data = {
                'firstName': 'Dee',
                'lastName': 'Ceased',
                'dob-day': '12',
                'dob-month': '9',
                'dob-year': '2015',
                'dod-day': '12',
                'dod-month': '9',
                'dod-year': '2010'
            };

            testWrapper.testErrors(done, data, 'dodBeforeDob', errorsToTest);
        });

        it(`test it redirects to Deceased Address page: ${expectedNextUrlForDeceasedAddress}`, (done) => {
            testWrapper.agent.post('/prepare-session-field/caseType/intestacy')
                .end(() => {
                    const data = {
                        'firstName': 'Bob',
                        'lastName': 'Smith',
                        'dob-day': '12',
                        'dob-month': '9',
                        'dob-year': '2000',
                        'dod-day': '12',
                        'dod-month': '9',
                        'dod-year': '2018'
                    };
                    testWrapper.testRedirect(done, data, expectedNextUrlForDeceasedAddress);
                });
        });
    });
});
