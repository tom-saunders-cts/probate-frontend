// eslint-disable-line max-lines
const TestWrapper = require('test/util/TestWrapper');
const ExecutorsInvite = require('app/steps/ui/executors/invite/index');
const ExecutorsChangeMade = require('app/steps/ui/executors/changemade/index');
const Tasklist = require('app/steps/ui/tasklist/index');
const {assert} = require('chai');

describe('declaration, multiple applicants', () => {
    let testWrapper, contentData, sessionData;
    const expectedNextUrlForExecInvite = ExecutorsInvite.getUrl();
    const expectedNextUrlForExecChangeMade = ExecutorsChangeMade.getUrl();
    const expectedNextUrlForChangeToSingleApplicant = Tasklist.getUrl();

    beforeEach(() => {
        testWrapper = new TestWrapper('Declaration');

        sessionData = require('test/data/complete-form-undeclared').formdata;
        const applicantData = sessionData.applicant;
        const deceasedData = sessionData.deceased;

        contentData = {
            applicantName: `${applicantData.firstName} ${applicantData.lastName}`,
            applicantAddress: applicantData.address,
            deceasedName: `${deceasedData.firstName} ${deceasedData.lastName}`,
            deceasedAddress: deceasedData.address,
            deceasedDob: deceasedData.dob_formattedDate,
            deceasedDod: deceasedData.dod_formattedDate,
            ihtGrossValue: sessionData.iht.grossValue,
            ihtNetValue: sessionData.iht.netValue,
            detailsOfApplicants: 'an applicant of flat 1, somewhere rd, nowhere., fname1other sname1other of 1 qwe\r\n1 asd\r\n1 zxc and fname4 sname4 of 4 qwe\r\n4 asd\r\n4 zxc',
            applicantCurrentName: 'fname1other sname1other',
            applicantNameOnWill: ' as fname1 sname1'
        };

        sessionData.executors.list = [
            {firstName: 'an', lastName: 'applicant', isApplying: true, isApplicant: true},
            {fullName: 'fname1 sname1', isDead: false, isApplying: true, hasOtherName: true, currentName: 'fname1other sname1other', email: 'fname1@example.com', mobile: '07900123456', address: '1 qwe\r\n1 asd\r\n1 zxc', freeTextAddress: '1 qwe\r\n1 asd\r\n1 zxc', addressFlag: true},
            {fullName: 'fname4 sname4', isDead: false, isApplying: true, hasOtherName: false, email: 'fname4@example.com', mobile: '07900123457', address: '4 qwe\r\n4 asd\r\n4 zxc', freeTextAddress: '4 qwe\r\n4 asd\r\n4 zxc', addressFlag: true}];
    });

    afterEach(() => {
        delete require.cache[require.resolve('test/data/complete-form-undeclared')];
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        it('test right content loaded on the page with multiple applicants, deceased has three other names, no codicils', (done) => {
            const contentToExclude = [
                'executorApplyingName-codicils',
                'executorNotApplyingHeader',
                'executorNotApplyingReason',
                'executorNotApplyingReason-codicils',
                'optionDiedBefore',
                'optionDiedAfter',
                'optionPowerReserved',
                'optionRenunciated',
                'additionalExecutorNotified',
                'intro',
                'legalStatementApplicant',
                'deceasedEstateLand',
                'applicantName',
                'applicantName-codicils',
                'applicantName-multipleApplicants-codicils',
                'applicantName-multipleApplicants-mainApplicant-alias',
                'applicantName-multipleApplicants-mainApplicant-alias-codicils',
                'applicantName-multipleApplicants-mainApplicant-codicils',
                'applicantName-multipleApplicants-alias',
                'applicantName-multipleApplicants-alias-codicils',
                'applicantSign',
                'applicantSign-codicils',
                'applicantSign-multipleApplicants-codicils',
                'applicantSign-multipleApplicants-mainApplicant-codicils',
                'declarationConfirm',
                'declarationRequests',
                'declarationUnderstand',
                'declarationUnderstandItem1',
                'declarationUnderstandItem2',
                'submitWarning'
            ];
            sessionData.will.codicils = 'No';
            sessionData.deceased.otherNames = {
                name_0: {firstName: 'James', lastName: 'Miller'},
                name_1: {firstName: 'Joe', lastName: 'Smith'},
                name_2: {firstName: 'Ed', lastName: 'Brown'}
            };
            contentData.deceasedOtherNames = 'James Miller, Joe Smith and Ed Brown';

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.testContent(done, contentToExclude, contentData);
                });
        });

        it('test right content loaded on the page with multiple applicants, deceased has no other names and there are codicils', (done) => {
            const contentToExclude = [
                'deceasedOtherNames',
                'executorApplyingName',
                'executorNotApplyingHeader',
                'executorNotApplyingReason',
                'executorNotApplyingReason-codicils',
                'optionDiedBefore',
                'optionDiedAfter',
                'optionPowerReserved',
                'optionRenunciated',
                'additionalExecutorNotified',
                'intro',
                'legalStatementApplicant',
                'deceasedEstateLand',
                'applicantName',
                'applicantName-codicils',
                'applicantName-multipleApplicants',
                'applicantName-multipleApplicants-mainApplicant-alias',
                'applicantName-multipleApplicants-mainApplicant-alias-codicils',
                'applicantName-multipleApplicants-mainApplicant',
                'applicantName-multipleApplicants-alias',
                'applicantName-multipleApplicants-alias-codicils',
                'applicantSign',
                'applicantSign-codicils',
                'applicantSign-multipleApplicants',
                'applicantSign-multipleApplicants-mainApplicant',
                'declarationConfirm',
                'declarationRequests',
                'declarationUnderstand',
                'declarationUnderstandItem1',
                'declarationUnderstandItem2',
                'submitWarning'
            ];
            sessionData.will.codicils = 'Yes';

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.testContent(done, contentToExclude, contentData);
                });
        });

        it('test right content loaded on the page, applicant has an alias, none of the other executors have a different name deceased has no other names and there are codicils', (done) => {
            const contentToExclude = [
                'deceasedOtherNames',
                'executorApplyingName',
                'executorNotApplyingHeader',
                'executorNotApplyingReason',
                'executorNotApplyingReason-codicils',
                'optionDiedBefore',
                'optionDiedAfter',
                'optionPowerReserved',
                'optionRenunciated',
                'additionalExecutorNotified',
                'intro',
                'legalStatementApplicant',
                'deceasedEstateLand',
                'applicantName',
                'applicantName-codicils',
                'applicantName-multipleApplicants',
                'applicantName-multipleApplicants-alias',
                'applicantName-multipleApplicants-alias-codicils',
                'applicantName-multipleApplicants-mainApplicant-alias',
                'applicantName-multipleApplicants-mainApplicant-codicils',
                'applicantName-multipleApplicants-mainApplicant-alias-codicils',
                'applicantName-multipleApplicants-mainApplicant',
                'applicantName-multipleApplicants-alias-codicils',
                'applicantSign',
                'applicantSign-codicils',
                'applicantSign-multipleApplicants',
                'applicantSign-multipleApplicants-mainApplicant',
                'declarationConfirm',
                'declarationRequests',
                'declarationUnderstand',
                'declarationUnderstandItem1',
                'declarationUnderstandItem2',
                'submitWarning'
            ];
            sessionData.will.codicils = 'Yes';
            sessionData.executors.list[0].nameAsOnTheWill = 'No';
            sessionData.executors.list[0].alias = 'Bob Alias';
            sessionData.executors.list[0].aliasReason = 'Divorce';
            sessionData.executors.list[1].hasOtherName = false;
            delete sessionData.executors.list[1].currentName;
            contentData.detailsOfApplicants = 'an applicant of flat 1, somewhere rd, nowhere., fname1 sname1 of 1 qwe\r\n1 asd\r\n1 zxc and fname4 sname4 of 4 qwe\r\n4 asd\r\n4 zxc';
            contentData.applicantNameOnWill = '';
            contentData.applicantCurrentName = '';

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.testContent(done, contentToExclude, contentData);
                });
        });

        it('test right content loaded on the page, applicant has an alias, no executors have a different name, deceased has no other names and there are codicils', (done) => {
            sessionData.will.codicils = 'Yes';
            sessionData.executors.list[0].nameAsOnTheWill = 'No';
            sessionData.executors.list[0].alias = 'Bob Alias';
            sessionData.executors.list[0].aliasReason = 'Divorce';
            sessionData.executors.list[1].hasOtherName = false;
            delete sessionData.executors.list[1].currentName;

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.agent.get(testWrapper.pageUrl)
                        .then(response => {
                            assert(response.text.includes('an applicant, an executor named in the will or codicils as Bob Alias, is applying for probate. Their name is different because an applicant got divorced.'));
                            assert(response.text.includes('fname1 sname1, an executor named in the will or codicils, is applying for probate.'));
                            assert(response.text.includes('fname4 sname4, an executor named in the will or codicils, is applying for probate.'));
                            done();
                        })
                        .catch(err => {
                            done(err);
                        });
                });
        });

        it('test right content loaded on the page, applicant has an alias, no executors have a different name, deceased has no other names and there are no codicils', (done) => {
            sessionData.will.codicils = 'No';
            sessionData.executors.list[0].nameAsOnTheWill = 'No';
            sessionData.executors.list[0].alias = 'Bob Alias';
            sessionData.executors.list[0].aliasReason = 'Divorce';
            sessionData.executors.list[1].hasOtherName = false;
            delete sessionData.executors.list[1].currentName;

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.agent.get(testWrapper.pageUrl)
                        .then(response => {
                            assert(response.text.includes('an applicant, an executor named in the will as Bob Alias, is applying for probate. Their name is different because an applicant got divorced.'));
                            assert(response.text.includes('fname1 sname1, an executor named in the will, is applying for probate.'));
                            assert(response.text.includes('fname4 sname4, an executor named in the will, is applying for probate.'));
                            done();
                        })
                        .catch(err => {
                            done(err);
                        });
                });
        });

        it('test right content loaded on the page, applicant has an alias, one other executor has a different name (reason given as: Divorce), deceased has no other names and there are codicils', (done) => {
            sessionData.will.codicils = 'Yes';
            sessionData.executors.list[0].nameAsOnTheWill = 'No';
            sessionData.executors.list[0].alias = 'Bob Alias';
            sessionData.executors.list[0].aliasReason = 'Divorce';
            sessionData.executors.list[1].currentNameReason = 'Divorce';

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.agent.get(testWrapper.pageUrl)
                        .then(response => {
                            assert(response.text.includes('an applicant, an executor named in the will or codicils as Bob Alias, is applying for probate. Their name is different because an applicant got divorced.'));
                            assert(response.text.includes('fname1other sname1other, an executor named in the will or codicils as fname1 sname1, is applying for probate. Their name is different because fname1other sname1other got divorced.'));
                            assert(response.text.includes('fname4 sname4, an executor named in the will or codicils, is applying for probate.'));
                            done();
                        })
                        .catch(err => {
                            done(err);
                        });
                });
        });

        it('test right content loaded on the page, applicant has an alias, two other executors have a different name (reason given as: Deed Poll and other), deceased has no other names and there are codicils', (done) => {
            sessionData.will.codicils = 'Yes';
            sessionData.executors.list[0].nameAsOnTheWill = 'No';
            sessionData.executors.list[0].alias = 'Bob Alias';
            sessionData.executors.list[0].aliasReason = 'Divorce';
            sessionData.executors.list[1].currentNameReason = 'Divorce';
            sessionData.executors.list[2].hasOtherName = true;
            sessionData.executors.list[2].currentName = 'dave buster';
            sessionData.executors.list[2].currentNameReason = 'other';
            sessionData.executors.list[2].otherReason = 'they felt like it';

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.agent.get(testWrapper.pageUrl)
                        .then(response => {
                            assert(response.text.includes('an applicant, an executor named in the will or codicils as Bob Alias, is applying for probate. Their name is different because an applicant got divorced.'));
                            assert(response.text.includes('fname1other sname1other, an executor named in the will or codicils as fname1 sname1, is applying for probate. Their name is different because fname1other sname1other got divorced.'));
                            assert(response.text.includes('dave buster, an executor named in the will or codicils as fname4 sname4, is applying for probate. Their name is different because dave buster : they felt like it.'));
                            done();
                        });
                });
        });

        it('test right content loaded on the page, applicant has an alias, one other executor has a different name (reason given as: Marriage), deceased has no other names and there are no codicils', (done) => {
            sessionData.will.codicils = 'No';
            sessionData.executors.list[0].nameAsOnTheWill = 'No';
            sessionData.executors.list[0].alias = 'Bob Alias';
            sessionData.executors.list[0].aliasReason = 'Divorce';
            sessionData.executors.list[1].currentNameReason = 'Marriage';

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.agent.get(testWrapper.pageUrl)
                        .then(response => {
                            assert(response.text.includes('an applicant, an executor named in the will as Bob Alias, is applying for probate. Their name is different because an applicant got divorced.'));
                            assert(response.text.includes('fname1other sname1other, an executor named in the will as fname1 sname1, is applying for probate. Their name is different because fname1other sname1other got married.'));
                            assert(response.text.includes('fname4 sname4, an executor named in the will, is applying for probate.'));
                            done();
                        })
                        .catch(err => {
                            done(err);
                        });
                });
        });

        it('test right content loaded on the page, applicant has an alias, two other executors have a different name (reason given as: Deed Poll and other), deceased has no other names and there are no codicils', (done) => {
            sessionData.will.codicils = 'No';
            sessionData.executors.list[0].nameAsOnTheWill = 'No';
            sessionData.executors.list[0].alias = 'Bob Alias';
            sessionData.executors.list[0].aliasReason = 'Divorce';
            sessionData.executors.list[1].currentNameReason = 'Divorce';
            sessionData.executors.list[2].hasOtherName = true;
            sessionData.executors.list[2].currentName = 'dave buster';
            sessionData.executors.list[2].currentNameReason = 'other';
            sessionData.executors.list[2].otherReason = 'they felt like it';

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.agent.get(testWrapper.pageUrl)
                        .then(response => {
                            assert(response.text.includes('an applicant, an executor named in the will as Bob Alias, is applying for probate. Their name is different because an applicant got divorced.'));
                            assert(response.text.includes('fname1other sname1other, an executor named in the will as fname1 sname1, is applying for probate. Their name is different because fname1other sname1other got divorced.'));
                            assert(response.text.includes('dave buster, an executor named in the will as fname4 sname4, is applying for probate. Their name is different because dave buster : they felt like it.'));
                            done();
                        });
                });
        });

        it('test errors message displayed for missing data', (done) => {
            const data = {};
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.testErrors(done, data, 'required', [
                        'declarationCheckbox'
                    ]);
                });
        });

        it(`test it redirects to next page: ${expectedNextUrlForExecInvite}`, (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        declarationCheckbox: true
                    };
                    testWrapper.testRedirect(done, data, expectedNextUrlForExecInvite);
                });
        });

        it(`test it redirects to next page when the applicant has made a change: ${expectedNextUrlForExecChangeMade}`, (done) => {
            sessionData.declaration = {
                hasDataChanged: true
            };
            sessionData = {
                declaration: {hasDataChanged: true},
                executors: {invitesSent: 'true'}
            };
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        declarationCheckbox: true
                    };
                    testWrapper.testRedirect(done, data, expectedNextUrlForExecChangeMade);
                });
        });

        it(`test it redirects to next page when the applicant has changed to a single applicant: ${expectedNextUrlForChangeToSingleApplicant}`, (done) => {
            sessionData = Object.assign(sessionData, {
                declaration: {hasDataChanged: true}
            }, {
                executors: {list: [sessionData.executors.list.shift()]}
            });
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        declarationCheckbox: true
                    };
                    testWrapper.testRedirect(done, data, expectedNextUrlForChangeToSingleApplicant);
                });
        });
    });
});
