# GUI

## What is CloudUI?
All the CSS and JS you need for the CloudUI look & feel.

## Building

### Initial install

To install dependencies only:
```
bower install
npm install
```

Or, fetch dependencies and perform a full build from scratch:
```
./build.sh
```

###To build for development:

```
grunt
```

###To watch changes and lint, compile, check automatically:

```
grunt watch
```

### Build Tasks

* **clean**: delete the contents the build folder
* **less**: check LESS files for errors and compile to build folder
* **lint**: check JS files for errors and style problems
* **copy**: copy examples, images, and fonts to build folder
* **handlebars**: check template files for errors, precompile
* **concat**: concatenate JS files into build folder
* **min**: minify concatenated JS files into build folder
* **jsdoc**: generate documentation (TBD)
* **nodeunit**: run unit tests (TBD)

### Build Profiles

#### full
`grunt full` performs: clean less lint copy handlebars concat min compress

#### partial (default)
`grunt partial` performs: clean less lint copy handlebars concat

#### watch
`grunt watch` watches for updates to LESS, JS, templates and lints/compiles accordinly


## Directory structure

* **build/** Contains output of build process
    * **css/** Output CSS
        * **components/** Individual CSS files for each component
        * **cui.css** Rolled up CSS file
    * **examples/** Example and test HTML files
       * **index.html** CloudUI Style Guide
    * **fonts/** Custom fonts (Adobe Clean, etc)
    * **js/** Output JS
        * **libs/** Front-facing JS dependencies
        * **components/** Individual JS files for each component
            * **cui.js** All JS files rolled up in order
    * **cui.zip** Zip of build files for deployment (js/, css/, images/, fonts/)
* **components/** Front-facing JS dependencies fetched by Bower (TODO: change name once Bower supports it)
* **node_modules/** Node dependencies fetched by NPM
* **source/**
    * **examples/** Example and test HTML files
    * **fonts/** Custom fonts (Adobe Clean, etc)
    * **js/** JavaScript files
        * **components**: JS files for widgets with filenames=class name, i.e. `CUI.Slider.js` defines `CUI.Slider`
        * **CUI.js** defines JavaScript namespace
    * **less/** LESS CSS files
        * **base/** Layout, fonts, media queries for retina displays, etc
        * **components/** Actual components, either widgets, header, buttons, etc
        * **includes/** Variables and mixins. No actual CSS classes are be defined here
        * **cui.less** Manages includes for all LESS files required for full build
    * **templates/** Handlesbars templates (.hbs files) for components and widgets
* **tasks/** Custom grunt tasks
* **temp/** Temporary files used by the build process
* **build.sh** One purpose: quickly install dependencies and perform a full build
* **component.json** Defines the Bower dependencies (jQuery, Underscore, etc)
* **grunt.js** Defines build process
* **package.json** Defines the NPM dependencies and package information
* **README.md** You're lookin' at it!


##Dependencies

* **Twitter Bootstrap** for CSS reset, mixins, possibly some base components
* **jQuery** for DOM manipulation
* **Underscore** for utility functions
* **Backbone** for data-driven components


##Build technology

* **grunt** + **NodeJs**/**NPM** for build process and build process dependency management
* **Bower** for JS dependency management
* **LESS** for CSS preprocessing
* **JSHint** for linting
* ??? for CSS minification (TBD)
* **UglifyJS** for JS minification (TBD, **Closure Compiler**?)
* **JSDoc3** for documentation generation (TBD, requires Java/Rhino)
* **NodeUnit** + ??? for local unit tests (TBD, decide test harness)
* **JSTestDriver** + ??? for distributed unit tests (TBD, decide test harness)
* **JSTestDriver** + **LCOV** for code coverage (TBD, any other options?)


## TODO

* Import Twitter Bootstrap LESS files in gui.less for mixins/grid etc
* Get JSDoc3 downloading/working
* Don't manually minify dependencies, find a way to get Bower to fetch minified jQuery?
* Decide TBDs
    * JS minification: UglifyJS vs Closure Compiler
    * Documentation: JSDoc3 vs ???
    * CSS minification: YUI Compressor vs ???
    * Unit testing: Decide test harness

## Suggestions from Granite folks

* Build tasks that support Granite integration
    * Creates zip file in CRX form
    * Creates zip file in deployment form
    * Create CRX content package
        * Instead of copying CSS/LESS/JS directly into Granite Git repository
        * Content package is a zip that mimics structure in repo, top level folder is jcr_root, installed into running instance
        * Creates Maven artifact
            * deployed to local Maven
            * deployed to central Maven repository
        * √ Toby is already working on this
* Move effort under the Reef organization
    * Eventually, move the repository under the Reef org (next to Granite repository)
    * Wait to move until we've proposed this to the Granite list
* Re-use part of Bootstrap widgets, not style


## Next steps

* Toby, Aaron, Ondrej, Daniel Wabyick review of existing structure in lawdavis/CloudUI
    * √ Added as contributors
* Create CRX content package
* Decide what we're providing with CloudUI and what is expected to be implemented by individual products or by Granite
* Lay down some LESS for basic components
* Issues:
    * UX folks do not (usually) have a seat on github
        * required if they want to change colors and whatnot
* Decisions:
    * How do we handle retina/2x size images?
        * external files/overrides + media queries
        * mixins + media queries
        * vendor properties: -webkit-image-set
    * Should we standardize around a component framework like F for data-driven widgets?
    * Can we just use font-icons and save ourselves lots of trouble?
    * Image asset repository: we need one if we're using raster icons
    * How do we want to reuse Bootstrap LESS?
        * Approaches:
            * Fork Bootstrap, use it as base LESS
                * Full control and a good starting point
            * Pick pieces of it and include them
                * Lets us upgrade easy
                * √ Aaron/Larry
* Begin creating HTML style guide 
    * Current round:
        * LESS
            * Header
                * Pretty well defined already, could expect/adapt to minor changes
                * Open questions
                    * where does the rail show/hide button go?
            * Toolbar
                * Super simple to code
        * JS:
            * Contextual alerts
                * already in Bootstrap, copy their style
            * Modals
                * already in BS
            * Tooltips
                * fun challenge; implement Bootstrap style or as a widget?
                * decide if we can show more than one tooltip at a time?
            * Checkbox
                * could be done with CSS, :before selector
                * done with images, but has to support retina
            * Rail
                * is it a widget? how does it show/hide itself, populate content?
    * Next round:
        * LESS
            * Rail
                * Open questions:
                    * Should we build it given discussions are currently happening?
            * Search
                * easy CSS
                * simple template
                * needs to have retina support for the search icon
        * JS:
            * Rail
                * is it a widget? how does it show/hide itself, populate content?
            * Search/List
                * should we standardize around a component framework like F?
* Propose concept to Granite mailing list
    * Cover potentially controversial decisions
        * EMs vs Px
    