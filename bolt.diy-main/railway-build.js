#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔨 Building Bolt.diy for Railway...');

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
const fs = require('fs');

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
  
  // Try to use local remix binary first
  const remixPath = path.join(__dirname, 'node_modules', '.bin', 'remix');
  
  if (fs.existsSync(remixPath)) {
    console.log('✅ Found local remix binary');
    
    const build = spawn(remixPath, ['vite:build'], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    build.on('error', (error) => {
      console.error('❌ Error running remix build:', error);
      console.log('🔄 Trying npx remix vite:build...');
      runNpxBuild();
    });

    build.on('exit', (code) => {
      if (code !== 0) {
        console.error('❌ remix build failed with code:', code);
        console.log('🔄 Trying npx remix vite:build...');
        runNpxBuild();
      } else {
        console.log('✅ Build completed successfully');
        process.exit(0);
      }
    });
  } else {
    console.log('⚠️ Local remix binary not found, trying npx...');
    runNpxBuild();
  }
}

function runNpxBuild() {
  console.log('🔨 Running npx remix vite:build...');
  
  const build = spawn('npx', ['remix', 'vite:build'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  build.on('error', (error) => {
    console.error('❌ Error running npx remix build:', error);
    console.log('🔄 Trying vite build as fallback...');
    runViteBuild();
  });

  build.on('exit', (code) => {
    if (code !== 0) {
      console.error('❌ npx remix build failed with code:', code);
      console.log('🔄 Trying vite build as fallback...');
      runViteBuild();
    } else {
      console.log('✅ Build completed successfully');
      process.exit(0);
    }
  });
}

function runViteBuild() {
  console.log('🔨 Running vite build as fallback...');
  
  const build = spawn('npx', ['vite', 'build'], {
    cwd: __dirname,
    stdio: 'inherit'
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