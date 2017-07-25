/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
module.exports = function(gulp) {
  const plumber = require('gulp-plumber');
  const domly = require('gulp-domly');
  const defineModule = require('gulp-define-module');
  
  gulp.task('templates', function() {
    return gulp.src(['src/templates/*.html', 'node_modules/coralui-*/src/templates/*.html'])
      .pipe(plumber())
      .pipe(domly({
        compilerOptions: {
          noFrags: true, // Don't cache DocumentFragments, it messes with custom elements
          preserveHandleAttr: true, // Leave handle='whatever' in the output
          appendClassNames: true // Do className += 'whatever' instead of overwriting it
        }
      }))
      .pipe(defineModule('es6', {
        wrapper: 'template; let template = <%= contents %>'
      }))
      .pipe(gulp.dest(function (file) {
        return file.base;
      }));
  });
};
