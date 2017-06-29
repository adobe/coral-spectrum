/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
module.exports = function(gulp) {
  const plumber = require('gulp-plumber');
  // const jshint = require('gulp-jshint');
  const eslint = require('gulp-eslint');
  
  gulp.task('lint', function() {
    return gulp.src('src/scripts/**/*.js')
      .pipe(plumber())
      // todo eslint config
      .pipe(eslint())
      .pipe(eslint.format())
      // .pipe(jshint({
      //   linter: 'jshint',
      //   esversion: 6,
      //   curly: true,
      //   noempty: true,
      //   quotmark: 'single',
      //   indent: 2,
      //   eqeqeq: true,
      //   immed: true,
      //   latedef: 'nofunc',
      //   newcap: true,
      //   noarg: true,
      //   proto: true,
      //   sub: true,
      //   strict: true,
      //   undef: true,
      //   unused: 'vars',
      //   camelcase: true,
      //   boss: true,
      //   browser: true,
      //   smarttabs: true,
      //   globals: {
      //     require: true,
      //     module: true,
      //     $: true,
      //     jQuery: true,
      //     Coral: true,
      //     console: true,
      //     moment: true,
      //     WeakMap: true
      //   }
      // }))
      // .pipe(jshint.reporter('default'))
      // .pipe(jshint.reporter('fail'));
  });
};
