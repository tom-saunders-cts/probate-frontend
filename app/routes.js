'use strict';

const config = require('app/config');
const router = require('express').Router();
const initSteps = require('app/core/initSteps');
const services = require('app/components/services');
const logger = require('app/components/logger');
const {get, includes, isEqual} = require('lodash');
const commonContent = require('app/resources/en/translation/common');
const ExecutorsWrapper = require('app/wrappers/Executors');
const featureToggles = require('app/featureToggles');
const pdfservices = require('app/components/pdf-services');

router.all('*', (req, res, next) => {

    req.log = logger(req.sessionID);
    req.log.info(`Processing ${req.method} for ${req.originalUrl}`);
    next();
});

router.use((req, res, next) => {
    if (!req.session.form) {
        req.session.form = {
            payloadVersion: config.payloadVersion,
            applicantEmail: req.session.regId
        };
        req.session.back = [];
    }

    if (!req.session.form.applicantEmail) {
        req.session.form.applicantEmail = req.session.regId;
    }

    next();
});

router.get('/', (req, res) => {
    services.loadFormData(req.session.regId)
        .then(result => {
            if (result.name === 'Error') {
                req.log.debug('Failed to load user data');
                req.log.info({tags: 'Analytics'}, 'Application Started');
            } else {
                req.log.debug('Successfully loaded user data');
                req.session.form = result.formdata;
            }
            res.redirect('tasklist');
        });
});

router.use((req, res, next) => {
    const formdata = req.session.form;
    const isHardStop = formdata => config.hardStopParams.some(param => get(formdata, param) === commonContent.no);
    const executorsWrapper = new ExecutorsWrapper(formdata.executors);
    const hasMultipleApplicants = executorsWrapper.hasMultipleApplicants();

    if (get(formdata, 'submissionReference') && get(formdata, 'ccdCase.state') === 'CaseCreated' && (get(formdata, 'payment.status') === 'Success' || get(formdata, 'payment.status') === 'not_required') &&
        !includes(config.whitelistedPagesAfterSubmission, req.originalUrl)
    ) {
        res.redirect('documents');
    } else if (formdata.paymentPending === 'false' &&
        !includes(config.whitelistedPagesAfterPayment, req.originalUrl)
    ) {
        res.redirect('tasklist');
    } else if (get(formdata, 'declaration.declarationCheckbox') &&
        !includes(config.whitelistedPagesAfterDeclaration, req.originalUrl) &&
            (!hasMultipleApplicants || (get(formdata, 'executors.invitesSent') && req.session.haveAllExecutorsDeclared === 'true'))
    ) {
        res.redirect('tasklist');
    } else if (get(formdata, 'declaration.declarationCheckbox') &&
        (!hasMultipleApplicants || (get(formdata, 'executors.invitesSent'))) &&
            isEqual('/executors-invite', req.originalUrl)
    ) {
        res.redirect('tasklist');
    } else if (get(formdata, 'declaration.declarationCheckbox') &&
        (!hasMultipleApplicants || !(get(formdata, 'executors.executorsEmailChanged'))) &&
            isEqual('/executors-update-invite', req.originalUrl)
    ) {
        res.redirect('tasklist');
    } else if (req.originalUrl.includes('summary') && isHardStop(formdata)) {
        res.redirect('/tasklist');
    } else {
        next();
    }
});

router.use(featureToggles);

router.post('/upload-document', (req, res) => {
    services.uploadDocument(req.session.id);
    res.send('File uploaded successfully');
});

router.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.pageUrl = req.url;
    next();
});

router.use((req, res, next) => {
    const formdata = req.session.form;
    const hasMultipleApplicants = (new ExecutorsWrapper(formdata.executors)).hasMultipleApplicants();

    if (hasMultipleApplicants &&
        formdata.executors.invitesSent === 'true' &&
        get(formdata, 'declaration.declarationCheckbox')
    ) {
        services.checkAllAgreed(req.session.regId)
            .then(data => {
                req.session.haveAllExecutorsDeclared = data;
                next();
            })
            .catch(err => {
                next(err);
            });
    } else {
        next();
    }
});

const steps = initSteps([`${__dirname}/steps/action/`, `${__dirname}/steps/ui/`]);

Object.entries(steps).forEach(([, step]) => {
    router.get(step.constructor.getUrl(), step.runner().GET(step));
    router.post(step.constructor.getUrl(), step.runner().POST(step));
});

router.get('/payment', (req, res) => {
    res.redirect(301, '/documents');
});

router.get('/check-answers-pdf', (req, res) => {
    const formdata = req.session.form;
    pdfservices.createCheckAnswersPdf(formdata, req.session.id)
        .then(result => {
            setPDFHeadingValuesAndSend(res, result, 'checkYourAnswers.pdf');
        })
        .catch(err => {
            throwPDFException(req, res, err);
        });
});

function setPDFHeadingValuesAndSend(res, result, filename) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.send(result);
}

function throwPDFException(req, res, err) {
    req.log.error(err);
    res.status(500).render('errors/500', {common: commonContent});
}

if (['sandbox', 'saat', 'preview', 'sprod', 'demo', 'aat'].includes(config.environment)) {
    router.get('/inviteIdList', (req, res) => {
        const formdata = req.session.form;
        const executorsWrapper = new ExecutorsWrapper(formdata.executors);
        res.setHeader('Content-Type', 'text/plain');
        res.send({'ids': executorsWrapper.executorsInvited().map(e => e.inviteId)});
    });

    router.get('/pin', (req, res) => {
        const pin = get(req, 'session.pin', 0);
        res.setHeader('Content-Type', 'text/plain');
        res.send({'pin': pin});
    });
}

module.exports = router;
