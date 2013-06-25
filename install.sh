#!/usr/bin/env sh

# disable tracing in shell output (for CI server console)
set +x

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

# if not using color, use plain text instead of unicode
# Jenkins is borking the special character
if $USE_COLOR ; then
  OK="[√]"
else
  OK="[OK]"
fi

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
  green " $OK " "\c"
  echo "Node"
fi

# Check for npm, error if not available
if ! which npm >/dev/null 2>&1; then
  red " [X] " "\c"
  echo "npm must be installed to build CoralUI"
  exit 1
else
  green " $OK " "\c"
  echo "npm"
fi

# Get list of NPM modules
npmList=`npm list -g`

# Check for grunt not installed globally
cmdGruntUninstall="sudo npm uninstall -g grunt"
if echo $npmList | grep grunt@ >/dev/null 2>&1; then
  echo ""
  echoe "grunt must not be installed globally, uninstall it with '$cmdGruntUninstall'? [y/n] \c"
  read uninstallGrunt
  if [ $uninstallGrunt = "y" ]; then
    echo "running $cmdGruntUninstall..."
    $cmdGruntUninstall

    if [ $? -ne 0 ]; then
      red " [X] " "\c"
      echo "Failed to uninstall grunt"
      exit 1
    fi
  else
    red " [X] " "\c"
    echo "grunt must not be installed globally to build CoralUI"
    exit 1
  fi
else
  green " $OK " "\c"
  echo "grunt not installed globally"
fi

# Check for grunt-cli
cmdGruntCli="sudo npm install -g grunt-cli"
if ! echo $npmList | grep grunt-cli@ >/dev/null 2>&1; then
  echo ""
  echoe "grunt-cli must be installed globally, install it with '$cmdGruntCli'? [y/n] \c"
  read installGruntCli
  if [ $installGruntCli = "y" ]; then
    echo "running $cmdGruntCli..."
    $cmdGruntCli

    if [ $? -ne 0 ]; then
      red " [X] " "\c"
      echo "Failed to install grunt-cli"
      exit 1
    fi
  else
    red " [X] " "\c"
    echo "grunt-cli must be installed to build CoralUI"
    exit 1
  fi
else
  green " $OK " "\c"
  echo "grunt-cli"
fi

echo ""
echo "Installing modules and components"

# Install node modules
npm install >/dev/null

if [ $? -eq 0 ]; then
  green " $OK " "\c"
  echo "npm"
else
  red " [X] " "\c"
  echo "npm";
  exit 1
fi

# install core build stuff as well
cd core
echo ""
echo "Preparing Coral core"
./install.sh
cd -

gruntVersion="grunt --version"
echo ""
echo "$ $gruntVersion"
$gruntVersion

echo ""
echo "Run one of the following commands to build CoralUI:"
echo ""
echo "  grunt       # partial build for development"
echo "  grunt full  # full build with documentation"
