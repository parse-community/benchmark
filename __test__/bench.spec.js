jest.mock('ora');
jest.mock('pidusage');
jest.mock('../src/http-benchmark');
jest.mock('../src/utils');

const { TestUtils } = require('parse-server');
const httpBenchmark = require('../src/http-benchmark');
const bench = require('../src/bench');
const utils = require('../src/utils');
const spinner = require('ora');

const data = [{
  'mongo get': {
    requests: { average: 5 },
    latency: { average: 1.5, max: 2 },
    throughput: { average: 130000000, max: 200000000 },
    cpu: 93.75,
    memory: 120000000,
  }
}];

describe('bench', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    spinner.mockReturnValue({
      start: () => {
        return {
          fail: () => {},
          succeed: () => {},
        };
      },
    });
  });

  it('start', async () => {
    jest.spyOn(httpBenchmark, 'run').mockImplementation(() => data[0]['mongo get']);

    const opts = { output: 'test.json' };
    await bench.start(opts, ['mongo'], ['get']);
    expect(utils.cliTable).toHaveBeenCalled();
    expect(utils.saveToFile).toHaveBeenCalledWith('test.json', data);
  });

  it('start with index greater than 1', async () => {
    jest.spyOn(httpBenchmark, 'run').mockImplementation(() => data[0]['mongo get']);

    const opts = { output: 'test.json' };
    await bench.start(opts, ['mongo'], ['get'], [], 1);
    expect(utils.cliTable).toHaveBeenCalled();
    expect(utils.saveToFile).toHaveBeenCalledWith('test.json', []);
  });

  it('start should catch error', async () => {
    jest.spyOn(utils, 'cliTable').mockImplementation(() => { throw 'error here'; });
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const opts = { output: 'test.json' };
    await bench.start(opts, [], [], 0);
    expect(console.error).toHaveBeenCalledWith('error here');
  });

  it('runTest', (done) => {
    jest.spyOn(httpBenchmark, 'run').mockImplementation(() => data[0]['mongo get']);
    const opts = { output: 'test.json' };
    bench.runTest(opts, 'mongo', ['get']).then((results) => {
      expect(results).toEqual(data);
      done();
    });
  });

  it('runTest should clear database CLEAR=1', (done) => {
    jest.spyOn(TestUtils, 'destroyAllDataPermanently').mockImplementation(() => {});
    const tempClear = process.env.CLEAR;
    const tempTest = process.env.TESTING;
    process.env.CLEAR = 1;
    process.env.TESTING = 1;
    bench.runTest({}, 'mongo', ['get']).then(() => {
      expect(TestUtils.destroyAllDataPermanently).toHaveBeenCalled();
      done();
    });
    process.env.CLEAR = tempClear;
    process.env.TESTING = tempTest;
  });

  it('runTest should print error', async (done) => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(httpBenchmark, 'run').mockImplementation(() => { throw 'error here'; });
    const opts = { output: 'test.json' };
    bench.runTest(opts, 'mongo', ['get']).then(() => {
      expect(console.error).toHaveBeenCalledWith('error here');
      done();
    });
  });
});
