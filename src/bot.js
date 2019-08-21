const ProcessQueue = require('./process-queue');

module.exports = app => {
  const queue = ProcessQueue(app);

  app.log('Bot was loaded!');
  app.on('pull_request.closed', context => {
    const pr = context.payload.pull_request;
    if (pr.merged_at) {
      queue.spawn('npm', ['run', 'benchmarks'], {
        stdio: 'inherit',
        env: Object.assign({
          SHA1: pr.merge_commit_sha,
        }, process.env),
      });
    }
  });
  return queue;
};
