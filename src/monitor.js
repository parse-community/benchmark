/* Not Used */
function monitor () {
  this.t0 = process.hrtime();
  this.m0 = process.memoryUsage();
  this.c0 = process.cpuUsage();
  this.stop = function(name) {
    const m1 = process.memoryUsage();
    const diffCPU  = process.cpuUsage(this.c0);
    const diffTime = process.hrtime(this.t0);
    const timeMS = secNSec2ms(diffTime);

    const ram = m1['rss'] - this.m0['rss'];
    const heapTotal = m1['heapTotal'] - this.m0['heapTotal'];
    const heapUsed = m1['heapUsed'] - this.m0['heapUsed'];
    const cpu = (diffCPU.user + diffCPU.system) / timeMS;

    if (process.env.DEBUG) {
      console.log('Test       : ', name);
      console.log('RAM        : ', ram);
      console.log('HeapTotal  : ', heapTotal);
      console.log('HeapUsed   : ', heapUsed);
      console.log('CPU        : ', cpu, '%');
      console.log('Time       : ', timeMS);
    }
    return {
      ram,
      heapTotal,
      heapUsed,
      cpu,
    };
  };
}

// Convert [second, nanosecond] to milliseconds
function secNSec2ms (secNSec) {
  return secNSec[0] * 1000 + secNSec[1] / 1000000;
}

module.exports = monitor;
