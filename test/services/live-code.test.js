const assert = require('assert');
const app = require('../../src/app');

describe('\'liveCode\' service', () => {
  it('registered the service', () => {
    const service = app.service('live-code');

    assert.ok(service, 'Registered the service');
  });
});
