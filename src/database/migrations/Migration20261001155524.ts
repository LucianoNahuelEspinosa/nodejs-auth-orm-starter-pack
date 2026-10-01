import { Migration } from '@mikro-orm/migrations';

export class Migration20261001155524 extends Migration {

  override name = 'Migration20261001155524';

  override up(): void | Promise<void> {
    this.addSql(`create table \`mikro_orm_seeders\` (\`id\` int unsigned not null auto_increment primary key, \`name\` varchar(255) not null, \`executed_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`mikro_orm_seeders\` add unique \`mikro_orm_seeders_name_unique\` (\`name\`);`);

    this.addSql(`create table \`users\` (\`id\` varchar(36) not null, \`name\` varchar(255) not null, \`last_name\` varchar(255) not null, \`email\` varchar(255) not null, \`password\` varchar(255) not null, \`is_blocked\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`users\` add unique \`users_email_unique\` (\`email\`);`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists \`mikro_orm_seeders\`;`);
    this.addSql(`drop table if exists \`users\`;`);
  }

}
