'use strict';

const TestWrapper = require('test/util/TestWrapper');
const TaskList = require('app/steps/ui/tasklist/index');
const ExecutorContactDetails = require('app/steps/ui/executors/contactdetails/index');
const ExecutorRoles = require('app/steps/ui/executors/roles/index');

describe('executors-address', () => {
    let testWrapper, sessionData;
    const expectedNextUrlForTaskList = TaskList.getUrl();
    const expectedNextUrlForExecRoles = ExecutorRoles.getUrl('*');
    const expectedNextUrlForExecContactDetails = ExecutorContactDetails.getUrl(2);

    beforeEach(() => {
        testWrapper = new TestWrapper('ExecutorAddress');
        sessionData = {
            applicant: {
                firstName: 'Lead',
                lastName: 'Applicant',
                address: {
                    formattedAddress: ''
                }
            },
            executors: {
                executorsNumber: 3,
                list: [
                    {fullName: 'John', isApplying: true, isApplicant: true},
                    {fullName: 'Other Applicant', isApplying: true, isApplicant: true},
                    {fullName: 'Harvey', isApplying: false, isApplicant: true}
                ]
            }
        };
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        it('test correct content is loaded on the page', (done) => {
            const excludeKeys = ['selectAddress'];

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const contentData = {
                        executorName: 'Other Applicant'
                    };

                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(1);
                    testWrapper.testContent(done, excludeKeys, contentData);
                });

        });

        it('should return error when addressLine1 is over 150 characters', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        addressLine1: '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
                        postTown: 'value',
                        newPostCode: 'value'
                    };
                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(1);
                    testWrapper.testErrors(done, data, 'invalid', ['addressLine1']);
                });
        });

        it('should return error when addressLine1 is less than 2 characters', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        addressLine1: '1',
                        postTown: 'value',
                        newPostCode: 'value'
                    };
                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(1);
                    testWrapper.testErrors(done, data, 'invalid', ['addressLine1']);
                });
        });

        it('should return error when postTown is over 50 characters', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        addressLine1: 'value',
                        postTown: '123456789012345678901234567890123456789012345678901',
                        newPostCode: 'value'
                    };
                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(1);
                    testWrapper.testErrors(done, data, 'invalid', ['postTown']);
                });
        });

        it('should return error when postTown is less than 2 characters', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        addressLine1: 'value',
                        postTown: '1',
                        newPostCode: 'value'
                    };
                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(1);
                    testWrapper.testErrors(done, data, 'invalid', ['postTown']);
                });
        });

        it('should return error when newPostCode is over 14 characters', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        addressLine1: 'value',
                        postTown: 'value',
                        newPostCode: '012345678912345'
                    };
                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(1);
                    testWrapper.testErrors(done, data, 'invalid', ['newPostCode']);
                });
        });

        it('should return error when newPostCode is less than 2 characters', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        addressLine1: 'value',
                        postTown: 'value',
                        newPostCode: '0'
                    };
                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(1);
                    testWrapper.testErrors(done, data, 'invalid', ['newPostCode']);
                });
        });

        it('test address schema validation when address search is unsuccessful', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {};
                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(1);
                    testWrapper.testErrors(done, data, 'required', ['addressLine1']);
                });
        });

        it(`test it redirects to next page: ${expectedNextUrlForTaskList}`, (done) => {
            sessionData = {
                applicant: {
                    firstName: 'Lead',
                    lastName: 'Applicant'
                },
                executors: {
                    executorsNumber: 3,
                    list: [
                        {fullName: 'John', isApplying: true, isApplicant: true},
                        {fullName: 'Other Applicant', isApplying: true, isApplicant: true},
                        {fullName: 'Harvey', isApplying: true, isApplicant: true}
                    ]
                },

            };
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        index: 2,
                        addressLine1: 'line1',
                        postTown: 'town',
                        newPostCode: 'postCode',
                    };
                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(2);
                    testWrapper.testRedirect(done, data, expectedNextUrlForTaskList);
                });
        });

        it(`test it redirects to Executors Role step: ${expectedNextUrlForExecRoles}`, (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        index: 2,
                        addressLine1: 'line1',
                        postTown: 'town',
                        newPostCode: 'postCode',
                    };
                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(2);
                    testWrapper.testRedirect(done, data, expectedNextUrlForExecRoles);
                });
        });

        it(`test it redirects to Executor Contact Details step: ${expectedNextUrlForExecContactDetails}`, (done) => {
            sessionData = {
                applicant: {
                    firstName: 'Lead',
                    lastName: 'Applicant'
                },
                executors: {
                    executorsNumber: 3,
                    list: [
                        {fullName: 'John', isApplying: true, isApplicant: true},
                        {fullName: 'Other Applicant', isApplying: true, isApplicant: true},
                        {fullName: 'Harvey', isApplying: true, isApplicant: true}
                    ]
                }
            };
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        index: 1,
                        addressLine1: 'line1',
                        postTown: 'town',
                        newPostCode: 'postCode',
                    };
                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(1);
                    testWrapper.testRedirect(done, data, expectedNextUrlForExecContactDetails);
                });
        });
    });
});
