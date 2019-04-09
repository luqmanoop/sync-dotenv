<div align="center">
	<img src="https://i.imgur.com/TRGtM83.gif">
	<h1 style="font-weight:bold;">sync ⚙️ dotenv</h1>
    <p>Keep your .env in sync with .env.example</p>
    <img alt="Travis (.org)" src="https://img.shields.io/travis/codeshifu/sync-dotenv.svg?logo=travis">
	<img alt="Coveralls github" src="https://img.shields.io/coveralls/github/codeshifu/sync-dotenv.svg?style=popout">
</div>

## Motivation

Projects often rely on environmental variables stored in a `.env` file to run... and because these
variables sometimes contain sensitive data, we never add them to source control.
Instead, these variables are added e.g. to a `.env.example` file so it's easy to
get the project running for other developers. However, it's very easy to forget to update this file
when a variable is added/updated in `.env` (during development). This can make
it difficult for devs to get the project running (locally) because they rely on
`.env.example` file to setup their environment (with their own configs).

Enter `sync-dotenv` 🔥

## Description

`sync-dotenv` is a tiny module that helps automate the process of keeping your `.env`
file in sync with `.env.example`.

## Installation

```bash
$ npm install sync-dotenv --save
```

or using yarn

```bash
$ yarn add sync-dotenv
```

## Usage

By default, `sync-dotenv` looks for a `.env` file in your project root. Failure
to find this file will cause it to throw an error.

```javascript
const syncEnv = require("sync-dotenv");

syncEnv(); // use exisiting .env.example or create one
```

```javascript
const syncEnv = require("sync-dotenv");

syncEnv(".env.development");
```

Handling error when there's no `.env`

```javascript
const syncEnv = require("sync-dotenv");

try {
  syncEnv();
} catch (error) {
  console.log(error.message); // .env not found
}
```

## API

### syncEnv(filename)

#### filename

A string representing the (existing or new) example env file to sync with
(relative to project root).

Type: `String`

Default: `.env.example`

## Related

- [parse-dotenv](https://github.com/codeshifu/parse-dotenv) - zero dependency .env to javascript object parser

## License

This project is license under
[MIT](https://github.com/codeshifu/sync-dotenv/blob/master/LICENSE)
