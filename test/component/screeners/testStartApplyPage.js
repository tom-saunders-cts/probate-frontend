'use strict';

const config = require('app/config');
const TestWrapper = require('../../util/TestWrapper');
const TaskList = require('../../../app/steps/ui/tasklist');
const commonContent = require('../../../app/resources/en/translation/common');
const cookies = [{
    name: config.redis.eligibilityCookie.name,
    content: {
        nextStepUrl: '/start-apply',
        pages: [
            '/death-certificate',
            '/deceased-domicile',
            '/iht-completed',
            '/will-left',
            '/will-original',
            '/applicant-executor',
            '/mental-capacity'
        ]
    }
}];

describe('start-apply', () => {
    let testWrapper;
    const expectedNextUrlForTaskList = TaskList.getUrl();

    beforeEach(() => {
        testWrapper = new TestWrapper('StartApply');
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        it('test content loaded on the page', (done) => {
            const excludeKeys = [];

            testWrapper.testContent(done, excludeKeys, {}, cookies);
        });

        it(`test it redirects to next page: ${expectedNextUrlForTaskList}`, (done) => {
            testWrapper.testRedirect(done, {}, expectedNextUrlForTaskList, cookies);
        });

        it('test "save and close" and "sign out" links are not displayed on the page', (done) => {
            const playbackData = {};
            playbackData.saveAndClose = commonContent.saveAndClose;
            playbackData.signOut = commonContent.signOut;

            testWrapper.testContentNotPresent(done, playbackData);
        });
    });
});
