import { Migration } from '@mikro-orm/migrations';

export class Migration20260925190109 extends Migration {

  override name = 'Migration20260925190109';

  override up(): void | Promise<void> {
    this.addSql(`create table "mikro_orm_seeders" ("id" serial primary key, "name" varchar(255) not null, "executed_at" timestamptz not null);`);
    this.addSql(`alter table "mikro_orm_seeders" add constraint "mikro_orm_seeders_name_unique" unique ("name");`);

    this.addSql(`create table "users" ("id" uuid not null, "name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "is_blocked" boolean not null default false, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "mikro_orm_seeders" cascade;`);
    this.addSql(`drop table if exists "users" cascade;`);
  }

}
