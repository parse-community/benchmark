jest.mock('autocannon');

const autocannon = require('autocannon');
const httpBenchmark = require('../src/http-benchmark');

const data = {
  requests: { average: 5 },
  latency: { average: 1.5, max: 2 },
  throughput: { average: 130000000, max: 200000000 },
  cpu: 93.75,
  memory: 120000000,
};

describe('http-benchmark', () => {
  beforeEach(() => {
    jest.restoreAllMocks();

    autocannon.setResult(null);
    autocannon.setError(null);
  });

  it('run', async () => {
    autocannon.setResult(data);
    const result = await httpBenchmark.run();
    expect(result).toEqual(data);
  });

  it('run should reject', async () => {
    autocannon.setError('error here');
    try {
      await httpBenchmark.run();
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBe('error here');
    }
  });

  it('run enable track', async () => {
    autocannon.setResult(data);
    jest.spyOn(autocannon, 'track');

    await httpBenchmark.run({}, true);
    expect(autocannon.track).toHaveBeenCalled();
  });

  it('run enable track DEBUG=1', async () => {
    const tempDebug = process.env.DEBUG;
    process.env.DEBUG = 1;

    autocannon.setResult(data);
    jest.spyOn(autocannon, 'track');

    httpBenchmark.run({}, false).then(() => {
      process.env.DEBUG = tempDebug;
      expect(autocannon.track).toHaveBeenCalled();
    });
  });
});
