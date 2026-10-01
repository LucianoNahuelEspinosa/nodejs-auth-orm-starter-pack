import { execSync } from 'child_process';
import { rmSync } from 'fs';

try {
    console.log('🚀 Starting build with SWC...');

    rmSync('dist', { recursive: true, force: true });
    execSync('npx swc src -d dist --strip-leading-paths', { stdio: 'inherit' });
    execSync('npx tsc-alias -p tsconfig.json', { stdio: 'inherit' });

    console.log('✅ Build completed successfully.');
} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
}