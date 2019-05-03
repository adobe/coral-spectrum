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
  const axe = require('gulp-axe-webdriver');
  const glob = require('glob-all');
  const isTLB = require('../helpers/util').isTLB();
  const config = require(`../configs/a11y.conf`);

  gulp.task('a11y', function(done) {
    let i = 0;

    const files = isTLB ? glob.sync([
      'coral-component-*/examples/index.html',
      '!coral-component-playground/examples/index.html'
    ]) : ['examples/index.html'];

    const analyse = () => {
      const file = files[i];

      config.urls = [file];
      config.saveOutputIn = `${isTLB ? file.split('/')[0] : 'report'}.json`;

      i++;

      return axe(config, () => {
        if (i === files.length) {
          done();
        }
        else {
          return analyse();
        }
      });
    };

    return analyse();
  });
};
