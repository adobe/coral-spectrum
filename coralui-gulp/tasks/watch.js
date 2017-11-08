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
  const runSequence = require('run-sequence').use(gulp);
  const server = require('gulp-server-livereload');
  
  gulp.task('build+watch', function() {
    runSequence(
      'styles',
      'theme',
      'resources',
      'templates',
      'scripts',
      'cleanup'
    );
  });
  
  gulp.task('watch', function() {
    gulp.watch([
      'src/templates/*.html',
      'src/styles/*.styl',
      'src/scripts/*.js',
      'src/resources/**/*',
      'index.js'
    ], ['build+watch']);
  
    return gulp.src('./')
      .pipe(server({
        port: 9001,
        livereload: false,
        directoryListing: true
      }));
  });
};
