'use strict';

const config = require('app/config');
const TestWrapper = require('test/util/TestWrapper');
const MentalCapacity = require('app/steps/ui/executors/mentalcapacity/index');
const StopPage = require('app/steps/ui/stoppage/index');
const commonContent = require('app/resources/en/translation/common');
const cookies = [{
    name: '__eligibility',
    content: {
        nextStepUrl: '/applicant-executor',
        pages: [
            '/death-certificate',
            '/deceased-domicile',
            '/iht-completed',
            '/will-left',
            '/will-original'
        ]
    }
}];

describe('applicant-executor', () => {
    let testWrapper;
    const expectedNextUrlForMentalCapacity = MentalCapacity.getUrl();
    const expectedNextUrlForStopPage = StopPage.getUrl('notExecutor');

    beforeEach(() => {
        testWrapper = new TestWrapper('ApplicantExecutor');
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
            const data = {};

            testWrapper.testErrors(done, data, 'required', [], cookies);
        });

        it(`test it redirects to next page: ${expectedNextUrlForMentalCapacity}`, (done) => {
            const data = {
                executor: 'Yes'
            };

            testWrapper.testRedirect(done, data, expectedNextUrlForMentalCapacity, cookies);
        });

        it(`test it redirects to stop page: ${expectedNextUrlForStopPage}`, (done) => {
            const data = {
                executor: 'No'
            };

            testWrapper.testRedirect(done, data, expectedNextUrlForStopPage, cookies);
        });

        it('test save and close link is not displayed on the page', (done) => {
            const playbackData = {};
            playbackData.saveAndClose = commonContent.saveAndClose;

            testWrapper.testContentNotPresent(done, playbackData);
        });
    });
});
