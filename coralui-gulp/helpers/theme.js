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
const packageJSON = require(path.join(process.cwd(), 'package.json'));

const themeCloudUI = ((packageJSON['dependencies'] && packageJSON['dependencies']['@coralui/coralui-theme-spectrum']) ||
(packageJSON['devDependencies'] && packageJSON['devDependencies']['@coralui/coralui-theme-spectrum'])) && 'spectrum';

const themeSpectrum = ((packageJSON['dependencies'] && packageJSON['dependencies']['@coralui/coralui-theme-cloudui']) ||
(packageJSON['devDependencies'] && packageJSON['devDependencies']['@coralui/coralui-theme-cloudui'])) && 'cloudui';

// If both themes, spectrum wins
const theme = themeSpectrum || themeCloudUI;

module.exports = {
  getTheme: function() {
    return theme;
  },
  addTheme: function() {
    return `import '@coralui/coralui-theme-${theme}/build/css/coral.css';\n`;
  },
  getIndex: function() {
    return theme ? `index-${theme}` : 'index';
  }
};
