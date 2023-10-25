import Ajv from "ajv"
import fs from 'node:fs'
import path from 'node:path'

const ajv = new Ajv({ allErrors: true, strict: false })
const basePath = path.join(__dirname, '..', 'schemas');

const schema = fs.readFileSync(path.join(basePath, 'jsonConfig.json'), { encoding: 'utf-8' });

const validate = ajv.compile(JSON.parse(schema))

for (const fileName of ['testJsonConfig.json', 'testJSONConfigPanel.json']) {
    const content = fs.readFileSync(path.join(basePath, fileName), { encoding: 'utf-8' });
    const config = JSON.parse(content);
    const valid = validate(config);

    if (!valid) {
        const errors = validate.errors!.map(entry => JSON.stringify(entry, null, 2))
        console.error((errors.join('\n')))
        console.error(`${errors.length} errors occurred on ${fileName}`)
        process.exit(1)
    }
}
