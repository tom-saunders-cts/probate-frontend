'use strict';

const TestWrapper = require('test/util/TestWrapper');
const config = require('app/config');
const commonContent = require('app/resources/en/translation/common');

describe('stop-page', () => {
    let testWrapper;

    beforeEach(() => {
        testWrapper = new TestWrapper('StopPage');
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        it('test right content loaded on the page - no death certificate', (done) => {
            testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl('deathCertificate');
            const excludeKeys = ['notInEnglandOrWales', 'ihtNotCompleted', 'noWill', 'notOriginal', 'notExecutor', 'mentalCapacity', 'notDiedAfterOctober2014', 'notRelated', 'otherApplicants'];
            testWrapper.testContent(done, excludeKeys, {deathReportedToCoroner: config.links.deathReportedToCoroner});
        });

        it('test right content loaded on the page - deceased not in england or wales', (done) => {
            testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl('notInEnglandOrWales');
            const excludeKeys = ['deathCertificate', 'ihtNotCompleted', 'noWill', 'notOriginal', 'notExecutor', 'mentalCapacity', 'notDiedAfterOctober2014', 'notRelated', 'otherApplicants'];
            testWrapper.testContent(done, excludeKeys, {applicationFormPA1P: config.links.applicationFormPA1P, guidance: config.links.guidance, registryInformation: config.links.registryInformation});
        });

        it('test right content loaded on the page - iht not completed', (done) => {
            testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl('ihtNotCompleted');
            const excludeKeys = ['deathCertificate', 'notInEnglandOrWales', 'noWill', 'notOriginal', 'notExecutor', 'mentalCapacity', 'notDiedAfterOctober2014', 'notRelated', 'otherApplicants'];
            testWrapper.testContent(done, excludeKeys, {ihtNotCompleted: config.links.ihtNotCompleted});
        });

        it('test right content loaded on the page - no will', (done) => {
            testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl('noWill');
            const excludeKeys = ['deathCertificate', 'notInEnglandOrWales', 'ihtNotCompleted', 'notOriginal', 'notExecutor', 'mentalCapacity', 'notDiedAfterOctober2014', 'notRelated', 'otherApplicants'];
            testWrapper.testContent(done, excludeKeys, {applicationFormPA1A: config.links.applicationFormPA1A, guidance: config.links.guidance, registryInformation: config.links.registryInformation});
        });

        it('test right content loaded on the page - not original', (done) => {
            testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl('notOriginal');
            const excludeKeys = ['deathCertificate', 'notInEnglandOrWales', 'ihtNotCompleted', 'noWill', 'notExecutor', 'mentalCapacity', 'notDiedAfterOctober2014', 'notRelated', 'otherApplicants'];
            testWrapper.testContent(done, excludeKeys, {applicationFormPA1P: config.links.applicationFormPA1P, guidance: config.links.guidance, registryInformation: config.links.registryInformation});
        });

        it('test right content loaded on the page - not executor', (done) => {
            testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl('notExecutor');
            const excludeKeys = ['deathCertificate', 'notInEnglandOrWales', 'ihtNotCompleted', 'noWill', 'notOriginal', 'mentalCapacity', 'notDiedAfterOctober2014', 'notRelated', 'otherApplicants'];
            testWrapper.testContent(done, excludeKeys, {applicationFormPA1P: config.links.applicationFormPA1P, guidance: config.links.guidance, registryInformation: config.links.registryInformation});
        });

        it('test right content loaded on the page - mental capacity', (done) => {
            testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl('mentalCapacity');
            const excludeKeys = ['deathCertificate', 'notInEnglandOrWales', 'ihtNotCompleted', 'noWill', 'notOriginal', 'notExecutor', 'notDiedAfterOctober2014', 'notRelated', 'otherApplicants'];
            testWrapper.testContent(done, excludeKeys, {applicationFormPA1P: config.links.applicationFormPA1P, guidance: config.links.guidance, registryInformation: config.links.registryInformation});
        });

        it('test right content loaded on the page - not died after october 2014', (done) => {
            testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl('notDiedAfterOctober2014');
            const excludeKeys = ['deathCertificate', 'notInEnglandOrWales', 'ihtNotCompleted', 'noWill', 'notOriginal', 'notExecutor', 'mentalCapacity', 'notRelated', 'otherApplicants'];
            testWrapper.testContent(done, excludeKeys, {applicationFormPA1A: config.links.applicationFormPA1A});
        });

        it('test right content loaded on the page - not related', (done) => {
            testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl('notRelated');
            const excludeKeys = ['deathCertificate', 'notInEnglandOrWales', 'ihtNotCompleted', 'noWill', 'notOriginal', 'notExecutor', 'mentalCapacity', 'notDiedAfterOctober2014', 'otherApplicants'];
            testWrapper.testContent(done, excludeKeys, {applicationFormPA1A: config.links.applicationFormPA1A});
        });

        it('test right content loaded on the page - other applicants', (done) => {
            testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl('otherApplicants');
            const excludeKeys = ['deathCertificate', 'notInEnglandOrWales', 'ihtNotCompleted', 'noWill', 'notOriginal', 'notExecutor', 'mentalCapacity', 'notDiedAfterOctober2014', 'notRelated'];
            testWrapper.testContent(done, excludeKeys, {applicationFormPA1A: config.links.applicationFormPA1A});
        });

        it('test "sign out" link is not displayed on the page', (done) => {
            const playbackData = {};
            playbackData.signOut = commonContent.signOut;
            testWrapper.testContentNotPresent(done, playbackData);
        });
    });
});
