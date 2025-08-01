const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Attendandt Development Servers...\n');

// Start backend server
const backend = spawn('pnpm', ['dev'], {
  cwd: path.join(__dirname, 'packages', 'backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit then start frontend
setTimeout(() => {
  const frontend = spawn('pnpm', ['dev'], {
    cwd: path.join(__dirname, 'packages', 'frontend'),
    stdio: 'inherit',
    shell: true
  });
  
  frontend.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
  });
}, 3000);

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill('SIGINT');
  process.exit(0);
});