'use strict';

const taskListContent = require('../../../../app/resources/en/translation/tasklist');
const TestConfigurator = new (require('../../helpers/TestConfigurator'))();

Feature('Intestacy flow');

// eslint complains that the Before/After are not used but they are by codeceptjs
// so we have to tell eslint to not validate these
// eslint-disable-next-line no-undef
Before(() => {
    TestConfigurator.getBefore();
});

// eslint-disable-next-line no-undef
After(() => {
    TestConfigurator.getAfter();
});

Scenario(TestConfigurator.idamInUseText('Intestacy Journey'), function* (I) {

    // Eligibility Task (pre IdAM)
    I.startEligibility();

    I.selectDeathCertificate('No');
    I.seeStopPage('deathCertificate');
    I.selectDeathCertificate('Yes');

    I.selectDeceasedDomicile('No');
    I.seeStopPage('notInEnglandOrWales');
    I.selectDeceasedDomicile('Yes');

    I.selectIhtCompleted('No');
    I.seeStopPage('ihtNotCompleted');
    I.selectIhtCompleted('Yes');

    I.selectPersonWhoDiedLeftAWill('No');

    I.selectDiedAfterOctober2014('No');
    I.seeStopPage('notDiedAfterOctober2014');
    I.selectDiedAfterOctober2014('Yes');

    I.selectRelationshipToDeceased('No');
    I.seeStopPage('notRelated');
    I.selectRelationshipToDeceased('Yes');

    I.selectOtherApplicants('Yes');
    I.seeStopPage('otherApplicants');
    I.selectOtherApplicants('No');

    I.startApply();

    // IdAM
    I.authenticateWithIdamIfAvailable();

    // Deceased Task
    I.selectATask(taskListContent.taskNotStarted);
    I.enterDeceasedDetails('Deceased First Name', 'Deceased Last Name', '01', '01', '1950', '01', '01', '2017');

    // Executors Task
    I.selectATask(taskListContent.taskNotStarted);

}).retry(TestConfigurator.getRetryScenarios());
