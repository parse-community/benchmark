'use strict';

module.exports = exports = {
  getRequests: () => [{
    path: '/classes/TestObject',
    method: 'POST',
    body: JSON.stringify({ testValue: 1 }),
  }]
};
