#!/usr/bin/env node

import { syncEnv } from "./lib";
import cp from "child_process";
import meow from "meow";

const cli = meow(
	`
	Usage
	$ sync-dotenv
	$ sync-dotenv [options] <filename>

	Options:
	
	--sample <filename> ... alternate sample env to sync with

	Examples:
	
	$ sync-dotenv 
	$ sync-dotenv --sample .env.development
`,
	{
		flags: {
			sample: {
				type: "string"
			}
		}
	}
);

const { sample } = cli.flags;

syncEnv(sample)
	.then(sampleEnv => cp.exec(`git add ${sampleEnv}`))
	.catch(({ message, code }) => {
		console.log(message);
		process.exit(code);
	});

export default syncEnv;
