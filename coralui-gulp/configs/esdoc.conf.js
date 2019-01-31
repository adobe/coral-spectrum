/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

const path = require('path');
const util = require('../helpers/util');

const root = util.getRoot();

const config = {
  source: './src/scripts',
  destination: './build/documentation',
  plugins: [
    {name: 'esdoc-external-ecmascript-plugin', option: {enable: false}},
    {name: path.join(root, 'coralui-guide/plugins/Externals.js')},
    {
      name: 'esdoc-standard-plugin',
      option: {
        accessor: {access: ['public']},
        brand: {
          logo: path.join(root, 'coralui-guide/assets/coral.png'),
          title: 'Coral Spectrum',
          repository: 'https://git.corp.adobe.com/Coral/coral-spectrum',
          site: 'https://git.corp.adobe.com/pages/Coral/coral-spectrum/build/documentation'
        }
      }
    },
    {name: 'esdoc-member-plugin'},
    {
      name: 'esdoc-importpath-plugin',
      option: {
        stripPackageName: false,
        replaces: [
          {from: '.+', to: ''}
        ]
      }
    },
    {name: 'esdoc-lint-plugin', option: {enable: false}},
    {name: path.join(root, 'coralui-guide/plugins/Enhancer.js')},
    {name: 'esdoc-inject-script-plugin', option: {enable: true, scripts: [path.join(root, 'coralui-guide/scripts/typekit.js'), path.join(root, 'coralui-guide/scripts/guide.js')]}},
    {name: 'esdoc-inject-style-plugin', option: {enable: true, styles: [path.join(root, 'coralui-guide/styles/guide.css')]}}
  ]
};

// Document all components if we're in the top level builder
if (util.isTLB()) {
  config.source = '.';
  config.includes = ['^.external-ecmascript.js', '^coralui-[a-z]+-[a-z]+/src/scripts', '^coralui-[a-z]+/src/scripts'];
  config.excludes = ['^node_modules', '^build', '^coralui-component-playground'];
  
  config.plugins.find(plugin => plugin.name === 'esdoc-standard-plugin').option.manual = {
    index: path.join(root, 'index.md'),
    globalIndex: true,
    asset: path.join(root, 'coralui-guide/assets'),
    'files': [
      path.join(root, 'README.md'),
      path.join(root, 'coralui-guide/manual/overview.md'),
      path.join(root, 'coralui-guide/manual/manual.md'),
      path.join(root, 'coralui-guide/manual/styles.md'),
      path.join(root, 'coralui-guide/manual/frameworks.md'),
      path.join(root, 'coralui-guide/manual/architecture.md'),
      path.join(root, 'coralui-guide/manual/contribution.md'),
      path.join(root, 'coralui-guide/manual/upgrade.md')
    ]
  };
}

module.exports = config;
