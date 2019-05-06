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

- [parse-dotenv](https://github.com/codeshifu/parse-dotenv) - zero dependency `.env` to javascript object parser

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="https://twitter.com/codeshifu"><img src="https://avatars0.githubusercontent.com/u/5154605?v=4" width="100px;" alt="Luqman Olushi O."/><br /><sub><b>Luqman Olushi O.</b></sub></a><br /><a href="https://github.com/codeshifu/sync-dotenv/commits?author=codeshifu" title="Code">💻</a> <a href="https://github.com/codeshifu/sync-dotenv/commits?author=codeshifu" title="Documentation">📖</a> <a href="#maintenance-codeshifu" title="Maintenance">🚧</a> <a href="#platform-codeshifu" title="Packaging/porting to new platform">📦</a> <a href="https://github.com/codeshifu/sync-dotenv/commits?author=codeshifu" title="Tests">⚠️</a></td><td align="center"><a href="https://www.patreon.com/cooproton"><img src="https://avatars0.githubusercontent.com/u/25608335?v=4" width="100px;" alt="Bolaji Olajide"/><br /><sub><b>Bolaji Olajide</b></sub></a><br /><a href="https://github.com/codeshifu/sync-dotenv/commits?author=BolajiOlajide" title="Code">💻</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

This project is licensed under
[MIT](https://github.com/codeshifu/sync-dotenv/blob/master/LICENSE)
