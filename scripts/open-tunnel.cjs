const { spawn } = require('child_process');
const fs = require('fs');

const OUTPUT_FILE = '/workspace/.tunnel_url';
try { fs.unlinkSync(OUTPUT_FILE); } catch {}

const child = spawn('pnpm', ['dlx', 'localtunnel@latest', '--port', '5173'], { stdio: ['ignore', 'pipe', 'pipe'] });

let urlFound = false;
child.stdout.on('data', (data) => {
  const text = data.toString();
  const match = text.match(/https?:\/\/[^\s]+/);
  if (match && !urlFound) {
    urlFound = true;
    try { fs.writeFileSync(OUTPUT_FILE, match[0]); } catch {}
    process.stdout.write('TUNNEL_URL ' + match[0] + '\n');
  }
  process.stdout.write(text);
});

child.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

child.on('exit', (code) => {
  process.stdout.write(`localtunnel exited with code ${code}\n`);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit(0);
});