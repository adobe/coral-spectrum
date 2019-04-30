module.exports = function(gulp) {
  
  const path = require('path');
  const ghPages = require('gulp-gh-pages');
  const plumb = require('./plumb')
  const PluginError = require('plugin-error');
  const util = require('../helpers/util');
  
  gulp.task('deploy', (done) => {
    if (!util.isTLB()) {
      done(new PluginError('deploy', 'Deploy aborted: not in root folder.'));
    }
    
    return gulp.src('./dist/**/*', {base: '.'})
      .pipe(plumb())
      .pipe(ghPages({
        message: `CORAL-0: deploy ${util.getPackageJSON().version}`
      }));
  });
};
