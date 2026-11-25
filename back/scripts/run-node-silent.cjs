// Run Node's entry point in this console-free process; no child can be
// terminated when a short-lived launcher exits. File logs survive watchdog restarts.
const fs = require('node:fs');
const path = require('node:path');
const [mode, outputPath, errorPath, entry, ...args] = process.argv.slice(2);
if (!['build', 'backend'].includes(mode) || !outputPath || !errorPath || !entry) {
  console.error('Invalid silent Node launch arguments');
  process.exit(1);
}
const out = fs.openSync(outputPath, 'w');
const err = errorPath === outputPath ? out : fs.openSync(errorPath, 'w');
function writer(fd) {
  return function write(chunk, encoding, callback) {
    if (typeof encoding === 'function') { callback = encoding; encoding = undefined; }
    if (typeof chunk === 'string') fs.writeSync(fd, chunk, undefined, encoding || 'utf8');
    else fs.writeSync(fd, chunk);
    if (typeof callback === 'function') process.nextTick(callback);
    return true;
  };
}
process.stdout.write = writer(out);
process.stderr.write = writer(err);
process.on('uncaughtExceptionMonitor', error => {
  try { fs.writeSync(err, String(error.stack || error) + '\n'); } catch {}
});
process.argv = [process.execPath, path.resolve(entry), ...args];
require(path.resolve(entry));
