#!/usr/bin/env sh

# Install node modules
npm install

# Install JS libraries with Bower
bower install

# Build
grunt full
