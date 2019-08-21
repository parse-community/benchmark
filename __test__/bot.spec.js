const bot = require('../src/bot');
const events = require('events');

jest.mock('../src/process-queue', () => {
  return jest.fn().mockImplementation(function() {
    return {
      spawn: jest.fn(),
    };
  });
});

const mockApp = new events.EventEmitter();
mockApp.log = () => {};

describe('bot', () => {
  it('run on merged pull request', async () => {
    const queue = bot(mockApp);
    const context = {
      payload: {
        pull_request: {
          merged_at: new Date(),
          merge_commit_sha: 'COMMIT_HASH',
        }
      }
    };
    jest.spyOn(queue, 'spawn');
    mockApp.emit('pull_request.closed', context);
    expect(queue.spawn).toHaveBeenCalled();
  });

  it('do not run on closed pull request', async () => {
    const queue = bot(mockApp);
    const context = {
      payload: {
        pull_request: {
          merged_at: null,
          merge_commit_sha: null,
        }
      }
    };
    jest.spyOn(queue, 'spawn');
    mockApp.emit('pull_request.closed', context);
    expect(queue.spawn).not.toHaveBeenCalled();
  });
});
