/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

module.exports = function(gulp) {
  const modifyFile = require('gulp-modify-file');
  const plumb = require('./plumb.js');
  const rename = require('gulp-rename');
  const regExp = /\.\.\/dist/g;
  
  gulp.task('playground', function() {
    return gulp.src([
      'coral-component-playground/dist/**/*', 'coral-component-playground/examples/index.html'
    ], {base: './coral-component-playground'})
      .pipe(plumb())
      .pipe(modifyFile((content, path) => {
        // Replace coralui.js and coralui.css paths
        if (path.split('/').pop() === 'index.html') {
          content = `${content.replace(regExp, 'dist')}`;
        }
      
        return content;
      }))
      .pipe(rename(function(file) {
        // Put playground under /dist/playground
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
      .pipe(plumb())
      .pipe(modifyFile((content, path) => {
        // Replace coralui.js and coralui.css paths
        if (path.split('/').pop() === 'index.html') {
          content = `${content.replace(regExp, '..')}`;
        }
        
        // Replace component example path
        if (path.indexOf('coral/examples/index.html')) {
          content = `${content.replace("'../' + id + '/examples/index.html'", "id + '.html'")}`;
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
