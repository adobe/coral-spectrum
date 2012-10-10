#!/usr/bin/env sh

#####################################
# Configuration
#####################################
outputFile="build/test/coverage.html"
testFile="build/test/index.html"


#####################################
# Utilities
#####################################

# Single line echo
if [ "`echo -e "abc\c"`" = "abc" ]; then
    alias echoe="echo -e"
else
    alias echoe="echo"
fi

green() {
  echoe "\033[32m$1\033[0m$2"
}

red() {
  echoe "\033[31m$1\033[0m$2"
}


#####################################
# Check dependencies
#####################################

echoe "Checking dependencies...\c"

# Check for PhantomJS, error if not available
if ! which phantomjs >/dev/null 2>&1; then
  red " [X] " "\c"
  echo "PhantomJS must be installed to generate the code coverage report. Visit http://phantomjs.org/download.html to download PhantomJS"
  exit 1
fi

# Install mocha-phantomjs if necessary
if [ ! -d components/mocha-phantomjs ]; then
  red " [X] " "\c"
  echo "mocha-phantomjs not installed, installing with bower"
  bower install https://github.com/metaskills/mocha-phantomjs.git
  
  if [ $? -ne 0 ]; then
    red " [X] " "\c"
    echo "Failed to install mocha-phantomjs"
    exit 1
  fi
fi

# Install jscoverage if necessary
if [ ! -d components/node-jscoverage ]; then
  red " [X] " "\c"
  echo "jscoverage not installed, installing with bower"
  bower install https://github.com/visionmedia/node-jscoverage.git
  
  # Store current working directory
  cwd=`pwd`

  # Build node-jscoverage
  cd components/node-jscoverage
  ./configure && make
  
  if [ $? -ne 0 ]; then
    red " [X] " "\c"
    echo "Failed to build jscoverage"
    exit 1
  fi
  
  # Return to cwd
  cd $cwd
fi

# Install jade if necessary
if [ ! -d node_modules/jade ]; then
  red " [X] " "\c"
  echo "jade not installed, installing with npm"
  npm install jade
  
  if [ $? -ne 0 ]; then
    red " [X] " "\c"
    echo "Failed to install jade"
    exit 1
  fi
  
  # Return to cwd
  cd $cwd
fi

# Things are ok if we haven't exited by now
green "    [√]"


#####################################
# Instrument source files
#####################################

echoe "Instrumenting JS files...\c"
rm -rf temp/js_instrumented
components/node-jscoverage/jscoverage source/js/ temp/js_instrumented

if [ $? -ne 0 ]; then
  red "   [X]"
  exit 1
else
  green "   [√]"
fi


#####################################
# Run Grunt tasks
#####################################

echoe "Running grunt tasks...\c"
grunt clean:tests lint copy:libs copy:tests copy:test_libs handlebars concat:cui_cc > /dev/null

if [ $? -ne 0 ]; then
  red "      [X]"
  exit 1
else
  green "      [√]"
fi


#####################################
# Run unit tests
#####################################

testFile_cc=${testFile/.html/_cc.html}

echoe "Running unit tests...\c"

# Modify test file to point at instrumented JavaScript
sed 's/\.\.\/js\/CUI\.js/\.\.\/\.\.\/temp\/js_instrumented\/CUI_cc.js/g' $testFile > $testFile_cc

# Run tests and generate code coverage report
phantomjs components/mocha-phantomjs/lib/mocha-phantomjs.coffee $testFile_cc json-cov | node util/buildCoverageHTML.js > $outputFile

if [ $? -ne 0 ]; then
  red "       [X]"
  exit 1
else
  green "       [√]"
fi

# Delete the modified test file
rm $testFile_cc


#####################################
# Done!
#####################################

echo "Code coverage report generated at $outputFile"
