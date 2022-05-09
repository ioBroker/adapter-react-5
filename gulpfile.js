/**
 * Copyright 2018-2022 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
'use strict';

const gulp  = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');
const fs = require('fs');

gulp.task('copy', () => Promise.all([
    gulp.src(['src/**/*.d.ts']).pipe(gulp.dest('dist')),
    gulp.src(['src/vendor/*.*']).pipe(gulp.dest('dist/vendor')),
    gulp.src(['src/assets/*.*']).pipe(gulp.dest('dist/assets')),
    gulp.src(['README.md']).pipe(gulp.dest('dist')),
    gulp.src(['LICENSE']).pipe(gulp.dest('dist')),
    gulp.src(['src/*.css']).pipe(gulp.dest('dist')),
    gulp.src(['src/Components/*.css']).pipe(gulp.dest('dist/Components')),
    gulp.src(['src/Components/**/*.css']).pipe(gulp.dest('dist/Components')),
    gulp.src(['src/Components/assets/*.*']).pipe(gulp.dest('dist/Components/assets')),
    gulp.src(['src/assets/devices/*.*']).pipe(gulp.dest('dist/assets/devices')),
    gulp.src(['src/assets/rooms/*.*']).pipe(gulp.dest('dist/assets/rooms')),
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

const tsProject = typescript.createProject('tsconfig.build.json');

gulp.task('typedefs', () => {
    return gulp.src(['src/**/*.js', '!src/gulpfile.js'])
        .pipe(tsProject())
        .dts
        .pipe(gulp.dest('dist'));
});

const babelOptions = {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-runtime'
    ]
};

function handleError (error) {
    console.log(error.toString());
    this.emit('end');
}

gulp.task('compile', gulp.parallel('copy',
    'typedefs',
    () => Promise.all([
        gulp.src(['src/Dialogs/*.js'])
            .pipe(sourcemaps.init())
            .pipe(babel(babelOptions))
            .on('error', handleError)
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('dist/Dialogs')),

        gulp.src(['src/icons/*.js'])
            .pipe(sourcemaps.init())
            .pipe(babel(babelOptions))
            .on('error', handleError)
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('dist/icons')),

        gulp.src(['src/*.js', '!src/gulpfile.js'])
            .pipe(sourcemaps.init())
            .pipe(babel(babelOptions))
            .on('error', handleError)
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('dist')),

        gulp.src(['src/Components/*.js', 'src/Components/**/*.js'])
            .pipe(sourcemaps.init())
            .pipe(babel({
                presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-flow'],
                plugins: [
                    '@babel/plugin-proposal-class-properties',
                    '@babel/plugin-transform-runtime'
                ]
            }))
             .on('error', handleError)
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('dist/Components')),

        gulp.src(['src/i18n/*.json'])
            .pipe(gulp.dest('dist/i18n')),
    ])
));

gulp.task('default', gulp.series('compile'));