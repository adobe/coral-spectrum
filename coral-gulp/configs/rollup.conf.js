const path = require('path');
const util = require('../helpers/util');

const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const css = require('rollup-plugin-postcss');
const babel = require('rollup-plugin-babel');
const json = require('rollup-plugin-json');
const uglify = require('rollup-plugin-uglify').uglify;
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
    plugins.push(uglify());
  }
  
  return plugins;
};
