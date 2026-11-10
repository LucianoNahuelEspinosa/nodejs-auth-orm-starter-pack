import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';
import type { Options } from '@mikro-orm/core';

import { defineConfig as defineMySqlConfig } from '@mikro-orm/mysql';
import { defineConfig as defineMariaDbConfig } from '@mikro-orm/mariadb';
import { defineConfig as definePostgresConfig } from '@mikro-orm/postgresql';
import { defineConfig as defineSqliteConfig } from '@mikro-orm/sqlite';
import { SoftDeleteSubscriber } from './database/subscribers';

process.loadEnvFile?.('.env');
const driver = process.env.DB_DRIVER ?? 'postgresql';
const isProduction = process.env.NODE_ENV === 'production';

const isCli = process.argv.some(arg => arg.includes('mikro-orm'));
const isFreshCommand = process.argv.some(arg => arg.includes('fresh'));
if (isProduction && isCli && isFreshCommand) {
    throw new Error('❌ SECURITY: The “fresh” command deletes the entire database and is prohibited in production.');
}

const commonConfig = {
    entities: ['./dist/database/entities/**/*.js'],
    entitiesTs: ['./src/database/entities/**/*.ts'],
    extensions: [Migrator, SeedManager],
    migrations: {
        path: './dist/database/migrations',
        pathTs: './src/database/migrations',
        tableName: 'mikro_orm_migrations',
        emit: 'ts' as const,
        transactional: true,
        allOrNothing: true,
        snapshot: true,
        snapshotName: ".snapshot-mikro-orm"
    },
    seeder: {
        path: './dist/database/seeders',
        pathTs: './src/database/seeders',
        glob: '!(*.d).{js,ts}'
    },
    debug: !isProduction,
    subscribers: [new SoftDeleteSubscriber()]
} satisfies Partial<Options>;

const config =
    driver === 'mysql'
        ? defineMySqlConfig({
            ...commonConfig,
            dbName: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT ?? 3306),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        })

        : driver === 'mariadb'
            ? defineMariaDbConfig({
                ...commonConfig,
                dbName: process.env.DB_NAME,
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT ?? 3306),
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD
            })

            : driver === 'postgresql'
                ? definePostgresConfig({
                    ...commonConfig,
                    dbName: process.env.DB_NAME,
                    host: process.env.DB_HOST,
                    port: Number(process.env.DB_PORT ?? 5432),
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD
                })

                : driver === 'sqlite'
                    ? defineSqliteConfig({
                        ...commonConfig,
                        dbName: process.env.DB_NAME
                    })

                    : (() => {
                        throw new Error(
                            `Unsupported DB_DRIVER "${driver}". ` +
                            `Supported drivers: mysql, mariadb, postgresql, sqlite`,
                        );
                    })();

export default config;