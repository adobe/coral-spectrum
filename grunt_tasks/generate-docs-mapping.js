module.exports = function(grunt) {

  var _utils = require("underscore");
  var dependencyUtils = require('coralui-util-dependencies');

  grunt.registerTask('generate-docs-mapping', "Builds json mapping file used by guide website.", function() {
    var options = grunt.config('generate-docs-mapping');
    // Get the ordered array of dependencies
    var deps = dependencyUtils.getDependencyOrder('.');
    var outputJson = {};
    outputJson.documentation = {};

    for (i= 0; i < deps.length; i++) {
      var coralModule = deps[i];
      var moduleDocsData = grabDocsData(options.moduleDataPath, coralModule.path);

      if (moduleDocsData) {
        for (docsItem in moduleDocsData) {
          var itemData = moduleDocsData[docsItem];
          var nodeData = outputJson.documentation[docsItem] || {};
          nodeData = _utils.extend(nodeData, itemData);
          grunt.log.ok("Merging", coralModule.name + "#" + coralModule.version, ":", docsItem);
          outputJson.documentation[docsItem] = nodeData;
        }
      }
      else {
        grunt.log.writeln("Skipping", coralModule.name + "#" + coralModule.version, "--", "No docs found.".yellow);
      }
    }
    grunt.file.write(options.outputFile, JSON.stringify(outputJson, null, "  "));
  });

  function grabDocsData(pathBase, coralModulePath) {
    var jsonPath = pathBase.replace("{{coralModulePath}}", coralModulePath);
    var modulePackageData = grunt.file.readJSON(jsonPath);
    var result = null;
    if (modulePackageData.coral) {
      result = modulePackageData.coral.documentation;
    }
    return result;
  }
}
