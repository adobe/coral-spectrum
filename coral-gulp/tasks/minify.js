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

module.exports = function (gulp) {
  const plumb = require('./plumb');
  const rollup = require('rollup').rollup;
  const cleanCSS = require('gulp-clean-css');
  const rename = require('gulp-rename');
  const rollupConfig = require('../configs/rollup.conf.js')({min: false});

  gulp.task('minify-css', function () {
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

  gulp.task('minify-js', async function (done) {
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
