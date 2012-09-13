#!/usr/bin/env sh

# Install node modules
npm install

# Install JS libraries with Bower
node_modules/bower/bin/bower install

# Build
grunt full
