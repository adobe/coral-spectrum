/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
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
    ], gulp.series(gulp.parallel('styles', 'templates'), 'scripts'));
  });
  
  gulp.task('server', function(done) {
    spawn('npx http-server -p 9001 -c-1', [], {shell: true, stdio: 'inherit'});
    done();
  });
  
  gulp.task('watch',
    gulp.parallel('watch-files', 'server')
  );
};
