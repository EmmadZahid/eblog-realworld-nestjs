## Description

This is the implementation of [realworld](http://realworld.io) in [Nest](https://github.com/nestjs/nest) framework.

## Installation

```bash
$ npm install
```

## Configuration

Connect mysql database with application by configuring the environemnt variables.
Create an .env file at root folder and configure following variables.

```bash
HOST=xxx
PORT=xxx
USERNAME=xxx
PASSWORD=xxx
DATABASE=xxx
SECRET=xxx
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

Right now some of the unit tests are implemented. E2E and integration tests need to be implemented.

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```
