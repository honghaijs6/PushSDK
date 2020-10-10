const assert = require('assert');
const app = require('../../src/app');

describe('\'employess\' service', () => {
  it('registered the service', () => {
    const service = app.service('employess');

    assert.ok(service, 'Registered the service');
  });
});
