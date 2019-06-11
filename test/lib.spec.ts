import fs from "fs";
import { resolve, basename } from "path";
import chai, { expect } from "chai";
import sinon, { SinonSandbox } from "sinon";
import sinonChai from "sinon-chai";
import parseEnv from "parse-dotenv";
import * as lib from "../lib/lib";

chai.use(sinonChai);

interface Callback {
	(): void;
}

const ENV_FILENAME = ".env";
const ENV_PATH = resolve(process.cwd(), ENV_FILENAME);
const SAMPLE_ENV_PATH = resolve(process.cwd(), ".env.example");
const SAMPLE_ENV_PATH_2 = resolve(process.cwd(), ".env.sample");

const createFile = (
	path: string,
	data?: string | null,
	cb: Callback = () => {}
) => {
	fs.writeFileSync(path, data, { encoding: "UTF-8" });
};

const deleteFile = (path: string) => {
	if (fs.existsSync(path)) fs.unlinkSync(path);
};

const ENV_DATA = `APP_URL=https://awesome-app.io\r\n
APP_NAME=\r\n
APP_ENV=\r\n
APP_KEY=\r\n
APP_DEBUG=\r\n
PORT=\r\n
LOG_CHANNEL=\r\n
DB_CONNECTION=\r\n
DB_HOST=\r\n
DB_PORT=\r\n
DB_DATABASE=\r\n
DB_USERNAME=\r\n
DB_PASSWORD=\r\n
OTHER_ENV=`;

describe("sync-dotenv lib", () => {
	let sandbox: SinonSandbox;

	beforeEach(() => {
		createFile(ENV_PATH, ENV_DATA);
		createFile(SAMPLE_ENV_PATH);
		sandbox = sinon.createSandbox();
	});

	afterEach(() => sandbox.restore());

	after(() => {
		deleteFile(ENV_PATH);
		deleteFile(SAMPLE_ENV_PATH);
	});

	describe("fileExists()", () => {
		it("fails to find .env file", () => {
			deleteFile(ENV_PATH);
			expect(lib.fileExists(ENV_PATH)).equals(false);
		});

		it("finds .env file", () => {
			expect(lib.fileExists(ENV_PATH)).equals(true);
		});
	});

	describe("getObjKeys", () => {
		it("get object keys", () => {
			expect(lib.getObjKeys({ a: 1, b: 2 })).to.deep.equals(["a", "b"]);
		});
	});

	describe("writeToSampleEnv()", () => {
		beforeEach(() => createFile(ENV_PATH, ENV_DATA));

		it("writes to a .env.example successfully", (done) => {
			lib.writeToSampleEnv(SAMPLE_ENV_PATH, parseEnv(ENV_PATH));
			setTimeout(() => {
				expect(parseEnv(SAMPLE_ENV_PATH)).to.have.deep.property("PORT");
				done();
			}, 500);
		});

		it("failed to write a .env.example successfully", () => {
			const message = "Failed to write to file";
			sandbox.stub(fs, "writeFile").callsArgWith(2, { message });
			try {
				lib.writeToSampleEnv(SAMPLE_ENV_PATH, parseEnv(ENV_PATH));
			} catch (error) {
				expect(error.message).contains(message);
			}
		});
	});

	describe("emptyObjProps()", () => {
		it("remove object property values", () => {
			const obj = { foo: "bar" };
			expect(lib.emptyObjProps(obj)).to.have.deep.property("foo", "");
		});
	});

	describe("getUniqueVarsFromEnv()", () => {
		it("remove object property values", () => {
			const envObj = { name: "angry" };
			const exampleEnvObj = { foo: "bar", name: "bird" };
			const uniqueVarsArr = lib.getUniqueVarsFromEnvs(envObj, exampleEnvObj);

			expect(uniqueVarsArr.length).equals(1);
			expect(uniqueVarsArr[0]).to.have.deep.property("name", "bird");
		});
	});

	describe("removeStaleVarsFromEnv()", () => {
		it("remove object property values", () => {
			const envObj = {
				APP_NAME: "awesomeapp",
				APP_URL: "https://awesomeapp.io"
			};
			const exampleEnvObj = {
				foo: "bar",
				APP_URL: "https://localhost:3000"
			};
			const varsObj = lib.getUniqueVarsFromEnvs(envObj, exampleEnvObj);
			const latestVars = lib.removeStaleVarsFromEnv(envObj, varsObj);

			expect(latestVars).to.have.deep.property("APP_NAME", "");
			expect(latestVars).to.have.deep.property(
				"APP_URL",
				exampleEnvObj.APP_URL
			);
			expect(latestVars).to.not.have.deep.property("foo");
		});
	});

	describe("getParsedEnvs()", () => {
		it("gets result of two envs parsed", () => {
			const envObj = {
				PORT: "5439"
			};
			const parsedEnvsResult = lib.getParsedEnvs(envObj, {});
			expect(parsedEnvsResult).to.have.deep.property("PORT", "");
		});
	});

	describe("syncWithExampleEnv()", () => {
		it("sync .env with example env", () => {
			createFile(ENV_PATH, ENV_DATA);

			const writeToExampleEnvSpy = sandbox.spy(lib, "writeToSampleEnv");

			lib.syncWithSampleEnv(ENV_PATH, SAMPLE_ENV_PATH);

			expect(writeToExampleEnvSpy).callCount(1);
		});
	});

	describe("syncEnv", () => {
		before(() => createFile(SAMPLE_ENV_PATH_2));
		after(() => deleteFile(SAMPLE_ENV_PATH_2));

		it("fails to sync with source (.env) file", () => {
			lib
				.syncEnv(".env")
				.catch(error =>
					expect(error.message).equals("Cannot sync .env with .env")
				);
		});

		it("fails when .env is not found in project root", () => {
			deleteFile(ENV_PATH);
			lib
				.syncEnv()
				.catch(error => expect(error.message).equals(".env doesn't exists"));
		});

		it("throw error for missing sample env", () => {
			deleteFile(SAMPLE_ENV_PATH);
			lib.syncEnv().catch(error => {
				expect(error.message).equals(`.env.example not found`);
			});
		});

		it("throw error for missing sample env", () => {
			const sampleEnv = ".env.foo";
			lib.syncEnv(sampleEnv).catch(error => {
				expect(error.message).equals(`${sampleEnv} not found`);
			});
		});

		it("uses existing sample env if available", () => {
			const spy = sandbox.spy(lib, "syncWithSampleEnv");
			lib.syncEnv();
			expect(spy).callCount(1);
		});

		it('should error out if provided regex matched no files', async () => {
			const pattern = 'env/invalid/*';
			await lib.syncEnv(undefined, undefined, pattern).catch(error => {
				expect(error.message).to.equal(`${pattern} did not match any file`);
			});
		});

		it('syncs multiple sample env files', () => {
			const spy = sandbox.spy(lib, "syncWithSampleEnv");
			lib.syncEnv(undefined, undefined, ".env.*");
			expect(spy).callCount(2);
		});

		it("strips all empty line entries", () => {
			createFile(ENV_FILENAME, ENV_DATA);
			const parsedEnv = parseEnv(ENV_FILENAME, { emptyLines: true });

			const envString = lib.envToString(parsedEnv);
			const emptyLines = Object.keys(parsedEnv).filter(key =>
				key.startsWith("__EMPTYLINE")
			).length;

			if (emptyLines > 9) {
				expect(envString.includes("__EMPTYLINE_")).to.be.false;
			}
		});

		it("error for invalid env source", () => {
			const env = "foo/.env";
			lib.syncEnv("", env).catch(({ message }) => {
				expect(message).equals(`${env} not found`);
			});
		});

		it("syncs with provided source", () => {
			lib.syncEnv(undefined, ".env").then((sampleEnv: any) => {
				expect(basename(sampleEnv)).equals(".env.example");
			});
		});
	});
});
