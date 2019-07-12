'use strict';

const ServiceMapper = require('app/utils/ServiceMapper');
const config = require('app/config');
const commonContent = require('app/resources/en/translation/common');

const documentDownload = (req, res, service, filename) => {
    const downloadService = ServiceMapper.map(
        service,
        [config.services.orchestrator.url, req.sessionID],
        req.session.form.caseType
    );
    downloadService
        .post(req)
        .then(result => {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-disposition', `attachment; filename=${filename}`);
            res.send(result);
        })
        .catch(err => {
            req.log.error(err);
            res.status(500).render('errors/500', {common: commonContent});
        });
};

module.exports = documentDownload;
