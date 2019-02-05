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
  const rename = require('gulp-rename');
  const minify = require('gulp-minifier');
  
  gulp.task('minify', function() {
    return gulp.src(['build/js/coral.js', 'build/css/coral.css'])
      .pipe(plumber())
      .pipe(minify({
        minify: true,
        minifyJS: true,
        minifyCSS: true,
      }))
      .pipe(rename(function(file) {
        file.dirname = path.join('build', file.extname.slice(1));
        file.extname = `.min${file.extname}`;
      }))
      .pipe(gulp.dest('.'));
  });
};
