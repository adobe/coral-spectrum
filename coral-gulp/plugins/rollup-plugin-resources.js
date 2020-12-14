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

const fs = require('fs-extra');
const path = require('path');
const rollupPluginUtils = require('rollup-pluginutils');

// Converts files to modules and copies the imported resources filtered by options.include to options.output.
function resources(opts) {
  opts = opts || {};

  if (!opts.include) {
    throw Error('include option should be specified');
  }

  if (!opts.output) {
    throw Error('output option should be specified');
  }

  const filter = rollupPluginUtils.createFilter(opts.include, opts.exclude);

  return {
    name: 'resources',
    transform: function transform(code, id) {
      if (filter(id)) {
        const file = id.split('/').pop();
        let outputPath = path.join(opts.output, file);

        if (outputPath.startsWith('./')) {
          outputPath = outputPath.replace('./', '');
        }

        // Export SVG as svg file
        fs.outputFile(path.join(process.cwd(), outputPath), code);

        // Export SVG as js file
        if (outputPath.endsWith('spectrum-icons-color.svg')) {
          code = `document.body?document.body.insertAdjacentHTML('beforeend', '${code}'):document.addEventListener('DOMContentLoaded',function(){document.body.insertAdjacentHTML('beforeend', '${code}')})`;
        } else {
          code = `document.head.insertAdjacentHTML('beforeend', '${code}')`;
        }
        fs.outputFile(path.join(process.cwd(), outputPath.replace('.svg', '.js')), code);

        // Export the file path
        return {
          code: `export default '${outputPath}';`,
          map: {mappings: ''}
        };
      }
    }
  };
}

module.exports = resources;
