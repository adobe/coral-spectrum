# CoralUI icons base

This contains the basic set of icons and variables for Coral.  This builds using icons that are downloaded and prepared with the coralui-contrib-icons-athena add on.

## BUILDING

Before building you need some dependencies on your system.

Assuming OSX with Homebrew:
    brew install fontforge ttfautohint
    brew install https://raw.github.com/sapegin/grunt-webfont/grunt-0-3-0/Formula/sfnt2woff.rb

There are also dependencies needed for grunt, which you can install using npm.

To generate the AdobeIcons fonts, run `grunt` with the default tasks.  For more details look at the Gruntfile.
