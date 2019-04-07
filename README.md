# sync-dotenv

> ⚙ ️Keep your .env in sync with .env.(ex|s)ample

<p>
<img src="https://i.imgur.com/TRGtM83.gif">
</p>

## Motivation

Projects often rely on environmental variables to run... and because these
variables sometimes contain sensitive data, we never add them to source control.
Instead, these variables are added to a `.env.example` so
collaborators/teammates/developers can easily get the project working on their
local machine (with their own configurations). The challenge, however, is that
it's very easy to forget to update the `.env.example` file when there's a new
variable the project depends on to function before committing to
source control. This sometimes, makes it impossible to get the project working
for other developers. Enter `sync-dotenv` 🔥

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
