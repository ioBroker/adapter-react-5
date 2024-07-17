import Ajv from 'ajv';
import fs from 'node:fs';
import path from 'node:path';

const ajv = new Ajv({ allErrors: true, strict: false });
const basePath = path.join(__dirname, '..', 'schemas');

const schema = fs.readFileSync(path.join(basePath, 'jsonConfig.json'), { encoding: 'utf-8' });

const validate = ajv.compile(JSON.parse(schema));

/**
 * Tests which need to be passed
 */
function positiveTests(): void {
    for (const fileName of ['testJsonConfig.json', 'testJSONConfigPanel.json']) {
        const content = fs.readFileSync(path.join(basePath, fileName), { encoding: 'utf-8' });
        const config = JSON.parse(content);
        const valid = validate(config);

        if (!valid) {
            const errors = validate.errors!.map(entry => JSON.stringify(entry, null, 2));
            console.error((errors.join('\n')));
            console.error(`${errors.length} errors occurred on ${fileName}`);
            process.exit(1);
        }
    }
}

/** Expected errors per test */
const expectedErrorsPerTest = {
    'testFailJsonConfig.json':  [
        {
            instancePath: '/items/demoTab/items/myTable/items/2',
            schemaPath: '#/items/allOf/17/then/additionalProperties',
            keyword: 'additionalProperties',
            params: {
                additionalProperty: 'test',
            },
            message: 'must NOT have additional properties',
        },
        {
            instancePath: '/items/demoTab/items/myTable/items/2',
            schemaPath: '#/items/allOf/17/if',
            keyword: 'if',
            params: {
                failingKeyword: 'then',
            },
            message: 'must match "then" schema',
        },
        {
            instancePath: '/items/demoTab/items/myTable',
            schemaPath: '#/patternProperties/%5E.%2B/allOf/24/if',
            keyword: 'if',
            params: {
                failingKeyword: 'then',
            },
            message: 'must match "then" schema',
        },
        {
            instancePath: '/items/demoTab',
            schemaPath: '#/properties/items/patternProperties/%5E.%2B/allOf/8/if',
            keyword: 'if',
            params: {
                failingKeyword: 'then',
            },
            message: 'must match "then" schema',
        },
        {
            instancePath: '',
            schemaPath: '#/if',
            keyword: 'if',
            params: {
                failingKeyword: 'then',
            },
            message: 'must match "then" schema',
        },
    ],
    'testFailJsonConfigPanel.json': [
        {
            instancePath: '',
            schemaPath: '#/else/additionalProperties',
            keyword: 'additionalProperties',
            params: {
                additionalProperty: 'iconPosition',
            },
            message: 'must NOT have additional properties',
        },
        {
            instancePath: '',
            schemaPath: '#/if',
            keyword: 'if',
            params: {
                failingKeyword: 'else',
            },
            message: 'must match "else" schema',
        },
    ],
} as const;

/**
 * Tests which should be failed
 */
function failingTests(): void {
    for (const fileName of ['testFailJsonConfig.json', 'testFailJsonConfigPanel.json'] as const) {
        const content = fs.readFileSync(path.join(basePath, fileName), { encoding: 'utf-8' });
        const config = JSON.parse(content);
        const valid = validate(config);

        if (valid) {
            console.error(`Schema validation was successful at ${fileName}, but a fail was expected`);
            process.exit(1);
        }

        const expectedErrors = expectedErrorsPerTest[fileName];

        if (JSON.stringify(expectedErrors) !== JSON.stringify(validate.errors)) {
            console.error(`Got different errors than expected on file ${fileName}`);
            console.error(`Expected ${JSON.stringify(expectedErrors, null, 2)}`);
            console.error(`Got ${JSON.stringify(validate.errors, null, 2)}`);
            process.exit(1);
        }
    }

    console.log('Tests successful!');
}

positiveTests();
failingTests();
