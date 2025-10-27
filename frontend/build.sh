#!/bin/bash

# Install the problematic dependency first
npm install @rollup/rollup-linux-x64-gnu --no-save

# Then run the build
npm run build