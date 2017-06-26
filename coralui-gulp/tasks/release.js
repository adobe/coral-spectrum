/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
module.exports = function(gulp) {
  const runSequence = require('run-sequence').use(gulp);
  const gutil = require('gulp-util');
  const exec = require('child_process').exec;
  const git = require('gulp-git');
  const bump = require('gulp-bump');
  const inq = require('inquirer');
  const semver = require('semver');
  
  const CWD = process.cwd();
  const modulePackageJson = require(`${CWD}/package.json`);
  const registry = 'https://artifactory.corp.adobe.com/artifactory/api/npm/npm-coralui-local';
  
  gulp.task('push', function() {
    // Get the current branch name
    exec('git rev-parse --abbrev-ref HEAD', function(err, stdout, stderr) {
      if (err) {
        console.error(stderr);
      }
      else {
        const currentBranch = stdout.trim();
        
        git.push('origin', currentBranch, function(err) {
          if (err) {
            console.error(err.message);
          }
        });
      }
    });
  });
  
  gulp.task('release', function() {
    function beginRelease() {
      runSequence(
        'push',
        'tag-release',
        'npm-publish',
        function (err) {
          if (err) {
            console.error(err.message);
          }
          else {
            console.log('Release successful.');
          }
        }
      );
    }
    
    runSequence(
      'bump-version',
      'test',
      'build',
      function () {
        // Command line shortcut
        if (gutil.env.confirm) {
          beginRelease();
        }
        else {
          inq.prompt({
            type: 'confirm',
            name: 'confirmed',
            message: `Release ${modulePackageJson.version} ?`
          })
            .then(function(res) {
              if (res.confirmed) {
                beginRelease();
              }
            });
        }
      }
    );
  });
  
  gulp.task('npm-publish', function() {
    exec(`npm publish --registry=${registry}`, function(err, stdout, stderr) {
      if (err) {
        console.err(stderr);
      }
      else {
        console.log(stdout);
      }
    });
  });
  
  gulp.task('tag-release', function() {
    const releaseVersion = modulePackageJson.version;
    const releaseMessage = `@releng - Release ${releaseVersion}`;
    
    git.tag(releaseVersion, releaseMessage, function(err) {
      if (err) {
        console.error(err.message);
      }
      
      git.push('origin', releaseVersion, function(err) {
        if (err) {
          console.error(err.message);
        }
      });
    });
  });
  
  gulp.task('bump-version', function() {
    function doVersionBump() {
      gulp.src(`${CWD}/package.json`)
        .pipe(bump({ version: releaseVersion }))
        .pipe(gulp.dest('./'))
        .pipe(git.commit(`@releng - Release ${releaseVersion}`));
    }
    
    var currentVersion = modulePackageJson.version;
    
    // The version we'll actually release
    var releaseVersion = null;
    
    // Potential versions
    var patchVersion = semver.inc(currentVersion, 'patch');
    var minorVersion = semver.inc(currentVersion, 'minor');
    var majorVersion = semver.inc(currentVersion, 'major');
    var preVersion = semver.inc(currentVersion, 'prerelease', 'beta');
    var preMajorVersion = semver.inc(currentVersion, 'premajor', 'beta');
    var preMinorVersion = semver.inc(currentVersion, 'preminor', 'beta');
    var prePatchVersion = semver.inc(currentVersion, 'prepatch', 'beta');
    
    // Command line bump shortcuts
    if (gutil.env.pre) {
      releaseVersion = preVersion
    }
    else if (gutil.env.patch) {
      releaseVersion = patchVersion
    }
    else if (gutil.env.minor) {
      releaseVersion = minorVersion
    }
    else if (gutil.env.major) {
      releaseVersion = majorVersion
    }
    else if (gutil.env.prepatch) {
      releaseVersion = prePatchVersion
    }
    else if (gutil.env.preMinorVersion) {
      releaseVersion = prePatchVersion
    }
    else if (gutil.env.preMajorVersion) {
      releaseVersion = prePatchVersion
    }
    else if (gutil.env.releaseVersion) {
      releaseVersion = gutil.env.releaseVersion
    }
    
    if (releaseVersion) {
      doVersionBump();
    }
    else {
      var choices = [];
      
      if (currentVersion.match('-beta')) {
        choices = choices.concat([
          {
            name: 'prerelease - ' + preVersion,
            value: preVersion
          }
        ]);
      }
      
      if (patchVersion !== majorVersion) {
        // Only provide these options if they're not identical
        // These options will be identical if the current version is a beta of a major version
        choices = choices.concat([
          {
            name: 'patch - ' + patchVersion,
            value: patchVersion
          },
          {
            name: 'minor - ' + minorVersion,
            value: minorVersion
          },
          {
            name: 'major - ' + majorVersion,
            value: majorVersion
          }
        ]);
      }
      else {
        // Provide only the major version if the current version if a beta of a major version
        choices = choices.concat([
          {
            name: 'major - ' + patchVersion,
            value: patchVersion
          }
        ]);
      }
      
      choices = choices.concat([
        {
          name: 'prepatch - ' + prePatchVersion,
          value: prePatchVersion
        },
        {
          name: 'preminor - ' + preMinorVersion,
          value: preMinorVersion
        },
        {
          name: 'premajor - ' + preMajorVersion,
          value: preMajorVersion
        },
        {
          name: 'custom',
          value: 'custom'
        }
      ]);
      
      inq.prompt([{
        type: 'list',
        name: 'version',
        message: `The current version is ${currentVersion}. What version would you like to release ?`,
        choices: choices
      }])
        .then(function(res) {
          if (res.version === 'custom') {
            inq.prompt([{
              type: 'input',
              name: 'version',
              message: 'What version would you like?'
            }])
              .then(function(res) {
                releaseVersion = res.version;
                doVersionBump();
              });
          }
          else {
            releaseVersion = res.version;
            doVersionBump();
          }
        });
    }
  });
};
