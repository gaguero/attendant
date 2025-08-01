const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Attendandt Development Servers...\n');

// Check if we're in the right directory
const isValidDir = require('fs').existsSync('packages') && 
                   require('fs').existsSync('pnpm-workspace.yaml');

if (!isValidDir) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Start backend server
console.log('📡 Starting backend server on port 3003...');
const backend = spawn('pnpm', ['dev:backend'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Wait a bit before starting frontend
setTimeout(() => {
  console.log('🎨 Starting frontend server on port 5173...');
  const frontend = spawn('pnpm', ['dev:frontend'], {
    stdio: 'inherit', 
    shell: true,
    cwd: process.cwd()
  });

  frontend.on('error', (err) => {
    console.error('❌ Frontend error:', err.message);
  });

}, 3000);

backend.on('error', (err) => {
  console.error('❌ Backend error:', err.message);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  process.exit(0);
});