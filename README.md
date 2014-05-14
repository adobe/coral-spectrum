CoralUI 2
=========

The master branch currently represents the modularized build of coral. If you wish to use an older version, check the [release/1.x](https://git.corp.adobe.com/Coral/coralui-1.x) repository.

## Using gits
1. Checking out the repository
```
git clone git@git.corp.adobe.com:Coral/coralui.git
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

* `grunt` - builds a CoralUI build based on its component dependencies. 
* `grunt clean` - cleans the build


### Questions?
Please contact the [mailing list](mailto:CoralUI@adobe.com) for additional questions.  
