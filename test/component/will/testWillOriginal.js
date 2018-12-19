'use strict';

const TestWrapper = require('test/util/TestWrapper');
const ApplicantExecutor = require('app/steps/ui/applicant/executor/index');
const StopPage = require('app/steps/ui/stoppage/index');
const commonContent = require('app/resources/en/translation/common');
const config = require('app/config');
const cookies = [{
    name: config.redis.eligibilityCookie.name,
    content: {
        nextStepUrl: '/will-original',
        pages: [
            '/death-certificate',
            '/deceased-domicile',
            '/iht-completed',
            '/will-left'
        ]
    }
}];

describe('will-original', () => {
    let testWrapper;
    const expectedNextUrlForApplicantExecutor = ApplicantExecutor.getUrl();
    const expectedNextUrlForStopPage = StopPage.getUrl('notOriginal');

    beforeEach(() => {
        testWrapper = new TestWrapper('WillOriginal');
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        it('test help block content is loaded on page', (done) => {
            const playbackData = {};
            playbackData.helpTitle = commonContent.helpTitle;
            playbackData.helpText = commonContent.helpText;
            playbackData.contactTelLabel = commonContent.contactTelLabel.replace('{helpLineNumber}', config.helpline.number);
            playbackData.contactOpeningTimes = commonContent.contactOpeningTimes.replace('{openingTimes}', config.helpline.hours);
            playbackData.helpEmailLabel = commonContent.helpEmailLabel;
            playbackData.contactEmailAddress = commonContent.contactEmailAddress;

            testWrapper.testDataPlayback(done, playbackData, cookies);
        });

        it('test content loaded on the page', (done) => {
            testWrapper.testContent(done, [], {}, cookies);
        });

        it('test errors message displayed for missing data', (done) => {
            testWrapper.testErrors(done, {}, 'required', [], cookies);
        });

        it(`test it redirects to next page: ${expectedNextUrlForApplicantExecutor}`, (done) => {
            const data = {
                original: 'Yes'
            };

            testWrapper.testRedirect(done, data, expectedNextUrlForApplicantExecutor, cookies);
        });

        it(`test it redirects to stop page: ${expectedNextUrlForStopPage}`, (done) => {
            const data = {
                original: 'No'
            };

            testWrapper.testRedirect(done, data, expectedNextUrlForStopPage, cookies);
        });

        it('test "save and close" and "sign out" links are not displayed on the page', (done) => {
            const playbackData = {};
            playbackData.saveAndClose = commonContent.saveAndClose;
            playbackData.signOut = commonContent.signOut;

            testWrapper.testContentNotPresent(done, playbackData);
        });
    });
});
