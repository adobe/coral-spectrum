# GUI

## Directory structure

* **build/** Contains output of build process
    * **css/** Output CSS
        * **components** Individual CSS files for each component
        * **cui.css** Rolled up CSS file
    * **examples/** Example and test HTML files
    * **fonts/** Custom fonts (Adobe Clean, etc)
    * **js/** Output JS
        * **cui.js** Full output
        * **libs** Front-facing JS dependencies
        * **components** Individual JS files for each component
* **components/** Front-facing JS dependencies fetched by Bower (TODO: change name once Bower supports it)
* **node_modules/** Node dependencies fetched by NPM
* **source/**
    * **examples/** Example and test HTML files
    * **fonts/** Custom fonts (Adobe Clean, etc)
    * **js/** JavaScript files
        * **components**: JS files for widgets with filenames that represent the class they define, i.e. `CUI.Slider.js` defines the class `CUI.Slider`
        * **CUI.js** defines JavaScript namespace
    * **less/** LESS CSS files
        * **cui.less** Manages includes for all LESS files required for full build
        * **base/** Layout, fonts, media queries for retina displays, etc
        * **components/** Actual components, either widgets, header, buttons, etc
        * **includes/** Variables and mixins. No actual CSS classes are be defined here
    * **templates** Holds Handlesbars templates (.hbs files) for components and widgets
* **tasks/** Custom grunt tasks
* **temp/** Temporary files used by the build process

##Build process technology

* **grunt** + **NodeJs**/**NPM** for build process and build process dependency management
* **Bower** for JS dependency management
* **LESS** for CSS preprocessing
* **JSHint** for linting
* ??? for CSS minification (TBD)
* **UglifyJS** for JS minification (TBD, **Closure Compiler**?)
* **JSDoc3** for documentation generation (TBD, requires Java/Rhino)
* **NodeUnit** + ??? for local unit tests (TBD, decide test harness)
* **JSTestDriver** + ??? for distributed unit tests (TBD, decide test harness)
* ??? for code coverage (TBD, could use **JSTestDriver** + **LCOV**)

##Dependencies

* **Twitter Bootstrap** for CSS reset, mixins, possibly some base components
* **jQuery** for DOM manipulation

## TODO

* Import Twitter Bootstrap LESS files in gui.less for mixins/grid etc
* Get JSDoc3 downloading/working
* Don't manually minify dependencies, find a way to get Bower to fetch minified jQuery?
* Decide TBDs
    * JS minification: UglifyJS vs Closure Compiler
    * Documentation: JSDoc3 vs ???
    * CSS minification: YUI Compressor vs ???
    * Unit testing: Decide test harness


## Building

### Initial install

To install dependencies only:
```
bower install
npm install
```

Or, for a full build from scratch:
```
./build.sh
```

###To build for development:

```
grunt
```

###To build for deployment:

```
grunt full
```

Results in documentation, 

###To watch changes and lint, compile, check automatically:

```
grunt watch
```