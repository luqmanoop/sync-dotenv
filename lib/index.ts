#!/usr/bin/env node

import cp from "child_process";
import meow from "meow";
import { syncEnv } from "./lib";

const cli = meow(
	`
	Usage: sync-dotenv [options]

	Options:
	
	-e, --env file .......... .env file location
	-s, --sample file ....... alternate sample env file to sync with


	Note: If options is omitted, sync-dotenv will attempt to sync .env 
	with .env.example in the current working directory.

	Examples:
	
	$ sync-dotenv 
	$ sync-dotenv --sample .env.development
	$ sync-dotenv --env server/.env --sample example.env
`,
	{
		flags: {
			sample: {
				type: "string"
			}
		}
	}
);

const { sample, s, env, e } = cli.flags;

syncEnv(sample || s, env || e)
	.then(sampleEnv => cp.exec(`git add ${sampleEnv}`))
	.catch(({ message, code }) => {
		console.log(message);
		process.exit(code);
	});

export default syncEnv;
