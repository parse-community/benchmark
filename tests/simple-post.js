const PORT =  process.env.PORT || 1337;

module.exports = exports = {
  requests: [{
  	path: '/classes/TestObject',
  	method: 'POST',
  	body: '{"testValue": 1}'
  }]
};
