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
  const path = require('path');
  const plumb = require('./plumb');
  const domly = require('gulp-domly');
  const modifyFile = require('gulp-modify-file');
  const util = require('../helpers/util');

  gulp.task('templates', function () {
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
