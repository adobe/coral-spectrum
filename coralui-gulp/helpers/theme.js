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

const theme = util.getPackageJSON().theme;

module.exports = {
  getTheme: function() {
    return theme;
  },
  addTheme: function() {
    // Default
    if (theme === 'coralui-theme-spectrum') {
      return `import '/coralui-theme-spectrum';`
    }
    
    // Custom theme
    // Assuming the css is in build/css/coral.css
    return theme ? `import '${theme}/build/css/coral.css';` : '';
  },
  getResources: function() {
    // Default
    if (theme === 'coralui-theme-spectrum') {
      return `/${theme}/src/resources/**/*`
    }
  
    // Custom theme
    // Assuming the resources are in build/resources
    return path.join(util.getRoot(), `node_modules/${theme}/build/resources/**/*`);
  },
  getIndex: function() {
    return theme ? 'index-themed' : 'index';
  },
};
