const { spawn } = require('node:child_process');

const isRender = Boolean(process.env.RENDER);
const isProduction = process.env.NODE_ENV === 'production';
const script = isRender || isProduction ? 'start:prod' : 'start:dev:local';
const isWindows = process.platform === 'win32';

const child = spawn(
  isWindows ? `npm run ${script}` : 'npm',
  isWindows ? [] : ['run', script],
  {
    shell: isWindows,
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
