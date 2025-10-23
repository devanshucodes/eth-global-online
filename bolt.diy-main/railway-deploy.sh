#!/bin/bash

# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install --frozen-lockfile

# Start the development server
pnpm dev
