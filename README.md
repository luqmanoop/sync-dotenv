<div align="center">
	<img src="https://i.imgur.com/TRGtM83.gif">
	<h1 style="font-weight:bold;">sync ⚙️ dotenv</h1>
    <p>Keep your .env in sync with .env.(ex|s)ample</p>
</div>

## Motivation

Projects often rely on environmental variables stored in `.env` to run... and because these
variables sometimes contain sensitive data, we never add them to source control.
Instead, these variables are added e.g. to a `.env.example` file so it's easy to
get the project running for other developers. However, it's very easy to forget to update this file
when a variable is added/updated in `.env` (during development). This can make
it difficult for devs to get the project running (locally) because they rely on
`.env.example` file to setup their environment (with their own configs).

Enter `sync-dotenv` 🔥

## Installation

```bash
$ npm install sync-dotenv --save
```

or using yarn

```bash
$ yarn add sync-dotenv
```

## Usage

`sync-dotenv` will attempt to sync with provided env if exist, else it'll create one

```javascript
const syncEnv = require("sync-dotenv");

syncEnv();
```

```javascript
const syncEnv = require("sync-dotenv");

syncEnv(".env.development");
```

## API

### syncEnv(filename)

#### filename

A string representing the (exisiting or new) env sample to sync with

Type: `String`

Default: `.env.example`

## Related

- [parse-dotenv](https://github.com/codeshifu/parse-dotenv) - zero dependency .env to javascript object parser

## License

This project is license under
[MIT](https://github.com/codeshifu/sync-dotenv/blob/master/LICENSE)
