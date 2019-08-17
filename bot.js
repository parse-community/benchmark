const childProcess = require('child_process');

module.exports = app => {
  app.log('Yay, the app was loaded!');
  app.on('pull_request.closed', async context => {
    const pr = context.payload.pull_request;
    if (pr.merged_at) {
      childProcess.execSync(`SHA1=${pr.merge_commit_sha} npm run release_benchmarks`, { cwd: __dirname, stdio: [0, 1, 2] });
    }
  });
};
