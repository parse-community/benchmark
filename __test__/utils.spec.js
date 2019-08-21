const config = require('../src/config');
const utils = require('../src/utils');
const fs = require('fs');

const data = [{
  'mongo get': {
    requests: { average: 5 },
    latency: { average: 1.5, max: 2 },
    throughput: { average: 130000000, max: 200000000 },
    cpu: 93.75,
    memory: 120000000,
  }
}, {
  'mongo post': {
    requests: { average: 7 },
    latency: { average: 2, max: 2.5 },
    throughput: { average: 140000000, max: 150000000 },
    cpu: 80,
    memory: 160000000,
  }
}];

describe('utils', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('buildOptions', () => {
    const requests = [{ method: 'POST', path: '/classes/TestObject' }];
    const options = utils.buildOptions({}, requests);
    expect(options).toEqual({
      requests,
      url: config.SERVER_URL,
      headers: {
        'cache-control': false,
        'content-type': 'application/json',
        'X-Parse-Application-Id': config.APP_ID,
        'X-Parse-Master-Key': config.MASTER_KEY,
        'X-Parse-REST-API-Key': config.REST_KEY,
        'X-Parse-Javascript-Key': config.JAVASCRIPT_KEY,
      }
    });
  });

  it('cliTable', () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const rows = utils.cliTable(data);
    expect(rows).toEqual([
      ['mongo get', '5.0', '1.50', '123.98', '114 MB', 93.75],
      ['mongo post', '7.0', '2.00', '133.51', '153 MB', 80]
    ]);
    expect(console.log).toHaveBeenCalledTimes(2);
  });

  it('process data field', () => {
    const output = utils.processData(data, 'cpu');
    expect(output).toEqual({ 'mongo get': 93.75, 'mongo post': 80 });
  });

  it('process data field value', () => {
    const output = utils.processData(data, 'requests', 'average');
    expect(output).toEqual({ 'mongo get': 5, 'mongo post': 7 });
  });

  it('saveToFile', () => {
    jest.spyOn(fs, 'writeFileSync');
    utils.saveToFile('output.json', data);

    expect(fs.writeFileSync.mock.calls[0][0]).toBe('output.json');
    const output = JSON.parse(fs.writeFileSync.mock.calls[0][1]);

    delete output.sha1;
    delete output.created_at;
    expect(output).toEqual({
      req_per_second: { 'mongo get': 5, 'mongo post': 7 },
      max_latency: { 'mongo get': 2, 'mongo post': 2.5 },
      avg_latency: { 'mongo get': 1.5, 'mongo post': 2 },
      max_throughput: { 'mongo get': 200000000, 'mongo post': 150000000 },
      avg_throughput: { 'mongo get': 130000000, 'mongo post': 140000000 },
      ram: { 'mongo get': 120000000, 'mongo post': 160000000 },
      cpu: { 'mongo get': 93.75, 'mongo post': 80 },
    });
  });
});
