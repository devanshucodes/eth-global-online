#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Bolt.diy for Railway...');

// Check if build directory exists
const buildPath = path.join(__dirname, 'build', 'client');
const fs = require('fs');

if (!fs.existsSync(buildPath)) {
  console.log('❌ Build directory not found. Please run: npm run build');
  process.exit(1);
}

console.log('✅ Build directory found');

// Start wrangler pages dev
const wrangler = spawn('npx', [
  'wrangler', 
  'pages', 
  'dev', 
  './build/client',
  '--port', '5173',
  '--no-show-interactive-dev-session'
], {
  cwd: __dirname,
  stdio: 'inherit'
});

wrangler.on('error', (error) => {
  console.error('❌ Error starting wrangler:', error);
  process.exit(1);
});

wrangler.on('exit', (code) => {
  console.log(`🚪 Wrangler exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  wrangler.kill();
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down...');
  wrangler.kill();
});
