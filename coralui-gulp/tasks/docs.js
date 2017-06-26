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
  var path = require('path');
  var runSequence = require('run-sequence').use(gulp);
  var jsdoc = require('gulp-jsdoc3');
  
  var resourcesPath = path.resolve(path.join('node_modules', '@coralui', 'coralui-guide-resources'));
  var templatePath = path.join(resourcesPath, 'jsdoc-templates');
  
  var config = {
    opts: {
      template: templatePath,
      destination: 'build/documentation/',
      'private': false
    },
    plugins: [],
    tags: {
      allowUnknownTags: true
    }
  };
  
  gulp.task('docs-copy-css', function() {
    return gulp.src(resourcesPath + '/css/**/*')
      .pipe(gulp.dest('build/documentation/styles/'));
  });
  
  gulp.task('docs-copy-js', function() {
    return gulp.src(resourcesPath + '/js/**/*')
      .pipe(gulp.dest('build/documentation/scripts/'));
  });
  
  gulp.task('docs-jsdoc', function() {
    return gulp.src([
      './src/scripts/**/*.js',
      './node_modules/coralui-*/src/**/*.js'
    ], {read: false})
      .pipe(jsdoc(config));
  });
  
  gulp.task('docs', function() {
    runSequence(
      ['docs-copy-css', 'docs-copy-js'],
      'docs-jsdoc'
    );
  });
};
