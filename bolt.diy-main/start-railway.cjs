#!/usr/bin/env node
const { spawn } = require('child_process');
const port = process.env.PORT || process.env.port || '5173';
const args = ['-s', 'build/client', '-l', `tcp://0.0.0.0:${port}`];
const p = spawn('npx', ['serve', ...args], { stdio: 'inherit', shell: true });
p.on('exit', (code) => process.exit(code));
