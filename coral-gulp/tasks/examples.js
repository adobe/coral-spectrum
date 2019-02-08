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
  const modifyFile = require('gulp-modify-file');
  const plumber = require('gulp-plumber');
  const rename = require('gulp-rename');
  const regExp = /\.\.\/dist/g;
  
  gulp.task('playground', function() {
    return gulp.src([
      'coral-component-playground/dist/**/*', 'coral-component-playground/examples/index.html'
    ], {base: './coral-component-playground'})
      .pipe(plumber())
      .pipe(modifyFile((content, path) => {
        // Replace coralui.js and coralui.css paths
        if (path.split('/').pop() === 'index.html') {
          content = `${content.replace(regExp, 'dist')}`;
        }
      
        return content;
      }))
      .pipe(rename(function(file) {
        // Put playground under /build/playground
        if (file.dirname === 'examples') {
          file.dirname = '.';
        }
      }))
      .pipe(gulp.dest('./dist/playground'));
  });
  
  gulp.task('examples', function() {
    return gulp.src([
      'coral-*/examples/index.html', 'examples/index.html'
    ], {base: './'})
      .pipe(plumber())
      .pipe(modifyFile((content, path) => {
        // Replace coralui.js and coralui.css paths
        if (path.split('/').pop() === 'index.html') {
          content = `${content.replace(regExp, '..')}`;
        }
        
        // Replace component example path
        if (path.indexOf('coral/examples/index.html')) {
          content = `${content.replace("'../' + component + '/examples/index.html'", "component + '.html'")}`;
        }
        
        return content;
      }))
      .pipe(rename(function(file) {
        const dirNameArr = file.dirname.split('/');
        
        // Rename example file using component name
        if (dirNameArr.length > 1) {
          // Components
          file.basename = dirNameArr[0];
        }
        else {
          // Root
          file.basename = 'index';
        }
        
        // Put all examples under /examples
        file.dirname = './dist/examples';
      }))
      .pipe(gulp.dest('./'));
  });
};
