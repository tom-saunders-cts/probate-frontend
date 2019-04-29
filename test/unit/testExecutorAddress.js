/* eslint max-lines: ["error", 500] */

const initSteps = require('app/core/initSteps');
const expect = require('chai').expect;
const ExecutorsWrapper = require('app/wrappers/Executors');
const steps = initSteps([__dirname + '/../../app/steps/action/', __dirname + '/../../app/steps/ui']);
const ExecutorAddress = steps.ExecutorAddress;
const executorAddressPath = '/executor-address/';
const journey = require('app/journeys/probate');

describe('ExecutorAddress', () => {

    describe('getUrl()', () => {
        it('returns the url with a * param when no index is given', (done) => {
            const url = ExecutorAddress.constructor.getUrl();

            expect(url).to.equal(`${executorAddressPath}*`);
            done();
        });

        it('returns the url with the index as a param when an index is given', (done) => {
            const param = 1;
            const url = ExecutorAddress.constructor.getUrl(param);

            expect(url).to.equal(executorAddressPath + param);
            done();
        });
    });

    describe('getContextData()', () => {
        it('sets the index and indexPosition when there is a numeric url param', (done) => {
            const req = {
                session: {
                    form: {
                        executors: {
                            list: []
                        }
                    }
                },
                params: [1]
            };
            const ctx = ExecutorAddress.getContextData(req);

            expect(ctx.index).to.equal(req.params[0]);
            expect(req.session.indexPosition).to.equal(req.params[0]);
            done();
        });

        it('sets the index to the indexPosition when there is a * url param', (done) => {
            const req = {
                session: {
                    form: {
                        executors: {
                            list: []
                        }
                    },
                    indexPosition: 1
                },
                params: ['*']
            };
            const ctx = ExecutorAddress.getContextData(req);

            expect(ctx.index).to.equal(req.session.indexPosition);
            done();
        });

        it('sets the index to the recalculated index when the req.path starts with the path', (done) => {
            const req = {
                session: {
                    form: {
                        executors: {
                            list: [
                                {isApplying: true},
                                {isApplying: true}
                            ]
                        }
                    }
                },
                path: executorAddressPath
            };
            const ctx = ExecutorAddress.getContextData(req);

            expect(ctx.index).to.equal(1);
            done();
        });

        it('sets otherExecName and ExecutorsWrapper', (done) => {
            const req = {
                session: {
                    form: {
                        executors: {
                            list: [
                                {fullName: 'executor full name'}
                            ],
                            index: 0
                        }
                    }
                }
            };
            const executors = req.session.form.executors;
            const ctx = ExecutorAddress.getContextData(req);

            expect(ctx.otherExecName).to.equal(executors.list[0].fullName);
            expect(ctx.executorsWrapper).to.be.instanceOf(ExecutorsWrapper);
            done();
        });
    });

    describe('handleGet()', () => {
        it('sets the address to address of list', (done) => {
            const testCtx = {
                list: [{
                    address: {
                        addressLine1: 'line1',
                        addressLine2: 'line2',
                        addressLine3: 'line3',
                        postTown: 'town',
                        county: 'county',
                        newPostCode: 'postcode',
                        country: 'country'
                    },
                }],
                index: 0,
                errors: []
            };
            const [ctx, errors] = ExecutorAddress.handleGet(testCtx);

            expect(ctx.address).to.equal(testCtx.list[0].address);
            expect(errors).to.deep.equal(testCtx.errors);
            done();
        });

        it('sets the postcode when postcode exists', (done) => {
            const testCtx = {
                list: [{
                    address: 'the address',
                    postcode: 'the postcode'
                }],
                index: 0,
                errors: []
            };
            const [ctx, errors] = ExecutorAddress.handleGet(testCtx);

            expect(ctx.postcode).to.equal(testCtx.list[0].postcode);
            expect(errors).to.deep.equal(testCtx.errors);
            done();
        });

        it('does not set an address when address does not exist', (done) => {
            const testCtx = {
                list: [{}],
                index: 0,
                errors: []
            };
            const [ctx, errors] = ExecutorAddress.handleGet(testCtx);

            expect(ctx).to.deep.equal(testCtx);
            expect(errors).to.deep.equal(testCtx.errors);
            done();
        });
    });

    describe('handlePost()', () => {
        let testCtx;
        let testErrors;

        beforeEach(() => {
            testCtx = {
                list: [{
                    isApplying: true
                }, {
                    isApplying: true
                }],
                index: 0,
                executorsWrapper: new ExecutorsWrapper(),
                addressLine1: 'line1',
                addressLine2: 'line2',
                addressLine3: 'line3',
                postTown: 'town',
                county: 'county',
                newPostCode: 'postcode',
                country: 'country',
                addresses: ['displayAddress1', 'displayAddress2'],
                postcode: 'the postcode'
            };
            testErrors = [];
        });

        it('returns the correct data and errors', (done) => {
            const [ctx, errors] = ExecutorAddress.handlePost(testCtx, testErrors);

            expect(ctx.list[0]).to.deep.equal({
                isApplying: true,
                postcode: testCtx.postcode.toUpperCase(),
                address: {
                    addressLine1: 'line1',
                    addressLine2: 'line2',
                    addressLine3: 'line3',
                    formattedAddress: 'line1 line2 line3 town postcode county country ',
                    postTown: 'town',
                    county: 'county',
                    postCode: 'postcode',
                    country: 'country'
                },
                addresses: ['displayAddress1', 'displayAddress2']
            });
            expect(errors).to.deep.equal(testErrors);
            done();
        });

        it('sets allExecsApplying if there are multiple executors', (done) => {
            testCtx.index = 1;
            const [ctx, errors] = ExecutorAddress.handlePost(testCtx, testErrors);
            expect(errors).to.deep.equal(testErrors);

            expect(ctx.allExecsApplying).to.equal(true);
            done();
        });
    });

    describe('recalcIndex()', () => {
        it('returns the index when an executor can be found', (done) => {
            const testCtx = {
                list: [
                    {isApplying: true},
                    {isDead: true},
                    {isApplying: true}
                ]
            };
            const index = ExecutorAddress.recalcIndex(testCtx, 0);

            expect(index).to.equal(2);
            done();
        });

        it('returns -1 when an executor cannot be found', (done) => {
            const testCtx = {
                list: []
            };
            const index = ExecutorAddress.recalcIndex(testCtx, 0);

            expect(index).to.equal(-1);
            done();
        });
    });

    describe('nextStepUrl()', () => {
        it('returns the correct url without an index if there is one executor applying', (done) => {
            const req = {
                session: {
                    journey: journey
                }
            };
            const testCtx = {
                list: [{}, {}],
                index: -1,
                executorsWrapper: new ExecutorsWrapper(this.list)
            };
            const url = ExecutorAddress.nextStepUrl(req, testCtx);

            expect(url).to.equal('/tasklist');
            done();
        });

        it('returns the correct url with an index if there are multiple executors applying', (done) => {
            const req = {
                session: {
                    journey: journey
                }
            };
            const testCtx = {
                list: [{}, {}],
                index: 1,
                executorsWrapper: new ExecutorsWrapper(this.list)
            };
            const url = ExecutorAddress.nextStepUrl(req, testCtx);

            expect(url).to.equal('/executor-contact-details/1');
            done();
        });
    });

    describe('nextStepOptions()', () => {
        it('returns the next step options', (done) => {
            const testCtx = {
                index: 1,
                executorsWrapper: new ExecutorsWrapper()
            };
            const nextStepOptions = ExecutorAddress.nextStepOptions(testCtx);

            expect(nextStepOptions).to.deep.equal({
                options: [
                    {key: 'continue', value: true, choice: 'continue'},
                    {key: 'allExecsApplying', value: true, choice: 'allExecsApplying'}
                ],
            });
            done();
        });
    });

    describe('action()', () => {
        it('removes the correct values from the context', (done) => {
            const testCtx = {
                otherExecName: 'James Miller',
                address: '1 Red Street, London, L1 1LL',
                postcode: 'L1 1LL',
                allExecsApplying: true,
                continue: true,
                index: 0,
                executorsWrapper: new ExecutorsWrapper()
            };
            const testFormdata = {};
            const action = ExecutorAddress.action(testCtx, testFormdata);

            expect(action).to.deep.equal([{}, testFormdata]);
            done();
        });
    });

    describe('isComplete()', () => {
        let executorsList;

        beforeEach(() => {
            executorsList = [{
                isApplying: true
            }, {
                isApplying: true,
                email: 'james.miller@example.com',
                mobile: '07909123456',
                address: '1 Red Street, London, L1 1LL'
            }];
        });

        it('returns true if all the applying executors excluding the main applicant have an email, mobile and address', (done) => {
            const testCtx = {
                list: executorsList,
                executorsWrapper: new ExecutorsWrapper()
            };
            const isComplete = ExecutorAddress.isComplete(testCtx);

            expect(isComplete).to.deep.equal([true, 'inProgress']);
            done();
        });

        it('returns true if there is one executor applying (the main applicant)', (done) => {
            executorsList = [{isApplying: true}];
            const testCtx = {
                list: executorsList,
                executorsWrapper: new ExecutorsWrapper()
            };
            const isComplete = ExecutorAddress.isComplete(testCtx);

            expect(isComplete).to.deep.equal([true, 'inProgress']);
            done();
        });

        it('returns false if not all the applying executors excluding the main applicant have an email, mobile and address', (done) => {
            executorsList.push({isApplying: true});
            const testCtx = {
                list: executorsList,
                executorsWrapper: new ExecutorsWrapper({list: executorsList})
            };
            const isComplete = ExecutorAddress.isComplete(testCtx);

            expect(isComplete).to.deep.equal([false, 'inProgress']);
            done();
        });
    });
});
