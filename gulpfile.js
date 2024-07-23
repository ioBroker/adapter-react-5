/**
 * Copyright 2018-2024 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
'use strict';

const gulp  = require('gulp');
const fs = require('node:fs');
const cp = require('node:child_process');

function npmInstall(dir) {
    dir = dir || `${__dirname}/`;
    return new Promise((resolve, reject) => {
        // Install node modules
        const cwd = dir.replace(/\\/g, '/');

        const cmd = `npm install -f`;
        console.log(`"${cmd} in ${cwd}`);

        // System call used for update of js-controller itself,
        // because during the installation of the npm packet will be deleted too, but some files must be loaded even during the installation process.
        const child = cp.exec(cmd, {cwd});

        child.stderr.pipe(process.stderr);
        child.stdout.pipe(process.stdout);

        child.on('exit', (code /* , signal */) => {
            // code 1 is a strange error that cannot be explained. Everything is installed but error :(
            if (code && code !== 1) {
                reject(`Cannot install: ${code}`);
            } else {
                console.log(`"${cmd} in ${cwd} finished.`);
                // command succeeded
                resolve();
            }
        });
    });
}

gulp.task('npm', () => {
    if (fs.existsSync(`${__dirname}/src/node_modules`)) {
        return Promise.resolve();
    } else {
        return npmInstall();
    }
});

gulp.task('copy', () => Promise.all([
    gulp.src(['src/**/*.d.ts']).pipe(gulp.dest('dist')),
    gulp.src(['src/vendor/*.*']).pipe(gulp.dest('dist/vendor')),
    gulp.src(['src/assets/*.*', '!parseNames.js']).pipe(gulp.dest('dist/assets')),
    gulp.src(['README.md']).pipe(gulp.dest('dist')),
    gulp.src(['LICENSE']).pipe(gulp.dest('dist')),
    gulp.src(['src/*.css']).pipe(gulp.dest('dist')),
    gulp.src(['src/Components/*.css']).pipe(gulp.dest('dist/Components')),
    gulp.src(['src/Components/**/*.css']).pipe(gulp.dest('dist/Components')),
    gulp.src(['src/Components/assets/*.*']).pipe(gulp.dest('dist/Components/assets')),
    gulp.src(['src/assets/devices/*.*', '!src/assets/devices/parseNames.js', '!src/assets/devices/list.json', '!src/assets/devices/names.txt']).pipe(gulp.dest('dist/assets/devices')),
    gulp.src(['src/assets/rooms/*.*', '!src/assets/rooms/parseNames.js', '!src/assets/rooms/list.json', '!src/assets/rooms/names.txt']).pipe(gulp.dest('dist/assets/rooms')),
    gulp.src(['craco-module-federation.js']).pipe(gulp.dest('dist')),
    gulp.src(['modulefederation.admin.config.js']).pipe(gulp.dest('dist')),
    new Promise(resolve => {
        const package_ = require('./package.json');
        const packageSrc = require('./src/package.json');
        packageSrc.version = package_.version;
        packageSrc.dependencies = package_.dependencies;
        !fs.existsSync(`${__dirname}/dist`) && fs.mkdirSync(`${__dirname}/dist`);
        fs.writeFileSync(`${__dirname}/dist/package.json`, JSON.stringify(packageSrc, null, 2));
        resolve();
    })
]));

gulp.task('patchReadme', async () => {
    const pack = require('./package.json');
    let readme = fs.readFileSync(`${__dirname}/README.md`).toString('utf8');
    readme = readme.replace(/"@iobroker\/adapter-react": "\^\d\.\d\.\d",/g, `"@iobroker/adapter-react": "^${pack.version}",`);
    fs.writeFileSync(`${__dirname}/README.md`, readme);
});

gulp.task('compile', gulp.parallel('copy',
    () => Promise.all([
        gulp.src(['src/*/*.tsx', 'src/*/*.css', '!src/assets/devices/parseNames.js'])
            .pipe(gulp.dest('dist/src')),
        gulp.src(['src/*.tsx', 'src/*.css'])
            .pipe(gulp.dest('dist/src')),

        gulp.src(['src/i18n/*.json'])
            .pipe(gulp.dest('dist/i18n')),
    ])
));

gulp.task('default', gulp.series('npm', 'compile', 'patchReadme'));
