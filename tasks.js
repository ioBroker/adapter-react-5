/**
 * Copyright 2018-2024 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 */
const { writeFileSync, readFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } = require('node:fs');
const { copyFiles, deleteFoldersRecursive } = require('@iobroker/build-tools');
const { dirname } = require('node:path');

function patchFiles() {
    const pack = require('./package.json');
    let readme = readFileSync(`${__dirname}/README.md`).toString('utf8');
    readme = readme.replace(
        /"@iobroker\/adapter-react-v5": "\^\d\.\d\.\d",/g,
        `"@iobroker/adapter-react-v5": "^${pack.version}",`,
    );
    writeFileSync(`${__dirname}/README.md`, readme);
}

function createIconSets(folder, destFile) {
    const files = readdirSync(folder).filter(file => file.endsWith('.svg'));
    const result = {};
    for (let f = 0; f < files.length; f++) {
        let data = readFileSync(`${folder}/${files[f]}`).toString('utf8');
        result[files[f].replace('.svg', '')] = Buffer.from(data).toString('base64');
    }
    existsSync(dirname(destFile)) || mkdirSync(dirname(destFile), { recursive: true });
    writeFileSync(destFile, JSON.stringify(result));
}

function copyAllFiles() {
    try {
        copyFiles(['src/*.d.ts'], 'dist');
        copyFiles(
            ['src/assets/lamp_ceiling.svg', 'src/assets/lamp_table.svg', 'src/assets/no_icon.svg'],
            'dist/assets',
        );
        copyFiles(['README.md', 'LICENSE'], 'dist');
        copyFileSync('tasksExample.js', 'dist/tasks.js');
        copyFiles(['src/*.css'], 'dist');
        // copyFiles(
        //     [
        //         'src/assets/devices/*.*',
        //         '!src/assets/devices/parseNames.js',
        //         '!src/assets/devices/list.json',
        //         '!src/assets/devices/names.txt',
        //     ],
        //     'dist/assets/devices',
        // );
        // copyFiles(
        //     [
        //         'src/assets/rooms/*.*',
        //         '!src/assets/rooms/parseNames.js',
        //         '!src/assets/rooms/list.json',
        //         '!src/assets/rooms/names.txt',
        //     ],
        //     'dist/assets/rooms',
        // );
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
    !existsSync(`${__dirname}/dist`) && mkdirSync(`${__dirname}/dist`);
    writeFileSync(`${__dirname}/dist/package.json`, JSON.stringify(packageSrc, null, 2));
}
if (process.argv.find(arg => arg === '--0-clean')) {
    deleteFoldersRecursive('dist');
} else if (process.argv.find(arg => arg === '--2-copy')) {
    createIconSets('src/assets/devices', 'src/assets/devices.json');
    createIconSets('src/assets/rooms', 'src/assets/rooms.json');
    copyAllFiles();
} else if (process.argv.find(arg => arg === '--3-patchReadme')) {
    patchFiles();
} else {
    deleteFoldersRecursive('dist');
    createIconSets('src/assets/devices', 'dist/assets/devices.json');
    createIconSets('src/assets/rooms', 'dist/assets/rooms.json');
    copyAllFiles();
    patchFiles();
}
