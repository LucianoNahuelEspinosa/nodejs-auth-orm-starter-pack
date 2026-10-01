import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { MikroORM, EntityManager } from '@mikro-orm/core';
import { SeederExecutionSchema } from '../src/database/entities/SeederExecution.js';
import config from '../src/mikro-orm.config.js';

const SEEDERS_PATH = join(process.cwd(), 'src/database/seeders');

type SeederConstructor = new () => {
    run(em: EntityManager): Promise<void>;
};

async function discoverSeeders() {
    const files = await readdir(SEEDERS_PATH);
    const seeders: SeederConstructor[] = [];

    for (const file of files) {
        if (!file.endsWith('.ts') || file.endsWith('.d.ts')) {
            continue;
        }

        if (file === 'index.ts') {
            continue;
        }

        const module = await import(
            pathToFileURL(join(SEEDERS_PATH, file)).href
        );

        for (const exported of Object.values(module)) {
            if (
                typeof exported === 'function' &&
                exported.name.endsWith('Seeder')
            ) {
                seeders.push(exported as SeederConstructor);
            }
        }
    }

    return seeders;
}

async function run() {
    const orm = await MikroORM.init(config as any);

    try {
        const em = orm.em.fork();
        const seeders = await discoverSeeders();

        seeders.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        for (const SeederClass of seeders) {
            const name = SeederClass.name;

            const executed = await em.findOne(SeederExecutionSchema, { name }, );

            if (executed) {
                console.log(`⏭️  ${name}`);
                continue;
            }

            console.log(`🌱 ${name}`);

            await em.transactional(async transactionalEm => {
                const seeder = new SeederClass();

                await seeder.run(transactionalEm);

                transactionalEm.create(
                    SeederExecutionSchema,
                    { name },
                );

                await transactionalEm.flush();
            });

            console.log(`✅ ${name}`);
        }
    } finally {
        await orm.close();
    }
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});