#!/usr/bin/env sh

# Single line echo
if [ "`echo -e "abc\c"`" = "abc" ]; then
    alias echoe="echo -e"
else
    alias echoe="echo"
fi

# parse options
while getopts ":c" opt; do
  case "$opt" in
    c)
      USE_COLOR=false; 
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      ;;
  esac
done

# output with color
# -c turns this off 
green() {
  if $USE_COLOR ; then
    echoe "\033[32m$1\033[0m$2"
  else
    echoe $1 $2
  fi
}

red() {
  if $USE_COLOR ; then
  echoe "\033[31m$1\033[0m$2"
  else
    echoe $1 $2
  fi
}

echo "Checking for build dependencies..."

# Check for node, error if not available
if ! which node >/dev/null 2>&1; then
  red " [X] " "\c"
  echo "Node must be installed to build CoralUI. Visit nodejs.org to download Node"
  exit 1
else
  green " [√] " "\c"
  echo "Node"
fi

# Check for npm, error if not available
if ! which npm >/dev/null 2>&1; then
  red " [X] " "\c"
  echo "npm must be installed to build CoralUI"
  exit 1
else
  green " [√] " "\c"
  echo "npm"
fi

# Get list of NPM modules
npmList=`npm list -g`

# Check for grunt
if ! echo $npmList | grep grunt@ >/dev/null 2>&1; then
  echo ""
  echoe "grunt must be installed globally, install it with 'sudo npm install -g grunt'? [y/n] \c"
  read installGrunt
  if [ $installGrunt = "y" ]; then
    echo "running sudo npm install -g grunt..."
    sudo npm install -g grunt
    
    if [ $? -ne 0 ]; then
      red " [X] " "\c"
      echo "Failed to install grunt"
      exit 1
    fi
  else
    red " [X] " "\c"
    echo "grunt must be installed to build CoralUI"
    exit 1
  fi
else
  green " [√] " "\c"
  echo "grunt"
fi

# Check for bower
if ! echo $npmList | grep bower@ >/dev/null 2>&1; then
  echo ""
  echoe "Bower must be installed globally, install it with 'sudo npm install -g bower'? [y/n] \c"
  read installBower
  if [ $installBower = "y" ]; then
    echo "running sudo npm install -g bower..."
    sudo npm install -g bower
    
    if [ $? -ne 0 ]; then
      red " [X] " "\c"
      echo "Failed to install Bower"
      exit 1
    fi
  else
    red " [X] " "\c"
    echo "Bower must be installed to build CoralUI"
    exit 1
  fi
else
  green " [√] " "\c"
  echo "bower"
fi

echo ""
echo "Installing modules and components"

# Install node modules
npm install >/dev/null

if [ $? -eq 0 ]; then
  green " [√] " "\c"
  echo "npm"
else
  red " [X] " "\c"
  echo "npm";
  exit 1
fi

# Install JS libraries with Bower
bower install >/dev/null

if [ $? -eq 0 ]; then
  green " [√] " "\c"
  echo "bower"
else
  red " [X] " "\c"
  echo "bower";
  exit 1
fi

# Temporary: clone from git and add link to template in JSDoc folder
rm -rf components/JSDoc
git clone https://github.com/jsdoc3/jsdoc.git components/JSDoc >/dev/null 2>&1
if [ $? -eq 0 ]; then
  green " [√] " "\c"
  echo "JSDoc"
else
  red " [X] " "\c"
  echo "JSDoc";
  exit 1
fi

echo ""
echo "Run one of the following commands to build CoralUI:"
echo ""
echo "  grunt       # partial build for development"
echo "  grunt full  # full build with documentation"
echo "  grunt mvn   # build and install into Granite"
