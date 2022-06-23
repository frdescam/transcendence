import { TypeOrmModuleOptions } from "@nestjs/typeorm";

// this should be in another path for now its on ./ should be elsewhere
// maybe use .env?

export const db_config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: "localhost",
    //host: "db", // change to do when this is ready? cos when inside the docker container the app will communicate with the db with the dns of docker
    port: 5434,
    username: "user",
    password: "password",
    database: "my_db",
    synchronize: true,
    autoLoadEntities: true,
    //entities: ["./usdeded.ts"], // is dis useful?
  };