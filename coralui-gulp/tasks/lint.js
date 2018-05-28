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
  const eslint = require('gulp-eslint');
  const util = require('../helpers/util');
  
  let src = 'src/scripts/**/*.js';
  
  // Lint all components if we're in the top level builder
  if (util.isTLB()) {
    src = `coralui-*/${src}`;
  }
  
  gulp.task('lint', function() {
    return gulp.src(src)
      .pipe(plumber())
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  });
};
