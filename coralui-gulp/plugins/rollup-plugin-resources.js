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
        
        fs.outputFile(path.join(process.cwd(), outputPath), code);
        
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
