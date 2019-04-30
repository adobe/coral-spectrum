module.exports = function(gulp) {
  const path = require('path');
  const plumb = require('./plumb');
  const rollup = require('rollup').rollup;
  const cleanCSS = require('gulp-clean-css');
  const rename = require('gulp-rename');
  const rollupConfig = require('../configs/rollup.conf.js')({min: true});
  
  gulp.task('minify-css', function() {
    return gulp.src(['dist/css/coral.css'])
      .pipe(plumb())
      .pipe(cleanCSS({
        compatibility: 'ie11'
      }))
      .pipe(rename({
        dirname: 'css',
        basename: 'coral.min'
      }))
      .pipe(gulp.dest('./dist'));
  });
  
  gulp.task('minify-js', async function(done) {
    const bundle = await rollup({
      input: 'index.js',
      plugins: rollupConfig
    });
  
    await bundle.write({
      file: './dist/js/coral.min.js',
      format: 'iife',
      name: 'Coral',
      sourcemap: true
    });
  
    done();
  });
};
