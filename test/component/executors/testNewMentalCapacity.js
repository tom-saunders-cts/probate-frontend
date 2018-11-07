'use strict';

const TestWrapper = require('test/util/TestWrapper');
const NewIhtCompleted = require('app/steps/ui/iht/newcompleted/index');
const StopPage = require('app/steps/ui/stoppage/index');
const testHelpBlockContent = require('test/component/common/testHelpBlockContent.js');

const nock = require('nock');
const config = require('app/config');
const featureToggleUrl = config.featureToggles.url;
const featureTogglePath = `${config.featureToggles.path}/${config.featureToggles.screening_questions}`;

describe('new-mental-capacity', () => {
    let testWrapper;
    const expectedNextUrlForNewIhtCompleted = NewIhtCompleted.getUrl();
    const expectedNextUrlForStopPage = StopPage.getUrl('mentalCapacity');

    beforeEach(() => {
        testWrapper = new TestWrapper('NewMentalCapacity');

        nock(featureToggleUrl)
            .get(featureTogglePath)
            .reply(200, 'true');
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {

        testHelpBlockContent.runTest('NewMentalCapacity');

        it('test content loaded on the page', (done) => {
            testWrapper.testContent(done, [], {});
        });

        it('test errors message displayed for missing data', (done) => {
            const data = {};
            testWrapper.testErrors(done, data, 'required');
        });

        it(`test it redirects to iht completed if all executors are mentally capable: ${expectedNextUrlForNewIhtCompleted}`, (done) => {
            const data = {
                mentalCapacity: 'Yes'
            };
            testWrapper.testRedirect(done, data, expectedNextUrlForNewIhtCompleted);
        });

        it(`test it redirects to stop page if not all executors are mentally capable: ${expectedNextUrlForStopPage}`, (done) => {
            const data = {
                mentalCapacity: 'No'
            };
            testWrapper.testRedirect(done, data, expectedNextUrlForStopPage);
        });
    });
});
