# CoralUI icons base

This contains the basic set of icons and variables for Coral

## BUILDING

Before building you need some dependencies on your system.

Assuming OSX with Homebrew:
    brew install fontforge ttfautohint
    brew install https://raw.github.com/sapegin/grunt-webfont/master/Formula/sfnt2woff.rb

There are also dependencies needed for grunt, which you can install using npm.

Once ready, you can pull the latest icons from Athena using the `grunt athena` task.

To generate the AdobeIcons fonts, run `grunt` with the default tasks.  For more details look at the Gruntfile.
