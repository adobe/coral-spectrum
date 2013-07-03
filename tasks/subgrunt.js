/*
 * grunt-subgrunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

'use strict';

module.exports = function(grunt) {

    // Nodejs libs.
    var path = require('path');

    grunt.registerMultiTask('subgrunt', 'Run a sub-project\'s grunt tasks.', function() {
        if (!grunt.file.exists(this.data.subdir)) {
            grunt.log.error('Directory "' + this.data.subdir + '" not found.');
            return false;
        }
        var done = this.async();
        var subdir = path.resolve(this.data.subdir);
        grunt.util.spawn({
            cmd: "grunt",
            args: this.data.args || [],
            opts: {cwd: subdir}
        }, function(error, result, code) {
            if (code === 127) {
                grunt.log.error('Error running sub-grunt. Did you run "npm install" in the sub-project?');
            } else {
                grunt.log.writeln('\n' + result.stdout);
            }
            done(code === 0);
        });
    });

};