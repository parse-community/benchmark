'use strict';

const Parse = require('../src/parse');

module.exports = {
  getRequests: async () => {
    const object = new Parse.Object('TestObject');
    object.set('foo', 'bar');
    await object.save();

    return [{
      path: `/classes/TestObject/${object.id}`,
      method: 'GET',
    }];
  }
};
