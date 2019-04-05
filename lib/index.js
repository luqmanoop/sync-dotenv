import { resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const ENV_PATH = resolve(process.cwd(), '.env');
const EXAMPLE_ENV = '.env.example';

const fileExists = path => fs.existsSync(path);

const getKeys = obj => Object.keys(obj);

const envToString = parsed =>
  getKeys(parsed)
    .map(key => `${key}=${parsed[key] || ''}`)
    .join('\r\n');

const writeToExampleEnv = (path, parsedEnv) => {
  fs.writeFile(path, envToString(parsedEnv), err => {
    if (err) console.log('failed to write to example env');
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
  getKeys(envExample)
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

const parseEnv = path => dotenv.config({ path }).parsed;

const sync = (envPath, envExamplePath) => {
  const parsedEnv = parseEnv(envPath);
  const exampleEnvs = parseEnv(envExamplePath);
  const syncedEnv = keepEnvsInSync(parsedEnv, exampleEnvs);

  writeToExampleEnv(envExamplePath, syncedEnv);
};

const watchAndSync = (envPath, envExamplePath) => {
  fs.watchFile(envPath, () => sync(envPath, envExamplePath));
};

const dotenvSync = (filename = EXAMPLE_ENV) => {
  if (!dotenv) return;
  const EXAMPLE_ENV_PATH = resolve(process.cwd(), filename);
  if (!fileExists(EXAMPLE_ENV_PATH)) {
    writeToExampleEnv(EXAMPLE_ENV, emptyObjProps(parseEnv(ENV_PATH)));
  } else sync(ENV_PATH, EXAMPLE_ENV_PATH);

  watchAndSync(ENV_PATH, EXAMPLE_ENV_PATH);
};

export default dotenvSync;
