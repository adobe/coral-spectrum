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

const util = require('../helpers/util');
const CWD = process.cwd();

const config = {
  source: './src/scripts',
  destination: './build/documentation',
  plugins: [
    {name: 'esdoc-external-ecmascript-plugin', option: {enable: false}},
    {name: 'coralui-guide/plugins/Externals.js'},
    {
      name: 'esdoc-standard-plugin',
      option: {
        accessor: {access: ['public']},
        brand: {
          logo: `${CWD}/node_modules/coralui-guide/assets/logo.png`,
          title: 'CoralUI',
          repository: 'https://git.corp.adobe.com/Coral/coralui',
          site: 'http://coralui.corp.adobe.com'
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
    {name: 'coralui-guide/plugins/Enhancer.js'},
    {name: 'esdoc-inject-script-plugin', option: {enable: true, scripts: [`${CWD}/node_modules/coralui-guide/scripts/typekit.js`, `${CWD}/node_modules/coralui-guide/scripts/guide.js`]}},
    {name: 'esdoc-inject-style-plugin', option: {enable: true, styles: [`${CWD}/node_modules/coralui-guide/styles/guide.css`]}}
  ]
};

// Document all components if we're in the top level builder
if (util.isTLB()) {
  config.source = '.';
  config.includes = ['^.external-ecmascript.js', '^coralui-[a-z]+-[a-z]+/src/scripts', '^coralui-[a-z]+/src/scripts'];
  config.excludes = ['^node_modules', '^build'];
  
  // config.plugins.find(plugin => plugin.name === 'esdoc-standard-plugin').option.manual = {
  //   index: `${CWD}/README.md`,
  //   globalIndex: true,
  //   asset: `${CWD}/node_modules/coralui-guide/assets`,
  //   'files': [
  //     `${CWD}/README.md`,
  //     `${CWD}/node_modules/coralui-guide/manual/usage.md`,
  //     `${CWD}/node_modules/coralui-guide/manual/feature.md`,
  //     `${CWD}/node_modules/coralui-guide/manual/config.md`,
  //     `${CWD}/node_modules/coralui-guide/manual/api.md`,
  //     `${CWD}/node_modules/coralui-guide/manual/faq.md`,
  //     `${CWD}/node_modules/coralui-guide/manual/migration.md`
  //   ]
  // };
}

module.exports = config;
