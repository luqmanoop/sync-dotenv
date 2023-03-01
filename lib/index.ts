#!/usr/bin/env node

import cp from 'child_process';
import meow from 'meow';
import { syncEnv } from './lib';

const cli = meow(
	`
	Usage: sync-dotenv [options]

	Options:
	
	-e, --env file .......... .env file location
	-s, --sample file ....... alternate sample env file to sync with
	-S, --samples "file.*" ........ alternate sample env files pattern to sync with


	Note: If options is omitted, sync-dotenv will attempt to sync .env 
	with .env.example in the current working directory.

	Examples:
	
	$ sync-dotenv 
	$ sync-dotenv --sample .env.development
	$ sync-dotenv --env server/.env --sample example.env
	$ sync-dotenv --samples ".env.*"
`,
	{
		flags: {
			env: {
				type: 'string',
				alias: 'e',
			},
			sample: {
				type: 'string',
				alias: 's',
			},
			samples: {
				type: 'string',
				alias: 'S',
			},
		},
	}
);

const { sample, env, samples } = cli.flags;

syncEnv(sample, env, samples)
	.then((sampleEnv) => cp.exec(`git add ${sampleEnv}`))
	.catch(({ message, code }) => {
		// eslint-disable-next-line no-console
		console.error(message);
		process.exit(code);
	});

export default syncEnv;
