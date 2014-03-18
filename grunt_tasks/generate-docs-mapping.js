module.exports = function(grunt) {

  var _utils = require("underscore");

  grunt.registerTask('generate-docs-mapping', "Builds json mapping file used by guide website.", function() {
    var options = grunt.config('generate-docs-mapping');
    var modules = options.coralModules;
    var outputJson = {};
    outputJson.documentation = {};

    for (var coralModule in modules) {

      var moduleDocsData = grabDocsData(options.moduleDataPath, coralModule);

      if (moduleDocsData) {
        for (docsItem in moduleDocsData) {
          var itemData = moduleDocsData[docsItem];
          var nodeData = outputJson.documentation[docsItem] || {};
          nodeData = _utils.extend(nodeData, itemData);
          grunt.log.ok("Merging", coralModule, ":", docsItem);
          outputJson.documentation[docsItem] = nodeData;
        }
      } else {
        grunt.log.writeln("Skipping", coralModule, "--", "No docs found.".yellow);
      }
      // grunt.log.writeln('documentation ', dependencyDocsData);
    }
    grunt.file.write(options.outputFile, JSON.stringify(outputJson, null, "  "));

  });


  function grabDocsData(pathBase, coralModule) {
    var jsonPath = pathBase.replace("{{coralModule}}", coralModule);
    var modulePackageData = grunt.file.readJSON(jsonPath);
    var result = null;
    if (modulePackageData.coral) {
      result = modulePackageData.coral.documentation;
    }
    return result;
  }


}
