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
  const plumber = require('gulp-plumber');
  const domly = require('gulp-domly');
  const modifyFile = require('gulp-modify-file');
  const util = require('../helpers/util');
  
  gulp.task('templates', function() {
    return gulp.src(['src/templates/*.html', path.join(util.getRoot(), 'coral-*/src/templates/*.html')])
      .pipe(plumber())
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
