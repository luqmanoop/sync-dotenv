import { resolve, basename } from 'path';
import fs from 'fs';
import os from 'os';
import parseEnv from 'parse-dotenv';
import globby from 'globby';
import pkgConf from 'pkg-conf';

const DEFAULT_ENV_PATH = resolve(process.cwd(), '.env');
const DEFAULT_SAMPLE_ENV = resolve(process.cwd(), '.env.example');

interface EnvObject {
	[key: string]: any;
}

interface Config {
	preserve?: [string];
	emptyLines?: boolean;
	comments?: boolean;
}

export const fileExists = (path: string) => fs.existsSync(path);

export const getObjKeys = (obj: object) => Object.keys(obj);

export const envToString = (parsed: EnvObject) =>
	getObjKeys(parsed)
		.map((key) => `${key}=${parsed[key] || ''}`)
		.join(os.EOL)
		.replace(/(__\w+_\d+__=)/g, '');

export const writeToSampleEnv = (path: string, parsedEnv: object) => {
	try {
		fs.writeFileSync(path, envToString(parsedEnv));
	} catch (error: unknown) {
		throw new Error(
			`Sync failed. ${error instanceof Error ? error.message : String(error)}`
		);
	}
};

export const emptyObjProps = (obj: EnvObject) => {
	const objCopy = { ...obj };
	Object.keys(objCopy).forEach((key) => {
		if (objCopy[key].includes('#')) {
			if (objCopy[key].match(/(".*"|'.*')/g)) {
				const objArr = objCopy[key].split(/(".*"|'.*')/);
				objCopy[key] = objArr.slice(-1)[0].trim();
			} else {
				const objArr = objCopy[key].split('#');
				objCopy[key] = `#${objArr.slice(-1)[0]}`;
			}

			return;
		}

		/* istanbul ignore else */
		if (!key.startsWith('__COMMENT_')) {
			objCopy[key] = '';
		}
	});

	return objCopy;
};

export const getUniqueVarsFromEnvs = async (
	env: EnvObject,
	envExample: EnvObject,
	config: Config = {}
) => {
	const ignoreKeys = config.preserve || [];

	const uniqueKeys = new Set(getObjKeys(env));
	const uniqueKeysArray: Array<string> = Array.from(uniqueKeys);

	const uniqueFromSource = uniqueKeysArray.map((key: string) => {
		if (key.startsWith('__COMMENT_')) return { [key]: env[key] };
		return { [key]: envExample[key] || '' };
	});

	const presevedVars = getObjKeys(envExample)
		.map((key) => ({ [key]: envExample[key] }))
		.filter(
			// eslint-disable-next-line no-shadow
			(env) => ignoreKeys.length && ignoreKeys.includes(getObjKeys(env)[0])
		);

	return [...uniqueFromSource, ...presevedVars];
};

export const syncWithSampleEnv = async (
	envPath: string,
	envExamplePath: string,
	initialConfig?: Config
) => {
	// We do this so we can pass it via test as well
	const config: Config =
		initialConfig || ((await pkgConf('sync-dotenv')) as any);

	// Set defaults
	config.comments =
		typeof config.comments === 'undefined' ? true : config.comments;
	config.emptyLines =
		typeof config.emptyLines === 'undefined' ? true : config.comments;

	const sourceEnv = emptyObjProps(
		parseEnv(envPath, {
			emptyLines: !!config.emptyLines,
			comments: !!config.comments,
		})
	);
	const targetEnv = parseEnv(envExamplePath);

	const uniqueVars = await getUniqueVarsFromEnvs(sourceEnv, targetEnv, config);
	const envCopy: EnvObject = {};
	uniqueVars.forEach((env) => {
		const [key] = getObjKeys(env);
		envCopy[key] = env[key];
	});

	writeToSampleEnv(envExamplePath, envCopy);
};

const exit = (message: string, code: number = 1) =>
	// eslint-disable-next-line prefer-promise-reject-errors
	Promise.reject({ message, code });

export const syncEnv = async (
	sampleEnv?: string,
	source?: string,
	samples?: string
): Promise<{ msg: string; code: number } | string> => {
	if (sampleEnv && (sampleEnv === '.env' || basename(sampleEnv) === '.env'))
		return exit('Cannot sync .env with .env');

	const SAMPLE_ENV_PATHS: string[] = !samples
		? [resolve(process.cwd(), sampleEnv || DEFAULT_SAMPLE_ENV)]
		: globby
				.sync(samples)
				.map((sample: string) => resolve(process.cwd(), sample));

	// eslint-disable-next-line no-nested-ternary
	const envPath = source
		? fileExists(source)
			? source
			: null
		: DEFAULT_ENV_PATH;

	if (envPath === null) return exit(`${source} not found`);

	if (!source && !fileExists(envPath)) return exit(".env doesn't exists");

	if (!SAMPLE_ENV_PATHS.length)
		return exit(`${samples} did not match any file`);

	if (!fileExists(SAMPLE_ENV_PATHS[0]))
		return exit(`${sampleEnv || basename(DEFAULT_SAMPLE_ENV)} not found`);

	const sourcePath = envPath;

	for (const samplePath of SAMPLE_ENV_PATHS) {
		await syncWithSampleEnv(sourcePath, samplePath);
	}

	return Promise.resolve(SAMPLE_ENV_PATHS.join(' '));
};
