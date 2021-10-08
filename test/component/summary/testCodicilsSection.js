'use strict';

const requireDir = require('require-directory');
const TestWrapper = require('test/util/TestWrapper');
const willContent = requireDir(module, '../../../app/resources/en/translation/will');

describe('summary-codicils-section', () => {
    let testWrapper, sessionData;

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        it('test correct content loaded on the codicils section of the summary page, when no data is entered - FT ON', (done) => {
            testWrapper = new TestWrapper('Summary', {ft_will_condition: true});
            sessionData = require('test/data/will/codicils-noDamage');
            sessionData.ccdCase = {
                state: 'Pending',
                id: 1234567890123456
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    const playbackData = {
                        codicilsHasVisibleDamage: willContent.codicilshasvisibledamage.question
                    };

                    testWrapper.testDataPlayback(done, playbackData);
                });
        });

        it('test correct content loaded on the codicils section of the summary page, when no data is entered - FT OFF', (done) => {
            testWrapper = new TestWrapper('Summary', {ft_will_condition: false});
            sessionData = require('test/data/will/codicils-noDamage');
            sessionData.ccdCase = {
                state: 'Pending',
                id: 1234567890123456
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    const playbackData = {
                        codicils: willContent.codicils.question
                    };

                    testWrapper.testDataPlayback(done, playbackData);
                });
        });
        it('test correct content and data loaded on the codicils section of the summary page, when section is complete', (done) => {
            testWrapper = new TestWrapper('Summary', {ft_will_condition: true});
            sessionData = require('test/data/will/codicils');
            sessionData.ccdCase = {
                state: 'Pending',
                id: 1234567890123456
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end((err) => {
                    if (err) {
                        throw err;
                    }
                    delete require.cache[require.resolve('test/data/will/codicils')];
                    const playbackData = {
                        codicilsHasVisibleDamage: willContent.codicilshasvisibledamage.question,
                        otherDamageDescriptionHint: willContent.codicilshasvisibledamage.otherDamageDescriptionHint,
                        otherDamage: 'Other damage',
                        selectedDamage1: willContent.codicilshasvisibledamage.optionstapleOrPunchHoles,
                        selectedDamage2: willContent.codicilshasvisibledamage.optionotherVisibleDamage,
                        codicilsDamageReasonKnown: willContent.codicilsdamagereasonknown.question,
                        codicilsDamageReasonDescriptionTitle: willContent.codicilsdamagereasonknown.codicilsDamageReasonDescriptionTitle,
                        codicilsDamageDateKnown: willContent.codicilsdamagedate.question,
                        codicilsDamageDate: willContent.codicilsdamagedate.date,
                        culpritQuestion: willContent.codicilsdamageculpritknown.question,
                        culpritFirstName: willContent.codicilsdamageculpritknown.firstName,
                        culpritLastName: willContent.codicilsdamageculpritknown.lastName
                    };

                    testWrapper.testDataPlayback(done, playbackData);
                });
        });
    });
});
