import { defineEntity, p } from '@mikro-orm/core';

export const SeederExecutionSchema = defineEntity({
    name: 'mikro_orm_seeders',
    properties: {
        id: p.integer().primary().autoincrement(),
        name: p.string().unique(),
        executedAt: p.datetime().onCreate(() => new Date())
    }
});