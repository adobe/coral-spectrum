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
  const plumb = require('./plumb');
  const stylus = require('gulp-stylus');
  const css = require('gulp-postcss');
  const vars = require('postcss-css-variables');
  const rules = require('postcss-merge-rules');
  const svgImport = require('stylus-svg');
  const modifyFile = require('gulp-modify-file');
  const util = require('../helpers/util');
  const spectrumConfig = require(`../configs/spectrum.conf.js`);
  
  const root = util.getRoot();
  
  gulp.task('styles', function() {
    return gulp.src(
        ['src/styles/index.styl', path.join(root, 'coral-*/src/styles/index.styl')],
        {allowEmpty: true}
      )
      .pipe(plumb())
      .pipe(stylus({
        'include css': true,
        include: [
          path.join(root, 'node_modules')
        ],
        use: [
          svgImport()
        ]
      }))
      .pipe(css([
        rules(),
        vars()
      ]))
      .pipe(modifyFile((content) => {
        // Map Spectrum selectors with Coral ones
        spectrumConfig.forEach((selectors) => {
          content = content.replace(selectors.spectrum, selectors.coral);
        });
        
        // Remove topdoc comments
        content = content.replace(/\/\* topdoc.*[\s\S]*?\*\//g, '\n\n');
        
        return content;
      }))
      .pipe(gulp.dest(function (file) {
        return file.base;
      }));
  });
  
  gulp.task('styles-vars', function(done) {
    let content = ':root {';
    const identifier = 'spectrum';
    const files = [
      path.join(root, 'node_modules/@adobe/spectrum-css/dist/vars/spectrum-global.css'),
      path.join(root, 'node_modules/@adobe/spectrum-css/dist/vars/spectrum-medium.css'),
      path.join(root, 'node_modules/@adobe/spectrum-css/dist/vars/spectrum-light.css'),
      path.join(root, 'node_modules/@adobe/spectrum-css/dist/vars/spectrum-lightest.css'),
      path.join(root, 'node_modules/@adobe/spectrum-css/dist/vars/spectrum-dark.css'),
      path.join(root, 'node_modules/@adobe/spectrum-css/dist/vars/spectrum-darkest.css')
    ];
  
    files.forEach((file) => {
      const name = path.basename(file, path.extname(file));
      const vars = fs.readFileSync(file, 'utf8');
      const output = [];
    
      const lines = vars.split('\n');
      lines.forEach((line) => {
        if (line.trim().startsWith('--')) {
          if (name === 'spectrum-global') {
            output.push(line);
          }
          else {
            output.push(line.replace(identifier, name));
          }
        }
      });
      content += `\n${output.join('\n')}`;
    });
    
    // @spectrum add missing vars
    content = `${content}\n  --ui-icon-large-display: none;\n  --ui-icon-medium-display: block;\n}`;
    
    fs.writeFileSync(path.join(root, 'coral-theme-spectrum/src/styles/vars.css'), content);
    
    done();
  });
};
