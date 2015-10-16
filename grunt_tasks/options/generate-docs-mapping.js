module.exports = {
  coralModules: '<%= package.devDependencies %>',
  moduleDataPath: '{{coralModulePath}}/package.json',
  outputFile: '<%= dirs.build %>/<%= dirs.documentation %>/documentation-mapping.json'
};
