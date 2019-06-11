import { resolve, basename } from "path";
import fs from "fs";
import parseEnv from "parse-dotenv";
import globby from 'globby';

const DEFAULT_ENV_PATH = resolve(process.cwd(), ".env");
const DEFAULT_SAMPLE_ENV = resolve(process.cwd(), ".env.example");

interface EnvObject {
	[key: string]: any;
}

export const fileExists = (path: string) => fs.existsSync(path);

export const getObjKeys = (obj: object) => Object.keys(obj);

export const envToString = (parsed: EnvObject) =>
	getObjKeys(parsed)
		.map(key => `${key}=${parsed[key] || ""}`)
		.join("\r\n")
		.replace(/(__\w+_\d+__=)/g, "");

export const writeToSampleEnv = (path: string, parsedEnv: object) => {
	fs.writeFile(path, envToString(parsedEnv), err => {
		if (err) throw new Error(`Sync failed. ${err.message}`);
	});
};

export const emptyObjProps = (obj: EnvObject) => {
	const objCopy = { ...obj };
	Object.keys(objCopy).forEach(key => {
		objCopy[key] = "";
	});

	return objCopy;
};

export const getUniqueVarsFromEnvs = (env: object, envExample: EnvObject) => {
	// making use of the .env because that should be the single source of truth
	// the .env.example should be based off the .env and not otherwise
	const uniqueKeys = new Set(getObjKeys(env));
	const uniqueKeysArray: Array<string> = Array.from(uniqueKeys);
	return uniqueKeysArray.map(key => ({ [key]: envExample[key] || "" }));
};

export const removeStaleVarsFromEnv = (env: object, vars: EnvObject[]) => {
	let envCopy: EnvObject = { ...env };
	envCopy = emptyObjProps(envCopy);

	vars.forEach(envObj => {
		const [key] = Object.keys(envObj);
		if (envCopy.hasOwnProperty(key)) {
			envCopy[key] = envObj[key];
		}
	});

	return envCopy;
};

export const getParsedEnvs = (env: object, envExample: object) => {
	const envObj = { ...env };
	const uniqueVars = getUniqueVarsFromEnvs(envObj, envExample);

	return removeStaleVarsFromEnv(envObj, uniqueVars);
};

export const syncWithSampleEnv = (envPath: string, envExamplePath: string) => {
	const parsedEnvs = getParsedEnvs(
		parseEnv(envPath, { emptyLines: true }),
		parseEnv(envExamplePath)
	);
	writeToSampleEnv(envExamplePath, parsedEnvs);
};

const exit = (message: string, code: number = 1) =>
	Promise.reject({ message, code });

export const syncEnv = (
	sampleEnv?: string,
	source?: string,
	samples?: string
): Promise<{ msg: string; code: number } | string> => {
	if (sampleEnv && (sampleEnv === ".env" || basename(sampleEnv) === ".env"))
		return exit("Cannot sync .env with .env");

	const SAMPLE_ENV_PATHS: string[] = !samples
		? [resolve(process.cwd(), sampleEnv || DEFAULT_SAMPLE_ENV)]
		: globby
				.sync(samples)
				.map((sample: string) => resolve(process.cwd(), sample));

	let envPath = source
		? fileExists(source)
			? source
			: null
		: DEFAULT_ENV_PATH;

	if (envPath === null) return exit(`${source} not found`);

	if (!source && !fileExists(envPath)) return exit(".env doesn't exists");

	if (!SAMPLE_ENV_PATHS.length) return exit(`${samples} did not match any file`);

	if (!fileExists(SAMPLE_ENV_PATHS[0]))
		return exit(`${sampleEnv || basename(DEFAULT_SAMPLE_ENV)} not found`);
	
	const sourcePath = envPath;
	SAMPLE_ENV_PATHS.forEach(samplePath => syncWithSampleEnv(sourcePath, samplePath));
	return Promise.resolve(SAMPLE_ENV_PATHS.join(' '));
};
