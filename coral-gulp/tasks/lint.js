module.exports = function(gulp) {
  const plumb = require('./plumb');
  const eslint = require('gulp-eslint');
  const util = require('../helpers/util');
  
  let src = 'src/scripts/**/*.js';
  
  // Lint all components if we're in the top level builder
  if (util.isTLB()) {
    src = `coral-*/${src}`;
  }
  
  gulp.task('lint', function() {
    return gulp.src(src)
      .pipe(plumb())
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  });
};
