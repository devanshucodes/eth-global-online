#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔨 Building Bolt.diy for Railway (FINAL)...');
console.log('📁 Current directory:', __dirname);
console.log('📁 Working directory:', process.cwd());

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found in:', __dirname);
  process.exit(1);
}

console.log('✅ package.json found');

// Check node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  
  const install = spawn('npm', ['install'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  install.on('error', (error) => {
    console.error('❌ Error installing dependencies:', error);
    process.exit(1);
  });

  install.on('exit', (code) => {
    if (code !== 0) {
      console.error('❌ npm install failed with code:', code);
      process.exit(code);
    }
    
    console.log('✅ Dependencies installed');
    runBuild();
  });
} else {
  console.log('✅ Dependencies already installed');
  runBuild();
}

function runBuild() {
  console.log('🔨 Running build...');
  
  // Use npm run build which will handle the shell scripts properly
  console.log('🚀 Using npm run build (handles shell scripts correctly)');
  
  const build = spawn('npm', ['run', 'build'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true  // This is crucial for shell script execution
  });

  build.on('error', (error) => {
    console.error('❌ Error running npm run build:', error);
    console.log('🔄 Trying vite build directly...');
    runViteBuild();
  });

  build.on('exit', (code) => {
    if (code !== 0) {
      console.error('❌ npm run build failed with code:', code);
      console.log('🔄 Trying vite build directly...');
      runViteBuild();
    } else {
      console.log('✅ Build completed successfully');
      process.exit(0);
    }
  });
}

function runViteBuild() {
  console.log('🔨 Running vite build directly...');
  
  const build = spawn('npx', ['vite', 'build'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  build.on('error', (error) => {
    console.error('❌ Error running vite build:', error);
    process.exit(1);
  });

  build.on('exit', (code) => {
    if (code !== 0) {
      console.error('❌ vite build failed with code:', code);
      process.exit(code);
    } else {
      console.log('✅ Build completed successfully with vite');
      process.exit(0);
    }
  });
}
