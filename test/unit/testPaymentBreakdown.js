// eslint-disable-line max-lines

'use strict';

const initSteps = require('app/core/initSteps');
const {expect} = require('chai');
const co = require('co');
const submitResponse = require('test/data/send-to-submit-service');
const journey = require('app/journeys/probate');
const rewire = require('rewire');
const PaymentBreakdown = rewire('app/steps/ui/payment/breakdown/index');
const config = require('app/config');
const nock = require('nock');
const sinon = require('sinon');

describe('PaymentBreakdown', () => {
    const steps = initSteps([`${__dirname}/../../app/steps/action/`, `${__dirname}/../../app/steps/ui`]);
    const section = 'paymentBreakdown';
    const templatePath = 'payment/breakdown';
    const i18next = {};
    const schema = {
        $schema: 'http://json-schema.org/draft-04/schema#',
        properties: {}
    };

    describe('handlePost', () => {
        const successfulPaymentResponse = {
            channel: 'Online',
            id: 12345,
            reference: 'PaymentReference12345',
            amount: 5000,
            status: 'Success',
            date_updated: '2018-08-29T15:25:11.920+0000',
            site_id: 'siteId0001',
            external_reference: 12345
        };
        const initiatedPaymentResponse = {
            channel: 'Online',
            id: 12345,
            reference: 'PaymentReference12345',
            amount: 5000,
            status: 'Initiated',
            date_updated: '2018-08-29T15:25:11.920+0000',
            site_id: 'siteId0001',
            external_reference: 12345
        };
        let revertAuthorise;
        let expectedFormdata;
        let hostname;
        let ctxTestData;
        let errorsTestData;
        let session;

        beforeEach(() => {
            expectedFormdata = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'PaAppCreated'
                },
                creatingPayment: 'true',
                payment: {
                    total: 215
                },
                fees: {
                    status: 'success',
                    applicationfee: 215,
                    applicationvalue: 6000,
                    ukcopies: 1,
                    ukcopiesfee: 0.50,
                    overseascopies: 2,
                    overseascopiesfee: 1,
                    total: 216.50
                },
                paymentPending: 'true',
                registry: {
                    registry: {
                        address: 'Line 1 Ox\nLine 2 Ox\nLine 3 Ox\nPostCode Ox\n',
                        email: 'oxford@email.com',
                        name: 'Oxford',
                        sequenceNumber: 10034
                    },
                    submissionReference: 97
                },
                submissionReference: 97
            };
            hostname = 'localhost';
            ctxTestData = {
                total: 215
            };
            errorsTestData = [];
            session = {
                save: () => true
            };
            revertAuthorise = PaymentBreakdown.__set__({
                Authorise: class {
                    post() {
                        return Promise.resolve({name: 'Success'});
                    }
                }
            });

            nock(config.services.submit.url)
                .post('/submit')
                .reply(200, submitResponse);

        });

        afterEach(() => {
            revertAuthorise();
            nock.cleanAll();
        });

        it('sets paymentPending to false if ctx.total = 0', (done) => {
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            let ctx = {};
            let errors = [];
            const formdata = {
                fees: {
                    status: 'success',
                    applicationfee: 0,
                    applicationvalue: 4000,
                    ukcopies: 0,
                    ukcopiesfee: 0,
                    overseascopies: 0,
                    overseascopiesfee: 0,
                    total: 0
                }
            };

            co(function* () {
                [ctx, errors] = yield paymentBreakdown.handlePost(ctx, errors, formdata);
                expect(formdata.paymentPending).to.equal('false');
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('sets nextStepUrl to payment-status if paymentPending is unknown', (done) => {
            const req = {
                session: {
                    journey: journey
                }
            };
            let ctx = {total: 1};
            let errors = [];
            const formdata = {paymentPending: 'unknown'};
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);

            co(function* () {
                [ctx, errors] = yield paymentBreakdown.handlePost(ctx, errors, formdata);
                expect(paymentBreakdown.nextStepUrl(req)).to.equal('/payment-status');
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('sets paymentPending to true if ctx.total > 0', (done) => {
            const formdata = {
                creatingPayment: 'true'
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname);
                expect(formdata).to.deep.equal(expectedFormdata);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(errors).to.deep.equal(errorsTestData);
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('sets paymentPending to true if ctx.total > 0 and createPayment is false', (done) => {
            const revert = PaymentBreakdown.__set__({
                Payment: class {
                    post() {
                        return Promise.resolve([{
                            id: '24',
                            amount: 5000,
                            state: {
                                status: 'success',
                                finished: true
                            },
                            description: 'Probate Payment: 50',
                            reference: 'CODE4$$$Hill4314$$$CODE5$$$CODE2/100',
                            date_created: '2018-08-29T15:25:11.920+0000',
                            _links: {}
                        }, 1234]);
                    }
                }
            });
            const formdata = {
                creatingPayment: 'false'
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedFormdata.creatingPayment = 'false';

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname);
                expect(formdata).to.deep.equal(expectedFormdata);
                expect(errors).to.deep.equal(errorsTestData);
                expect(ctx).to.deep.equal({
                    total: 215,
                    paymentId: 'CODE4$$$Hill4314$$$CODE5$$$CODE2/100',
                    paymentCreatedDate: '2018-08-29T15:25:11.920+0000',
                    paymentReference: 1234
                });
                revert();
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('Returns errror message if ctx.total > 0 and authorise service returns error', (done) => {
            const revert = PaymentBreakdown.__set__({
                Payment: class {
                    post() {
                        return Promise.resolve([{
                            id: '24',
                            amount: 5000,
                            state: {
                                status: 'success',
                                finished: true
                            },
                            description: 'Probate Payment: 50',
                            reference: 'CODE4$$$Hill4314$$$CODE5$$$CODE2/100',
                            date_created: '2018-08-29T15:25:11.920+0000',
                            _links: {}
                        }, 1234]);
                    }
                }
            });
            const formdata = {
                creatingPayment: 'false'
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedFormdata.creatingPayment = 'false';

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname);
                expect(formdata).to.deep.equal(expectedFormdata);
                expect(errors).to.deep.equal(errorsTestData);
                expect(ctx).to.deep.equal({
                    total: 215,
                    paymentId: 'CODE4$$$Hill4314$$$CODE5$$$CODE2/100',
                    paymentReference: 1234,
                    paymentCreatedDate: '2018-08-29T15:25:11.920+0000'
                });
                revert();
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('if sendToSubmitService returns DUPLICATE_SUBMISSION', (done) => {
            const stub = sinon
                .stub(PaymentBreakdown.prototype, 'sendToSubmitService')
                .returns([
                    'DUPLICATE_SUBMISSION',
                    [{
                        param: 'submit',
                        msg: {
                            summary: 'Your application has been submitted, please return to the tasklist to continue',
                            message: 'payment.breakdown.errors.submit.duplicate.message'
                        }
                    }]
                ]);

            const formdata = {
                creatingPayment: 'true'
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname);
                expect(ctx).to.deep.equal({total: 215});
                expect(errors).to.deep.equal([{
                    param: 'submit',
                    msg: {
                        summary: 'Your application has been submitted, please return to the tasklist to continue',
                        message: 'payment.breakdown.errors.submit.duplicate.message'
                    }
                }]);
                stub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('sets paymentPending to true if ctx.total > 0 and payment exists with status of Success', (done) => {
            const revert = PaymentBreakdown.__set__({
                Payment: class {
                    get() {
                        return Promise.resolve(successfulPaymentResponse);
                    }
                }
            });
            const formdata = {
                creatingPayment: 'true',
                payment: {
                    paymentId: 'RC-12345'
                }
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedFormdata.payment.paymentId = 'RC-12345';

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname);
                expect(formdata).to.deep.equal(expectedFormdata);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(errors).to.deep.equal(errorsTestData);
                revert();
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('sets paymentPending to true if ctx.total > 0 and payment exists with status of Initiated', (done) => {
            const revert = PaymentBreakdown.__set__({
                Payment: class {
                    get() {
                        return Promise.resolve(initiatedPaymentResponse);
                    }
                }
            });
            const formdata = {
                creatingPayment: 'true',
                payment: {
                    paymentId: 'RC-12345'
                }
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedFormdata.payment.paymentId = 'RC-12345';

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname);
                expect(formdata).to.deep.equal(expectedFormdata);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(errors).to.deep.equal(errorsTestData);
                revert();
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });

    describe('action', () => {
        it('cleans up context', () => {
            let ctx = {
                _csrf: 'dummyCSRF',
                sessionID: 'dummySessionID',
                authToken: 'dummyAuthToken',
                paymentError: 'dummyError',
                deceasedLastName: 'aName'
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            [ctx] = paymentBreakdown.action(ctx);
            expect(ctx).to.deep.equal({});
        });
    });
});
