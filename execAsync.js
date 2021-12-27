const child_process = require('child_process');
const chalk = require('chalk');

module.exports = function execAsync(
  command,
  options = { cwd: process.cwd() },
  { hideCmd = false, hideOut = false } = {},
) {
  const { cwd } = options;

  if (!hideCmd) {
    console.log(chalk.cyan('➜', cwd), command);
  }
  const p = new Promise((resolve, reject) => {
    const subprocess = child_process.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
      reject(stderr);
    });
    if (!hideOut) {
      subprocess.stdout.pipe(process.stdout);
      subprocess.stderr.pipe(process.stderr);
    }
  });
  return p;
};
