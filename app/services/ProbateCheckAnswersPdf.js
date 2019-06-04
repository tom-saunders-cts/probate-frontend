'use strict';

const ProbatePdf = require('./ProbatePdf');

class ProbateCheckAnswersPdf extends ProbatePdf {
    post(req) {
        const pdfTemplate = this.config.pdf.template.checkAnswers;
        const logMessage = 'Post probate check answers pdf';
        return super.post(pdfTemplate, req.session.checkAnswersSummary, logMessage, req);
    }
}

module.exports = ProbateCheckAnswersPdf;
