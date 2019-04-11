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
  const root = require('../helpers/util').getRoot();
  const spawn = require('child_process').spawn;
  
  gulp.task('watch-files', function() {
    return gulp.watch([
      path.join(root, 'coral-*/index.js'),
      path.join(root, 'coral-*/libs/**'),
      path.join(root, 'coral-*/data/**',),
      path.join(root, 'coral-*/polyfills/**'),
      path.join(root, 'coral-*/src/scripts/**/*.js'),
      path.join(root, 'coral-*/src/templates/**/*.html'),
      path.join(root, 'coral-*/src/styles/**/*.styl'),
      path.join(root, 'coral-theme-spectrum/**/*.styl'),
    ], gulp.series('styles', 'resources', 'templates', 'scripts'));
  });
  
  gulp.task('server', function(done) {
    spawn('npx http-server -p 9001 -c-1', [], {shell: true, stdio: 'inherit'});
    done();
  });
  
  gulp.task('watch',
    gulp.parallel('watch-files', 'server')
  );
};
