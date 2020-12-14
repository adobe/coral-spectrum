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

const path = require('path');
const util = require('../helpers/util');

const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const css = require('rollup-plugin-postcss');
const babel = require('rollup-plugin-babel');
const json = require('rollup-plugin-json');
const terser = require('rollup-plugin-terser').terser;
const resources = require('../plugins/rollup-plugin-resources');

const root = util.getRoot();

module.exports = (options = {}) => {
  const plugins = [
    nodeResolve(),
    commonjs(),
    json(),
    resources({
      include: path.join(root, '**/*.svg'),
      output: './dist/resources'
    }),
    css({
      extract: options.runTests ? false : './dist/css/coral.css'
    }),
    babel({
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            targets: {
              ie: '11'
            }
          }
        ]
      ]
    })
  ];

  if (options.min) {
    plugins.push(terser());
  }

  return plugins;
};
