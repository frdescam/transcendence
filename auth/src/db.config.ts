import { TypeOrmModuleOptions } from "@nestjs/typeorm";

// this should be in another path for now its on ./ should be elsewhere

export const db_config: TypeOrmModuleOptions = {
    type: 'postgres',
    //host: "db", // why the @#$%?
    port: 5434,
    username: "user",
    password: "password",
    database: "my_db",
    synchronize: true,
    autoLoadEntities: true,
    //entities: []
  };