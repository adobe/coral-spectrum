# CloudUI

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

###To build for deployment:

```
grunt full
```


## TODO

* Import Twitter Bootstrap LESS files in gui.less for mixins/grid etc
* Get JSDoc3 downloading/working
* Don't manually minify dependencies, find a way to get Bower to fetch minified jQuery?
* Decide TBDs
    * JS minification: UglifyJS vs Closure Compiler
    * Documentation: JSDoc3 vs ???
    * CSS minification: YUI Compressor vs ???
    * Unit testing: Decide test harness
