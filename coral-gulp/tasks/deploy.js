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
  const ghPages = require('gulp-gh-pages');
  const plumb = require('./plumb');
  const PluginError = require('plugin-error');
  const util = require('../helpers/util');
  
  gulp.task('deploy', (done) => {
    if (!util.isTLB()) {
      done(new PluginError('deploy', 'Deploy aborted: not in root folder.'));
    }
    
    return gulp.src('./dist/**/*', {base: '.'})
      .pipe(plumb())
      .pipe(ghPages({
        message: `Deploy ${util.getPackageJSON().version}`
      }));
  });
};
