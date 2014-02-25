CoralUI 2
=========

The master branch currently represents the modularized build of coral. If you wish to use an older version, check the [release/1.x branch](https://git.corp.adobe.com/Coral/CoralUI/tree/release/1.x) branch.

## Using gits
1. Checking out the repository
```
git clone git@git.corp.adobe.com:Coral/CoralUI.git
git checkout master
```

1. Downloading the slave repositories
```
gits populate
```

1. Updating the sources
```
gits pull
```

## Building

2. Install Node Dependencies.
```
npm install
```

2. Build the package
```
grunt
```

#### Grunt options

* `grunt` - builds CoralUI without building each dependency.
* `grunt clean` - cleans the build
* `grunt full` - full build of the module. Every dependency is also build (should not be required when ).


### Questions?
More information on the 2.0 effort can be found in the [CoralUI 2.0 Scope Document](https://git.corp.adobe.com/Coral/CoralUI/wiki/CoralUI-2.0-Scope-and-Initial-Timeline). Please contact the [mailing list](mailto:CoralUI@adobe.com) for additional questions.  
