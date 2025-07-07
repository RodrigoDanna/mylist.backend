<h1 align="center">mylist.backend <sup>v1.0.0</sup></h1>
<p align="center">A NestJS backend service</p>

## Description

This is the backend for the <b>MyList</b> project. It is built with [NestJS](https://github.com/nestjs/nest) and TypeScript.

> Version: 1.0.0
>
> License: UNLICENSED
>
> Author: Rodrigo R. Danna

## Scripts

The following npm scripts are available (see also `package.json`):

| Script                    | Description               |
| ------------------------- | ------------------------- |
| `npm run build`           | Build the NestJS project  |
| `npm run format`          | Format code with Prettier |
| `npm run start`           | Start the application     |
| `npm run start:dev`       | Start in watch mode       |
| `npm run start:debug`     | Start in debug mode       |
| `npm run start:prod`      | Start production build    |
| `npm run lint`            | Lint and fix code         |
| `npm run test`            | Run unit tests            |
| `npm run test:watch`      | Run tests in watch mode   |
| `npm run test:cov`        | Run tests with coverage   |
| `npm run test:debug`      | Debug tests               |
| `npm run test:e2e`        | Run end-to-end tests      |
| `npm run prisma:migrate`  | Run Prisma migrations     |
| `npm run prisma:generate` | Generate Prisma client    |
| `npm run prisma:studio`   | Open Prisma Studio        |

## Dependencies

Main dependencies:

- @nestjs/common, @nestjs/core, @nestjs/jwt, @nestjs/passport, @nestjs/platform-express
- @prisma/client, bcrypt, nodemailer, passport, passport-jwt, reflect-metadata, rxjs

Dev dependencies include: @nestjs/cli, @nestjs/testing, jest, ts-jest, typescript, eslint, prettier, prisma, and more.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
