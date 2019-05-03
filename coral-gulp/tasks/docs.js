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
  const fs = require('fs');
  const path = require('path');
  const exec = require('child_process').exec;
  const plumb = require('./plumb.js');
  const modifyFile = require('gulp-modify-file');
  const util = require('../helpers/util');
  
  const root = util.getRoot();
  const regExp = /.*class extends superClass {/g;
  
  gulp.task('rename-mixins', function() {
    // @todo due to https://github.com/esdoc/esdoc/issues/455, use class def
    return gulp.src(['src/scripts/*Mixin.js', 'coral-*/src/scripts/*Mixin.js'])
      .pipe(plumb())
      .pipe(modifyFile((content, path) => {
        const className = path.split('/').pop().slice(0, -3);
        return content.replace(regExp, `class ${className} extends superClass {`);
      }))
      .pipe(gulp.dest(function(file) {
        return file.base;
      }));
  });
  
  gulp.task('create-readme', function(done) {
    // @todo due to https://github.com/esdoc/esdoc/issues/432, we have to manually create a fake README
    try {
      fs.writeFileSync('README.md', '', { flag: 'wx' });
    }
    catch (e) {}
    
    done();
  });
  
  gulp.task('esdoc', function(done) {
    const config = path.join(root, 'coral-gulp/configs/esdoc.conf.js');
    const p = exec(path.join(root, `node_modules/.bin/esdoc -c ${config}`), (err) => {
      done(err);
    });
  
    p.stdout.pipe(process.stdout);
  });
  
  gulp.task('revert-rename-mixins', function() {
    // @todo due to https://github.com/esdoc/esdoc/issues/455, revert class def
    return gulp.src(['src/scripts/*Mixin.js', 'coral-*/src/scripts/*Mixin.js'])
      .pipe(plumb())
      .pipe(modifyFile((content, path) => {
        const className = path.split('/').pop().slice(0, -3);
        return content.replace(`class ${className} extends superClass {`, `const ${className} = (superClass) => class extends superClass {`);
      }))
      .pipe(gulp.dest(function(file) {
        return file.base;
      }));
  });
  
  // @todo due to https://github.com/nanopx/gulp-esdoc/issues/19, we can't use gulp-esdoc
  gulp.task('docs',
    gulp.series(
      'rename-mixins',
      'create-readme',
      'esdoc',
      'revert-rename-mixins'
    )
  );
};
