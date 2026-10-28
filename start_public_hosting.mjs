import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 5000;
const CLOUDFLARED = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'cloudflared.exe');

console.log('🚀 Starting Connecting Tech Production Server...');

// Start Express server
const server = spawn('node', ['server/dist/index.js'], {
  env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
  stdio: 'inherit',
});

// Wait 2 seconds for server to bind
setTimeout(() => {
  console.log(`🌐 Launching Cloudflare Public Tunnel for port ${PORT}...`);
  const tunnel = spawn(CLOUDFLARED, ['tunnel', '--url', `http://localhost:${PORT}`]);

  tunnel.stderr.on('data', (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match) {
      const publicUrl = match[0];
      console.log('\n=============================================================');
      console.log('🎉 YOUR WEBSITE IS NOW LIVE ONLINE ON THE INTERNET!');
      console.log(`🌍 PUBLIC URL: ${publicUrl}`);
      console.log('=============================================================\n');
      fs.writeFileSync('PUBLIC_URL.txt', publicUrl, 'utf-8');
    }
  });

  tunnel.on('close', (code) => {
    console.log(`Tunnel closed with code ${code}`);
    server.kill();
    process.exit(code || 0);
  });
}, 2000);

process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});
process.on('SIGTERM', () => {
  server.kill();
  process.exit(0);
});
