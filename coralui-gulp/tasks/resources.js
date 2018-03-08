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
  const rename = require('gulp-rename');
  const util = require('../helpers/util');
  
  gulp.task('resources', function() {
    return gulp.src([
      'src/resources/**/*',
      path.join(util.getRoot(), 'coralui-theme-spectrum/src/resources/**/*'),
    ])
      .pipe(plumber())
      .pipe(rename(function (file) {
        file.dirname = path.join('resources', file.dirname);
      }))
      .pipe(gulp.dest('build'));
  });
};
