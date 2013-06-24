/*global module:false*/
module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadTasks('tasks/core');

    /**
    JavaScript file include order
    Add new components to this array _after_ the components they inherit from
    */
    var includeOrder = {
            "cui": [
        // Coral core
        'cui-core.js',

        // Persistence
        'CUI.Util.state.js',


        // Components
        'components/CUI.Modal.js',
        'components/CUI.Tabs.js',
        'components/CUI.Alert.js',
        'components/CUI.Popover.js',
        'components/CUI.DropdownList.js',
        'components/CUI.Dropdown.js',
        'components/CUI.Filters.js',
        'components/CUI.Slider.js',
        'components/CUI.LabeledSlider.js',
        'components/CUI.Datepicker.js',
        'components/CUI.Pulldown.js',
        'components/CUI.Sticky.js',
        'components/CUI.CardView.js',
        'components/CUI.PathBrowser.js',
        'components/CUI.Wizard.js',
        'components/CUI.FlexWizard.js',
        'components/CUI.FileUpload.js',
        'components/CUI.Toolbar.js',
        'components/CUI.Tooltip.js',
        'components/CUI.DraggableList.js',
        'components/CUI.CharacterCount.js',
        'components/CUI.Accordion.js',
        'components/CUI.Tour.js',
        'components/CUI.Autocomplete.js',

        // Validations
        'validations.js',

        'accessibility.js'
        ]
    };

    /**
     * Build directories
     * Any directories used by the build should be defined here
     */
    var dirs = {
        build: 'build',
        components: 'components',
        source: 'source',
        legacy: 'legacy',
        temp: 'temp',
        modules: 'node_modules',
        core: {
            build: 'core/build'
        }
    };

    var packages = {
        "cui": ["cui"]
    };


    /**
    Get array of CUI includes in the correct order

    @param pkg      The package to build
    @param jsPath   Base path to prepend to each include
    */
    function getIncludes(pkg, jsPath) {
        var includes = [ ];
        var def = packages[pkg];
        def.forEach(function(_set) {
            includeOrder[_set].forEach(function(_file) {
                var pref = "{build}";
                var prefLen = pref.length;
                if ((_file.length >= prefLen) && (_file.substring(0, prefLen) === pref)) {
                    includes.push(dirs.build + "/js/" + _file.substring(prefLen + 1));
                }
                includes.push(jsPath + _file);
            });
        });
        return includes;
    }

    var pkg = grunt.file.readJSON('package.json');

    // Meta and build configuration
    var meta = {
        version: pkg.version,
        appName: pkg.name,
        appWebSite: pkg.repository.url
    };


    grunt.initConfig({

        dirs: dirs,
        meta: meta,
        outputFileName: "CUI",

        clean: {
            build: '<%= dirs.build %>',
            temp: '<%= dirs.temp %>'
        }, // clean

        // Configuration
        jshint: {
            options: {
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true,
                smarttabs: true,
                globals: {
                    'jQuery': true,       // jQuery
                    'console': true,      // console.log...
                    'CUI': true,          // CoralUI
                    'Class': true        // Class
                }
            },
            retro: [
                'Gruntfile.js',
                '<%= dirs.temp %>/js/**.js',
                '<%= dirs.temp %>/js/components/**.js'
            ]
        },

        subgrunt: {
            core: { // needed to merge the cor einto the build
                subdir: dirs.core.build,
                args: ['retro']
            }
        },

        copy: {
            retro: {
                files: [
                    { // get build from the core
                        expand: true,
                        cwd: '<%= dirs.core.build %>/',
                        src: ['examples/**', 'less/**', 'res/**', 'tests/**'],
                        dest: '<%= dirs.build %>/'
                    },
                    { // get build from the core js and copy into temp
                        expand: true,
                        cwd: '<%= dirs.core.build %>/',
                        src: ['js/cui-core.js'],
                        dest: '<%= dirs.temp %>/'
                    },
                    { // get less from the modularized components
                        expand: true,
                        flatten: true,
                        cwd: '<%= dirs.components %>/',
                        src: ['**/styles/**.less'],
                        dest: '<%= dirs.build %>/less/components'
                    },
                    { // get js from the modularized components
                        expand: true,
                        flatten: true,
                        cwd: '<%= dirs.components %>/',
                        src: ['**/scripts/**.js'],
                        dest: '<%= dirs.temp %>/js/components'
                    },
                    { // get legacy components' less
                        expand: true,
                        cwd: '<%= dirs.legacy %>/components/styles',
                        src: ['**'],
                        dest: '<%= dirs.build %>/less/components'
                    },
                    { // get legacy less (overrides the core)
                        expand: true,
                        cwd: '<%= dirs.legacy %>/styles',
                        src: ['**.less'],
                        dest: '<%= dirs.build %>/less'
                    },
                    { // get legacy components' tests -> will override the test runner html
                        expand: true,
                        cwd: '<%= dirs.legacy %>/components/tests',
                        src: ['**'],
                        dest: '<%= dirs.build %>/tests'
                    },
                    { // get legacy components' js
                        expand: true,
                        cwd: '<%= dirs.legacy %>/components/scripts',
                        src: ['**'],
                        dest: '<%= dirs.temp %>/js/components'
                    },
                    { // get legacy js
                        expand: true,
                        filter: 'isFile',
                        cwd: '<%= dirs.legacy %>/scripts',
                        src: ['*.js'],
                        dest: '<%= dirs.temp %>/js'
                    }
                ]
            }
        }, // copy

        less: {
            "cui-wrapped": {
                options: {
                    paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
                        dirs.build+'/less/'
                    ]
                },
                files: {
                    '<%= dirs.build %>/css/cui-wrapped.css': '<%= dirs.build %>/less/cui-wrapped.less'
                }
            },
            "cui": {
                options: {
                    paths: [  // grunt-contrib-less doesn't support template tags, use dirs instead
                        dirs.build+'/less/'
                    ]
                },
                files: {
                    '<%= dirs.build %>/css/cui.css': '<%= dirs.build %>/less/cui.less'
                }
            }
        }, // less

        concat: {
            retro: {
                src: getIncludes("cui", dirs.temp+'/js/'),
                dest: '<%= dirs.build %>/js/<%= outputFileName %>.js'
            }
        }, // concat

        uglify: {
            retro: {
                files: {
                    '<%= dirs.build %>/js/CUI.min.js': ['<%= dirs.build %>/js/<%= outputFileName %>.js']
                }
            }
        } // uglify

    }); // end init config


    grunt.task.registerTask('retro', [
        'clean',
        'subgrunt:core',
        'copy:retro',
        'less',
        //'jshint:retro', // hint js in temp folder
        'concat:retro',
        'uglify:retro'
    ]);

      // Default task
    grunt.task.registerTask('default', [
        'retro'
    ]);
};
