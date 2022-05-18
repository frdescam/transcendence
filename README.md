# TRANSCENDENCE

- [Features](#features)
- [Architecture](#architecture)
- [Database](#database)
- [Command](#command)
  - [Clean docker instance](#command_clean)
  - [Development mode](#command_dev)
  - [Production mode](#command_prod)

---

This is the last mandatory project of the 42 school.
The goal is to create a complete, full featured website to organize a *Pong* competition.
We have to use the NestJS backend framework.
We were free to choose any typescript frontend framework, we choose Vue.js

Feel free to read the subject for more information

## <a id="features">Features</a>
![todo](.git-assets/todo.png)

## <a id="architecture">Architecture</a>
![architecture](.git-assets/architecture.png)

## <a id="database">Database</a>
![database](.git-assets/database.png)

## <a id="command">Command</a>

### <a id="command_clean">Clean docker instance</a>
> This script allows you to fully clean docker (volume, data, etc...), but also the node_modules and yarn cache
```shell
chmod +x dockerPrune.sh
./dockerPrune.sh
```

### <a id="command_dev">Development mode</a>
> This mode allows that all the modifications either front or back side are taken into account without reloading docker-compose
```shell
chmod +x dev.sh
./dev.sh
```

### <a id="command_prod">Production mode</a>
> This mode allows you to create a fully functional website
```shell
docker-compose up --build
```