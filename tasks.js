/**
 * Copyright 2018-2024 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
const fs = require('node:fs');
const { npmInstall, copyFiles } = require('@iobroker/build-tools');

function patchFiles() {
    const pack = require('./package.json');
    let readme = fs.readFileSync(`${__dirname}/README.md`).toString('utf8');
    readme = readme.replace(/"@iobroker\/adapter-react": "\^\d\.\d\.\d",/g, `"@iobroker/adapter-react": "^${pack.version}",`);
    fs.writeFileSync(`${__dirname}/README.md`, readme);
}

function copyAllFiles() {
    try {
        copyFiles(['src/**/*.d.ts'], 'dist');
        copyFiles(['src/assets/*.*', '!parseNames.js'], 'dist/assets');
        copyFiles(['README.md'], 'dist');
        copyFiles(['LICENSE'], 'dist');
        copyFiles(['src/*.css'], 'dist');
        copyFiles(['src/Components/*.css'], 'dist/Components');
        copyFiles(['src/Components/**/*.css'], 'dist/Components');
        copyFiles(['src/Components/assets/*.*'], 'dist/Components/assets');
        copyFiles(['src/assets/devices/*.*', '!src/assets/devices/parseNames.js', '!src/assets/devices/list.json', '!src/assets/devices/names.txt'], 'dist/assets/devices');
        copyFiles(['src/assets/rooms/*.*', '!src/assets/rooms/parseNames.js', '!src/assets/rooms/list.json', '!src/assets/rooms/names.txt'], 'dist/assets/rooms');
        copyFiles(['craco-module-federation.js'], 'dist');
        copyFiles(['modulefederation.admin.config.js'], 'dist');
        copyFiles(['src/*/*.tsx', 'src/*/*.css', '!src/assets/devices/parseNames.js'], 'dist/src');
        copyFiles(['src/*.tsx', 'src/*.css'], 'dist/src');
        copyFiles(['src/i18n/*.json'], 'dist/i18n');
    } catch (e) {
        console.error(`Cannot copy files: ${e}`);
        process.exit(1);
    }

    const package_ = require('./package.json');
    const packageSrc = require('./src/package.json');
    packageSrc.version = package_.version;
    packageSrc.dependencies = package_.dependencies;
    !fs.existsSync(`${__dirname}/dist`) && fs.mkdirSync(`${__dirname}/dist`);
    fs.writeFileSync(`${__dirname}/dist/package.json`, JSON.stringify(packageSrc, null, 2));
}

if (process.argv.find(arg => arg === '--npm')) {
    if (!fs.existsSync(`${__dirname}/src/node_modules`)) {
        npmInstall(__dirname)
            .catch(e => {
                console.error(`Cannot install: ${e}`);
                process.exit(1);
            });
    }
} else if (process.argv.find(arg => arg === '--copy')) {
    copyAllFiles();
} else if (process.argv.find(arg => arg === '--patchReadme')) {
    patchFiles();
} else {
    if (!fs.existsSync(`${__dirname}/src/node_modules`)) {
        npmInstall(__dirname)
            .catch(e => {
                console.error(`Cannot install: ${e}`);
                process.exit(1);
            });
    }
    copyAllFiles();
    patchFiles();
}
