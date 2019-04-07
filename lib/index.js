import { resolve, basename } from 'path';
import fs from 'fs';
import parseEnv from 'parse-dotenv';

const ENV_PATH = resolve(process.cwd(), '.env');
const DEFAULT_EXAMPLE_ENV_FILENAME = '.env.example';

const fileExists = path => fs.existsSync(path);

const getObjKeys = obj => Object.keys(obj);

const envToString = parsed =>
  getObjKeys(parsed)
    .map(key => `${key}=${parsed[key] || ''}`)
    .join('\r\n')
    .replace(/(__\w+_\d__=)/g, '');

const writeToExampleEnv = (path, parsedEnv) => {
  fs.writeFile(path, envToString(parsedEnv), err => {
    if (err) console.log(`failed to write to ${basename(path)}`);
  });
};

const emptyObjProps = obj => {
  const objCopy = { ...obj };
  Object.keys(objCopy).forEach(key => {
    objCopy[key] = '';
  });

  return objCopy;
};

const getUniqueVarsFromEnvs = (env, envExample) =>
  getObjKeys(envExample)
    .filter(key => {
      const envHasKey = Object.getOwnPropertyNames(env).includes(key);
      const keyValue = envExample[key];
      return keyValue && envHasKey;
    })
    .map(key => ({ [key]: envExample[key] }));

const removeStaleVarsFromEnv = (env, vars) => {
  let envCopy = { ...env };
  envCopy = emptyObjProps(envCopy);
  vars.forEach(envObj => {
    const [key] = Object.keys(envObj);
    if (envCopy[key]) delete envCopy[key];
    envCopy = { ...envCopy, ...envObj };
  });

  return envCopy;
};

const keepEnvsInSync = (env, envExample) => {
  const envObj = { ...env };
  const uniqueVars = getUniqueVarsFromEnvs(envObj, envExample);

  return removeStaleVarsFromEnv(envObj, uniqueVars);
};

const sync = (envPath, envExamplePath) => {
  const syncedEnv = keepEnvsInSync(
    parseEnv(envPath, { emptyLines: true }),
    parseEnv(envExamplePath)
  );
  writeToExampleEnv(envExamplePath, syncedEnv);
};

const watchAndSync = (envPath, envExamplePath) => {
  fs.watchFile(envPath, () => sync(envPath, envExamplePath));
};

const dotenvSync = (filename = DEFAULT_EXAMPLE_ENV_FILENAME) => {
  const EXAMPLE_ENV_PATH = resolve(process.cwd(), filename);
  if (!fileExists(EXAMPLE_ENV_PATH)) {
    writeToExampleEnv(
      DEFAULT_EXAMPLE_ENV_FILENAME,
      emptyObjProps(parseEnv(ENV_PATH))
    );
  } else sync(ENV_PATH, EXAMPLE_ENV_PATH);

  watchAndSync(ENV_PATH, EXAMPLE_ENV_PATH);
};

export default dotenvSync;
