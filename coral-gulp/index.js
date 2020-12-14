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

module.exports = function (gulp) {
  // Tasks
  require('./tasks/clean.js')(gulp);
  require('./tasks/lint.js')(gulp);
  require('./tasks/axe.js')(gulp);
  require('./tasks/examples.js')(gulp);
  require('./tasks/docs.js')(gulp);
  require('./tasks/deploy.js')(gulp);
  require('./tasks/templates.js')(gulp);
  require('./tasks/styles.js')(gulp);
  require('./tasks/scripts.js')(gulp);
  require('./tasks/minify.js')(gulp);
  require('./tasks/tests.js')(gulp);
  require('./tasks/watch.js')(gulp);
  require('./tasks/release.js')(gulp);

  gulp.task('build',
    gulp.series(
      gulp.parallel('clean', 'lint'),
      gulp.parallel('styles', 'templates'),
      'scripts'
    )
  );

  gulp.task('test',
    gulp.series(
      gulp.parallel('clean', 'lint'),
      gulp.parallel('styles', 'templates'),
      'karma'
    )
  );

  gulp.task('dev',
    gulp.series(
      gulp.parallel('clean', 'lint'),
      gulp.parallel('styles', 'templates'),
      'karma',
      'scripts',
      'watch'
    )
  );

  gulp.task('default',
    gulp.series(
      'build',
      'watch'
    )
  );
};
