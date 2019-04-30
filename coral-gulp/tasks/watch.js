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
