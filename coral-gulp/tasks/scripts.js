/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
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
      .pipe(sourceMaps.init({largeFile: true}))
      .pipe(rollup({
        moduleName: 'Coral',
        plugins: rollupConfig.plugins
      }, 'iife'))
      .pipe(sourceMaps.write('.', {
        sourceMappingURL: () => {
          return 'coral.map';
        }
      }))
      .pipe(rename({
        dirname: 'js',
        basename: 'coral'
      }))
      .pipe(gulp.dest('./dist'));
  });
};
