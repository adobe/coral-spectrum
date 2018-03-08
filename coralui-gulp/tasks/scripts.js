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
  const path = require('path');
  const plumber = require('gulp-plumber');
  const sourceMaps = require('gulp-sourcemaps');
  const rollup = require('gulp-better-rollup');
  const rollupConfig = require('../configs/rollup.conf.js');
  const rename = require('gulp-rename');
  
  gulp.task('scripts', function() {
    return gulp.src('index.js')
      .pipe(plumber())
      .pipe(sourceMaps.init())
      .pipe(rollup({
        moduleName: 'Coral',
        plugins: rollupConfig.plugins
      }, 'iife'))
      .pipe(sourceMaps.write())
      .pipe(rename({
        dirname: 'js',
        basename: 'coral'
      }))
      .pipe(gulp.dest('./build'));
  });
};
