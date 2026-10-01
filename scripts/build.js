import * as esbuild from 'esbuild';
import { readdirSync, rmSync } from 'fs';
import { join } from 'path';

const getFiles = (directory) => {
    return readdirSync(directory, {
        recursive: true,
    }).filter((file) => file.endsWith('.ts')).map((file) => join(directory, file));
};

const build = async () => {
    console.log('🚀 Starting build with esbuild...');

    try {
        rmSync('dist', {
            recursive: true,
            force: true,
        });
        await esbuild.build({
            entryPoints: ['src/index.ts'],
            bundle: true,
            minify: true,
            format: 'esm',
            platform: 'node',
            target: 'node22',
            outfile: 'dist/index.js',
            packages: 'external',
            alias: {
                '@': './src',
            },
        });

        const entityFiles = getFiles('src/database/entities');
        await esbuild.build({
            entryPoints: entityFiles,
            bundle: false,
            format: 'esm',
            platform: 'node',
            target: 'node22',
            outdir: 'dist/database/entities',
            packages: 'external',
        });

        console.log('✨ Entities generated');
        console.log('✅ Build completed successfully');
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
};

build();