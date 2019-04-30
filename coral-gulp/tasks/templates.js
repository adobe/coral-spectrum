module.exports = function(gulp) {
  const path = require('path');
  const plumb = require('./plumb');
  const domly = require('gulp-domly');
  const modifyFile = require('gulp-modify-file');
  const util = require('../helpers/util');
  
  gulp.task('templates', function() {
    return gulp.src(
        ['src/templates/*.html', path.join(util.getRoot(), 'coral-*/src/templates/*.html')],
        {allowEmpty: true}
      )
      .pipe(plumb())
      .pipe(domly({
        compilerOptions: {
          noFrags: true, // Don't cache DocumentFragments, it messes with custom elements
          preserveHandleAttr: true, // Leave handle='whatever' in the output
          appendClassNames: true // Do className += 'whatever' instead of overwriting it
        }
      }))
      .pipe(modifyFile((content) => {
        return `const template = ${content};\nexport default template;`;
      }))
      .pipe(gulp.dest(function (file) {
        return file.base;
      }));
  });
};
