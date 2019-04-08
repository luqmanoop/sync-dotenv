import { resolve, basename } from "path";
import fs from "fs";
import parseEnv from "parse-dotenv";

const ENV_PATH = resolve(process.cwd(), ".env");
const DEFAULT_EXAMPLE_ENV_FILENAME = ".env.example";

interface EnvObject {
	[key: string]: any;
}

export const fileExists = (path: string) => fs.existsSync(path);

export const getObjKeys = (obj: object) => Object.keys(obj);

export const envToString = (parsed: EnvObject) =>
	getObjKeys(parsed)
		.map(key => `${key}=${parsed[key] || ""}`)
		.join("\r\n")
		.replace(/(__\w+_\d__=)/g, "");

export const writeToExampleEnv = (path: string, parsedEnv: object) => {
	fs.writeFile(path, envToString(parsedEnv), err => {
		if (err) console.log(`failed to write to ${basename(path)}`);
	});
};

export const emptyObjProps = (obj: EnvObject) => {
	const objCopy = { ...obj };
	Object.keys(objCopy).forEach(key => {
		objCopy[key] = "";
	});

	return objCopy;
};

export const getUniqueVarsFromEnvs = (env: object, envExample: EnvObject) =>
	getObjKeys(envExample)
		.filter(key => {
			const envHasKey = Object.getOwnPropertyNames(env).includes(key);
			const keyValue = envExample[key];
			return keyValue && envHasKey;
		})
		.map(key => ({ [key]: envExample[key] }));

export const removeStaleVarsFromEnv = (env: object, vars: object[]) => {
	let envCopy: EnvObject = { ...env };
	envCopy = emptyObjProps(envCopy);
	vars.forEach(envObj => {
		const [key] = Object.keys(envObj);
		if (envCopy[key]) delete envCopy[key];
		envCopy = { ...envCopy, ...envObj };
	});

	return envCopy;
};

export const keepEnvsInSync = (env: object, envExample: object) => {
	const envObj = { ...env };
	const uniqueVars = getUniqueVarsFromEnvs(envObj, envExample);

	return removeStaleVarsFromEnv(envObj, uniqueVars);
};

export const sync = (envPath: string, envExamplePath: string) => {
	const syncedEnv = keepEnvsInSync(
		parseEnv(envPath, { emptyLines: true }),
		parseEnv(envExamplePath)
	);
	writeToExampleEnv(envExamplePath, syncedEnv);
};

export const watchAndSync = (envPath: string, envExamplePath: string) => {
	fs.watchFile(envPath, () => sync(envPath, envExamplePath));
};

export const syncEnv = (filename?: string) => {
	const EXAMPLE_ENV_PATH = resolve(
		process.cwd(),
		filename || DEFAULT_EXAMPLE_ENV_FILENAME
	);

	if (!fileExists(ENV_PATH)) {
		console.log("Cannot find .env in project root");
		return;
	}

	if (!fileExists(EXAMPLE_ENV_PATH)) {
		writeToExampleEnv(
			DEFAULT_EXAMPLE_ENV_FILENAME,
			emptyObjProps(parseEnv(ENV_PATH))
		);
	} else sync(ENV_PATH, EXAMPLE_ENV_PATH);

	watchAndSync(ENV_PATH, EXAMPLE_ENV_PATH);
};
