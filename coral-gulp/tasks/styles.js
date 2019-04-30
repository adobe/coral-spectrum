module.exports = function(gulp) {
  const path = require('path');
  const plumb = require('./plumb');
  const rename = require('gulp-rename');
  const stylus = require('gulp-stylus');
  const svgImport = require('stylus-svg');
  const modifyFile = require('gulp-modify-file');
  const util = require('../helpers/util');
  const spectrumConfig = require(`../configs/spectrum.conf.js`);
  
  const root = util.getRoot();
  
  gulp.task('styles', function() {
    return gulp.src(
        ['src/styles/index.styl', path.join(root, 'coral-*/src/styles/index.styl')],
        {allowEmpty: true}
      )
      .pipe(plumb())
      .pipe(stylus({
        'include css': true,
        include: [
          path.join(root, 'node_modules')
        ],
        use: [
          svgImport()
        ]
      }))
      .pipe(modifyFile((content) => {
        // Map Spectrum selectors with Coral ones
        spectrumConfig.forEach((selectors) => {
          content = content.replace(selectors.spectrum, selectors.coral);
        });
        
        // Remove topdoc comments
        content = content.replace(/\/\* topdoc.*[\s\S]*?\*\//g, '\n\n');
        
        return content;
      }))
      .pipe(gulp.dest(function (file) {
        return file.base;
      }));
  });
};
