import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';

import { defineConfig as defineMySqlConfig } from '@mikro-orm/mysql';
import { defineConfig as defineMariaDbConfig } from '@mikro-orm/mariadb';
import { defineConfig as definePostgresConfig } from '@mikro-orm/postgresql';
import { defineConfig as defineSqliteConfig } from '@mikro-orm/sqlite';

process.loadEnvFile?.('.env');
const driver = process.env.DB_DRIVER ?? 'postgresql';

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
        allOrNothing: true
    },
    seeder: {
        path: './dist/database/seeders',
        pathTs: './src/database/seeders',
        glob: '!(*.d).{js,ts}'
    },
    debug: process.env.NODE_ENV !== 'production'
};

const config =
    driver === 'mysql'
        ? defineMySqlConfig({
            ...commonConfig,
            dbName: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT ?? 3306),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
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