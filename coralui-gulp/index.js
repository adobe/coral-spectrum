module.exports = function(gulp) {
  'use strict';
  
  const runSequence = require('run-sequence').use(gulp);
  
  // Tasks
  require('./tasks/clean.js')(gulp);
  require('./tasks/lint.js')(gulp);
  require('./tasks/i18n.js')(gulp);
  require('./tasks/examples.js')(gulp);
  require('./tasks/docs.js')(gulp);
  require('./tasks/templates.js')(gulp);
  require('./tasks/styles.js')(gulp);
  require('./tasks/theme.js')(gulp);
  require('./tasks/resources.js')(gulp);
  require('./tasks/scripts.js')(gulp);
  require('./tasks/minify.js')(gulp);
  require('./tasks/tests.js')(gulp);
  require('./tasks/watch.js')(gulp);
  require('./tasks/release.js')(gulp);
  
  gulp.task('build', function() {
    runSequence(
      'clean',
      'styles',
      'theme',
      'resources',
      'templates',
      'scripts'
    );
  });
  
  gulp.task('dev', function() {
    runSequence(
      'clean',
      'lint',
      'styles',
      'theme',
      'resources',
      'templates',
      'scripts',
      'karma-watch',
      'watch',
      'minify',
      'examples',
      'docs'
    );
  });
  
  gulp.task('default', function() {
    runSequence(
      'clean',
      'lint',
      'styles',
      'theme',
      'resources',
      'templates',
      'scripts',
      'karma',
      'minify',
      'examples',
      'docs',
      'cleanup'
    );
  });
};
