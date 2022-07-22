import { TypeOrmModuleOptions } from "@nestjs/typeorm";

// this should be in another path for now its on ./ should be elsewhere
// maybe use .env?

export const db_config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: "postgres",
    //host: "db", // change to do when this is ready? cos when inside the docker container the app will communicate with the db with the dns of docker
    port: 5432,
    username: "transcendence",
    password: "password",
    database: "transcendence",
    synchronize: true,
    autoLoadEntities: true,
    //entities: ["./usdeded.ts"], // is dis useful?
  };
