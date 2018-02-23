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
  const rename = require('gulp-rename');
  const modifyFile = require('gulp-modify-file');
  const themeHelper = require('../helpers/theme');
  
  gulp.task('theme', function() {
    const theme = themeHelper.getTheme();
    if (theme) {
      return gulp.src('index.js')
        .pipe(plumber())
        .pipe(modifyFile((content) => {
          return `${themeHelper.addTheme()}\n${content}`;
        }))
        .pipe(rename({
          basename: 'index-themed'
        }))
        .pipe(gulp.dest('.'));
    }
    else {
      return gulp.src('index.js')
    }
  });
};
