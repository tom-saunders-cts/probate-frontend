'use strict';

const featureToggle = require('app/utils/FeatureToggle');
const Step = require('app/core/steps/Step');
const utils = require('app/components/step-utils');
const ExecutorsWrapper = require('app/wrappers/Executors');

module.exports = class TaskList extends Step {

    static getUrl() {
        return '/tasklist';
    }

    previousTaskStatus(previousTasks) {
        const allPreviousTasksComplete = previousTasks.every(task => task.status === 'complete');
        return allPreviousTasksComplete ? 'complete' : 'started';
    }

    copiesPreviousTaskStatus(session, ctx) {
        if (ctx.hasMultipleApplicants && session.haveAllExecutorsDeclared === 'false') {
            return 'locked';
        }
        if (ctx.isScreeningQuestionsToggleEnabled) {
            return this.previousTaskStatus([ctx.ExecutorsTask, ctx.ReviewAndConfirmTask]);
        } else {
            return this.previousTaskStatus([ctx.EligibilityTask, ctx.ExecutorsTask, ctx.ReviewAndConfirmTask]);
        }
    }

    getContextData(req) {
        const ctx = super.getContextData(req);
        const formdata = req.session.form;
        const executorsWrapper = new ExecutorsWrapper(formdata.executors);
        utils.updateTaskStatus(ctx, req, this.steps);

        ctx.hasMultipleApplicants = executorsWrapper.hasMultipleApplicants();
        ctx.alreadyDeclared = this.alreadyDeclared(req.session);

        if (ctx.isScreeningQuestionsToggleEnabled) {
            ctx.previousTaskStatus = {
                ExecutorsTask: ctx.ExecutorsTask.status,
                ReviewAndConfirmTask: this.previousTaskStatus([ctx.ExecutorsTask]),
                CopiesTask: this.copiesPreviousTaskStatus(req.session, ctx),
                PaymentTask: this.previousTaskStatus([ctx.ExecutorsTask, ctx.ReviewAndConfirmTask, ctx.CopiesTask]),
                DocumentsTask: this.previousTaskStatus([ctx.ExecutorsTask, ctx.ReviewAndConfirmTask, ctx.CopiesTask, ctx.PaymentTask])
            };
        } else {
            ctx.previousTaskStatus = {
                EligibilityTask: ctx.EligibilityTask.status,
                ExecutorsTask: ctx.EligibilityTask.status,
                ReviewAndConfirmTask: this.previousTaskStatus([ctx.EligibilityTask, ctx.ExecutorsTask]),
                CopiesTask: this.copiesPreviousTaskStatus(req.session, ctx),
                PaymentTask: this.previousTaskStatus([ctx.EligibilityTask, ctx.ExecutorsTask, ctx.ReviewAndConfirmTask, ctx.CopiesTask]),
                DocumentsTask: this.previousTaskStatus([ctx.EligibilityTask, ctx.ExecutorsTask, ctx.ReviewAndConfirmTask, ctx.CopiesTask, ctx.PaymentTask])
            };
        }

        return ctx;
    }

    handleGet(ctx, formdata, featureToggles) {
        ctx.isScreeningQuestionsToggleEnabled = featureToggle.isEnabled(featureToggles, 'screening_questions_toggle');

        return [ctx];
    }

    action(ctx, formdata) {
        super.action(ctx, formdata);
        delete ctx.hasMultipleApplicants;
        delete ctx.alreadyDeclared;
        delete ctx.previousTaskStatus;
        delete ctx.isScreeningQuestionsToggleEnabled;
        return [ctx, formdata];
    }
};
