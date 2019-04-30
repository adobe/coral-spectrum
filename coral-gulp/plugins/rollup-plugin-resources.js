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
