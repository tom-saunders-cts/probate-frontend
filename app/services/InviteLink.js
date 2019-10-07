'use strict';

const Service = require('./Service');

class InviteLink extends Service {
    get(inviteId) {
        this.log('Get invite link');
        const url = this.formatUrl.format(this.endpoint, `/invite/data/${inviteId}`);
        const fetchOptions = this.fetchOptions({}, 'GET', {});
        return this.fetchJson(url, fetchOptions);
    }

    post(data, authToken, serviceAuthorization) {
        this.log('Post invite link');
        const url = this.formatUrl.format(this.endpoint, '/invite');
        const headers = {
            'Content-Type': 'application/json',
            'Session-Id': this.sessionId,
            'Authorization': authToken,
            'ServiceAuthorization': serviceAuthorization
        };
        const fetchOptions = this.fetchOptions(data, 'POST', headers);
        return this.fetchJson(url, fetchOptions);
    }

    encodeURLNameParams(invitation) {
        for (const key in invitation) {
            if (key.includes('Name')) {
                invitation[key] = encodeURIComponent(invitation[key]);
            }
        }
        return invitation;
    }
}

module.exports = InviteLink;
