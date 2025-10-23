#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔨 Building Bolt.diy for Railway (v2)...');
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
  
  // Check for remix binary in multiple locations
  const possibleRemixPaths = [
    path.join(__dirname, 'node_modules', '.bin', 'remix'),
    path.join(__dirname, 'node_modules', '@remix-run', 'dev', 'bin', 'remix'),
    path.join(process.cwd(), 'node_modules', '.bin', 'remix'),
    path.join(process.cwd(), 'node_modules', '@remix-run', 'dev', 'bin', 'remix')
  ];

  let remixPath = null;
  for (const possiblePath of possibleRemixPaths) {
    console.log('🔍 Checking:', possiblePath);
    if (fs.existsSync(possiblePath)) {
      remixPath = possiblePath;
      console.log('✅ Found remix binary at:', remixPath);
      break;
    }
  }

  if (remixPath) {
    console.log('🚀 Using remix binary:', remixPath);
    
    const build = spawn('node', [remixPath, 'vite:build'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: {
        ...process.env,
        PATH: process.env.PATH + ':' + path.join(__dirname, 'node_modules', '.bin')
      }
    });

    build.on('error', (error) => {
      console.error('❌ Error running remix build:', error);
      console.log('🔄 Trying alternative approach...');
      runAlternativeBuild();
    });

    build.on('exit', (code) => {
      if (code !== 0) {
        console.error('❌ remix build failed with code:', code);
        console.log('🔄 Trying alternative approach...');
        runAlternativeBuild();
      } else {
        console.log('✅ Build completed successfully');
        process.exit(0);
      }
    });
  } else {
    console.log('⚠️ No remix binary found, trying alternative approach...');
    runAlternativeBuild();
  }
}

function runAlternativeBuild() {
  console.log('🔨 Trying vite build directly...');
  
  const vitePath = path.join(__dirname, 'node_modules', '.bin', 'vite');
  
  if (fs.existsSync(vitePath)) {
    console.log('✅ Found vite binary');
    
    const build = spawn('node', [vitePath, 'build'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: {
        ...process.env,
        PATH: process.env.PATH + ':' + path.join(__dirname, 'node_modules', '.bin')
      }
    });

    build.on('error', (error) => {
      console.error('❌ Error running vite build:', error);
      console.log('🔄 Trying npx approach...');
      runNpxBuild();
    });

    build.on('exit', (code) => {
      if (code !== 0) {
        console.error('❌ vite build failed with code:', code);
        console.log('🔄 Trying npx approach...');
        runNpxBuild();
      } else {
        console.log('✅ Build completed successfully with vite');
        process.exit(0);
      }
    });
  } else {
    console.log('⚠️ No vite binary found, trying npx...');
    runNpxBuild();
  }
}

function runNpxBuild() {
  console.log('🔨 Running npx vite build...');
  
  const build = spawn('npx', ['vite', 'build'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      PATH: process.env.PATH + ':' + path.join(__dirname, 'node_modules', '.bin')
    }
  });

  build.on('error', (error) => {
    console.error('❌ Error running npx vite build:', error);
    process.exit(1);
  });

  build.on('exit', (code) => {
    if (code !== 0) {
      console.error('❌ npx vite build failed with code:', code);
      process.exit(code);
    } else {
      console.log('✅ Build completed successfully with npx vite');
      process.exit(0);
    }
  });
}
