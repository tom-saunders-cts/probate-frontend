'use strict';

const TestWrapper = require('test/util/TestWrapper');
const sessionData = require('test/data/complete-form-undeclared');
const commonContent = require('app/resources/en/translation/common');
const nock = require('nock');
const config = require('app/config');
const orchestratorServiceUrl = config.services.orchestrator.url;

describe('co-applicant-all-agreed-page', () => {
    let testWrapper;
    let contentData;

    beforeEach(() => {
        testWrapper = new TestWrapper('CoApplicantAllAgreedPage');
    });

    afterEach(() => {
        nock.cleanAll();
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        it('test correct content is loaded on the page when there are no codicils', (done) => {
            nock(orchestratorServiceUrl)
                .get('/invite/allAgreed/undefined')
                .reply(200, true);

            sessionData.formdata.will.codicils = commonContent.no;

            const contentToExclude = [
                'paragraph4-codicils'
            ];

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData.formdata)
                .end(() => {
                    testWrapper.testContent(done, contentToExclude, contentData);
                });
        });

        it('test correct content is loaded on the page when there are codicils', (done) => {
            nock(orchestratorServiceUrl)
                .get('/invite/allAgreed/undefined')
                .reply(200, true);

            sessionData.formdata.will.codicils = commonContent.yes;

            const contentToExclude = [
                'paragraph4'
            ];

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData.formdata)
                .end(() => {
                    testWrapper.testContent(done, contentToExclude, contentData);
                });
        });

        it('test save and close link is not displayed on the page', (done) => {
            const playbackData = {
                saveAndClose: commonContent.saveAndClose,
                signOut: commonContent.signOut
            };
            testWrapper.testContentNotPresent(done, playbackData);
        });
    });
});
