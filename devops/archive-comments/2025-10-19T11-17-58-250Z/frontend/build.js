import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
  try {
    // First install the Rollup dependency
    console.log('Installing Rollup dependency...');
    await execAsync('npm install @rollup/rollup-linux-x64-gnu --no-save');

    // Then run the build
    console.log('Running Vite build...');
    await execAsync('vite build');

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();