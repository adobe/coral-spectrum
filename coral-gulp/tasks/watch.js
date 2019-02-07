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
  const runSequence = require('run-sequence').use(gulp);
  const server = require('gulp-server-livereload');
  const util = require('gulp-util');
  const root = require('../helpers/util').getRoot();
  
  gulp.task('build+watch', function() {
    runSequence(
      'styles',
      'resources',
      'templates',
      'scripts'
    );
  });
  
  gulp.task('watch', function() {
    gulp.watch([
      path.join(root, 'coral-*/index.js'),
      path.join(root, 'coral-*/libs/**'),
      path.join(root, 'coral-*/data/**',),
      path.join(root, 'coral-*/polyfills/**'),
      path.join(root, 'coral-*/src/scripts/**/*.js'),
      path.join(root, 'coral-*/src/templates/**/*.html'),
      path.join(root, 'coral-*/src/styles/**/*.styl'),
      path.join(root, 'coral-theme-spectrum/**/*.styl'),
    ], ['build+watch']);
    
    return gulp.src('./')
      .pipe(server({
        host: util.env.host || 'localhost',
        port: 9001,
        livereload: false,
        directoryListing: true
      }));
  });
};
