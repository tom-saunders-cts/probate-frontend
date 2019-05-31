'use strict';

const Step = require('app/core/steps/Step');
const FieldError = require('app/components/error');
const config = require('app/config');
const {get, set} = require('lodash');
const logger = require('app/components/logger')('Init');
const ServiceMapper = require('app/utils/ServiceMapper');
const Payment = require('app/services/Payment');
const Authorise = require('app/services/Authorise');
const FeesCalculator = require('app/utils/FeesCalculator');

class PaymentBreakdown extends Step {
    static getUrl() {
        return '/payment-breakdown';
    }

    handleGet(ctx, formdata) {
        const fees = formdata.fees;
        this.checkFeesStatus(fees);

        ctx.copies = this.createCopiesLayout(formdata);
        ctx.applicationFee = fees.applicationfee;
        ctx.total = Number.isInteger(fees.total) ? fees.total : parseFloat(fees.total).toFixed(2);
        return [ctx, ctx.errors];
    }

    checkFeesStatus(fees) {
        if (fees.status !== 'success') {
            throw new Error('Unable to calculate fees from Fees Api');
        }
    }

    createCopiesLayout(formdata) {
        const ukCopies = formdata.fees.ukcopies;
        const overseasCopies = formdata.fees.overseascopies;
        return {
            uk: {number: ukCopies, cost: formdata.fees.ukcopiesfee},
            overseas: {number: overseasCopies, cost: formdata.fees.overseascopiesfee},
        };
    }

    getContextData(req) {
        const ctx = super.getContextData(req);
        const formdata = req.session.form;

        ctx.authToken = req.authToken;
        ctx.userId = req.userId;
        ctx.deceasedLastName = get(formdata.deceased, 'lastName', '');
        ctx.paymentError = get(req, 'query.status');
        return ctx;
    }

    * handlePost(ctx, errors, formdata, session, hostname) {
        try {
            const feesCalculator = new FeesCalculator(config.services.feesRegister.url, ctx.sessionID);
            const confirmFees = yield feesCalculator.calc(formdata, ctx.authToken);
            this.checkFeesStatus(confirmFees);
            const originalFees = formdata.fees;
            if (confirmFees.total !== originalFees.total) {
                throw new Error(`Error calculated fees totals have changed from ${originalFees.total} to ${confirmFees.total}`);
            }
            ctx.total = originalFees.total;
            ctx.applicationFee = originalFees.applicationfee;
            ctx.copies = this.createCopiesLayout(formdata);

            const authorise = new Authorise(config.services.idam.s2s_url, ctx.sessionID);
            const serviceAuthResult = yield authorise.post();
            if (serviceAuthResult.name === 'Error') {
                logger.info(`serviceAuthResult Error = ${serviceAuthResult}`);
                const keyword = 'failure';
                errors.push(FieldError('authorisation', keyword, this.resourcePath, ctx));
                return [ctx, errors];
            }

            const [canCreatePayment, paymentStatus] = yield this.canCreatePayment(ctx, formdata, serviceAuthResult);
            logger.info(`canCreatePayment result = ${canCreatePayment} with status ${paymentStatus}`);
            if (paymentStatus === 'Initiated') {
                const paymentCreateServiceUrl = config.services.payment.url + config.services.payment.paths.createPayment;
                const payment = new Payment(paymentCreateServiceUrl, ctx.sessionID);
                const data = {
                    authToken: ctx.authToken,
                    serviceAuthToken: serviceAuthResult,
                    userId: ctx.userId,
                    paymentId: ctx.reference
                };
                const getPaymentResponse = yield payment.get(data);
                logger.info('Checking status of reference = ' + ctx.reference + ' with response = ' + getPaymentResponse.status);
                if (getPaymentResponse.status === 'Initiated') {
                    logger.error('As payment is still Initiated, user will need to wait for this state to expire.');
                    errors.push(FieldError('payment', 'initiated', this.resourcePath, ctx));
                    return [ctx, errors];
                }
            }

            if (typeof get(formdata, 'ccdCase.id') === 'undefined') {
                const [result, submissionErrors] = yield this.sendToSubmitService(ctx, errors, formdata, ctx.total);
                errors = errors.concat(submissionErrors);
                if (errors.length > 0) {
                    logger.error('Failed to create case in CCD.', errors);
                    return [ctx, errors];
                }
                formdata.registry = result.registry;
                set(formdata, 'ccdCase.id', result.caseId);
                set(formdata, 'ccdCase.state', result.caseState);
            }

            if (ctx.total > 0 && canCreatePayment) {
                session.save();

                const serviceAuthResult = yield authorise.post();
                if (serviceAuthResult.name === 'Error') {
                    logger.info(`serviceAuthResult Error = ${serviceAuthResult}`);
                    const keyword = 'failure';
                    errors.push(FieldError('authorisation', keyword, this.resourcePath, ctx));
                    return [ctx, errors];
                }

                const data = {
                    amount: parseFloat(ctx.total),
                    authToken: ctx.authToken,
                    serviceAuthToken: serviceAuthResult,
                    userId: ctx.userId,
                    applicationFee: ctx.applicationFee,
                    copies: ctx.copies,
                    deceasedLastName: ctx.deceasedLastName,
                    ccdCaseId: formdata.ccdCase.id
                };

                const paymentCreateServiceUrl = config.services.payment.url + config.services.payment.paths.createPayment;
                const payment = new Payment(paymentCreateServiceUrl, ctx.sessionID);
                const [response] = yield payment.post(data, hostname);
                logger.info(`Payment creation in breakdown for ccdCaseId = ${formdata.ccdCase.id} with response = ${JSON.stringify(response)}`);
                if (response.name === 'Error') {
                    errors.push(FieldError('payment', 'failure', this.resourcePath, ctx));
                    return [ctx, errors];
                }
                set(formdata, 'payment.reference', response.reference);
                ctx.reference = response.reference;
                ctx.paymentCreatedDate = response.date_created;

                this.nextStepUrl = () => response._links.next_url.href;
            } else {
                delete this.nextStepUrl;
            }
            return [ctx, errors];
        } finally {
            this.unlockPayment(session);
        }
    }

    isComplete(ctx, formdata) {
        return [typeof get(formdata, 'ccdCase.id') !== 'undefined' && (get(formdata, 'payment.total') === 0 || typeof get(formdata, 'payment.reference') !== 'undefined'), 'inProgress'];
    }

    * sendToSubmitService(ctx, errors, formdata, total) {
        const softStop = this.anySoftStops(formdata, ctx) ? 'softStop' : false;
        set(formdata, 'payment.total', total);
        const submitData = ServiceMapper.map(
            'SubmitData',
            [config.services.submit.url, ctx.sessionID],
            ctx.journeyType
        );
        const result = yield submitData.post(formdata, ctx, softStop);
        logger.info(`submitData.post result = ${JSON.stringify(result)}`);

        if (result.name === 'Error') {
            errors.push(FieldError('submit', 'failure', this.resourcePath, ctx));
        }

        logger.info({tags: 'Analytics'}, 'Application Case Created');

        return [result, errors];
    }

    action(ctx, formdata) {
        super.action(ctx, formdata);
        delete ctx.authToken;
        delete ctx.paymentError;
        delete ctx.deceasedLastName;
        return [ctx, formdata];
    }

    * canCreatePayment(ctx, formdata, serviceAuthResult) {
        const paymentReference = get(formdata, 'payment.reference');
        const caseId = get(formdata, 'ccdCase.id');
        let paymentStatus;
        let canMakePayment = true;
        if (caseId) {
            const data = {
                authToken: ctx.authToken,
                serviceAuthToken: serviceAuthResult,
                userId: ctx.userId,
                caseId: caseId
            };
            const paymentServiceUrl = config.services.payment.url + config.services.payment.paths.payments;
            const payment = new Payment(paymentServiceUrl, ctx.sessionID);
            const casePaymentsArray = yield payment.getCasePayments(data);
            logger.debug(`Case payments for ${caseId} with response = ${JSON.stringify(casePaymentsArray)}`);
            const paymentResponse = payment.identifySuccessfulOrInitiatedPayment(casePaymentsArray);
            logger.debug(`Payment retrieval in breakdown for caseId = ${caseId} with response = ${JSON.stringify(paymentResponse)}`);
            if (!paymentResponse) {
                logger.info('No payments of Initiated or Success found for case.');
            } else if (paymentResponse.status === 'Initiated' || paymentResponse.status === 'Success') {
                paymentStatus = paymentResponse.status;
                if (paymentResponse.payment_reference !== paymentReference) {
                    logger.info(`Payment with status ${paymentResponse.status} found, using reference ${paymentResponse.payment_reference}.`);
                    set(formdata, 'payment.reference', paymentResponse.payment_reference);
                    ctx.reference = paymentResponse.payment_reference;
                    ctx.paymentCreatedDate = paymentResponse.date_created;
                }
                canMakePayment = false;
            }
        }
        return [canMakePayment, paymentStatus];
    }

    unlockPayment(session) {
        logger.info('Unlocking payment ' + session.regId);
        session.paymentLock = 'Unlocked';
        session.save();
    }
}

module.exports = PaymentBreakdown;
