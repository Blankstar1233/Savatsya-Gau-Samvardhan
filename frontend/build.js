import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
  try {
   
    console.log('Installing Rollup dependency...');
    await execAsync('npm install @rollup/rollup-linux-x64-gnu --no-save');

   
    console.log('Running Vite build...');
    await execAsync('vite build');

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();