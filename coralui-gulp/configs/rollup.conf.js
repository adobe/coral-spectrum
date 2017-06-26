const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const css = require('rollup-plugin-css-only');
const babel = require('rollup-plugin-babel');

module.exports = {
  plugins: [
    nodeResolve(),
    commonjs({include: 'node_modules/**'}),
    css({ output: './build/css/coral.css'}),
    babel({
      presets: [
        [
          'babel-preset-es2015',
          {
            modules: false
          }
        ]
      ],
      plugins: [
        'babel-plugin-external-helpers'
      ]
    })
  ]
};
