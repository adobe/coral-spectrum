/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */
module.exports = function(gulp) {
  const fs = require('fs');
  const exec = require('child_process').exec;
  const spawn = require('child_process').spawn;
  const runSequence = require('run-sequence').use(gulp);
  const del = require('del');
  const inq = require('inquirer');
  const semver = require('semver');
  
  const gutil = require('gulp-util');
  const git = require('gulp-git');
  const bump = require('gulp-bump');
  
  const util = require('../helpers/util');
  const root = util.getRoot();
  const CWD = process.cwd();
  let modulePackageJson = util.getPackageJSON();
  const registry = 'https://artifactory.corp.adobe.com/artifactory/api/npm/npm-coralui-local';
  
  // The version we'll actually release
  let releaseVersion;
  
  // Push current branch commits to origin
  gulp.task('push', function(cb) {
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
          
          cb();
        });
      }
    });
  });
  
  // Publish release to artifactory
  gulp.task('npm-publish', function(cb) {
    exec(`npm publish --registry=${registry}`, function(err, stdout, stderr) {
      if (err) {
        console.error(stderr);
      }
      else {
        console.log(stdout);
        
        cb();
      }
    });
  });
  
  // Tag and push release
  gulp.task('tag-release', function(cb) {
    // Read updated package.json
    modulePackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    releaseVersion = modulePackageJson.version;
    
    const releaseMessage = `releng - Release ${releaseVersion}`;
    
    git.tag(releaseVersion, releaseMessage, function(err) {
      if (err) {
        console.error(err.message);
      }
      
      git.push('origin', releaseVersion, function(err) {
        if (err) {
          console.error(err.message);
        }
        
        cb();
      });
    });
  });
  
  // Increase release version based on user choice
  gulp.task('bump-version', function(cb) {
    function doVersionBump() {
      gulp.src([`${CWD}/package.json`, `${CWD}/package-lock.json`])
        .pipe(bump({version: releaseVersion}))
        .pipe(gulp.dest('./'))
        .pipe(git.commit(`releng - Release ${releaseVersion}`));
      
      cb();
    }
    
    const currentVersion = modulePackageJson.version;
    
    // Potential versions
    const patchVersion = semver.inc(currentVersion, 'patch');
    const minorVersion = semver.inc(currentVersion, 'minor');
    const majorVersion = semver.inc(currentVersion, 'major');
    const preVersion = semver.inc(currentVersion, 'prerelease', 'beta');
    const preMajorVersion = semver.inc(currentVersion, 'premajor', 'beta');
    const preMinorVersion = semver.inc(currentVersion, 'preminor', 'beta');
    const prePatchVersion = semver.inc(currentVersion, 'prepatch', 'beta');
    
    // Command line bump shortcuts
    if (gutil.env.pre) {
      releaseVersion = preVersion;
    }
    else if (gutil.env.patch) {
      releaseVersion = patchVersion;
    }
    else if (gutil.env.minor) {
      releaseVersion = minorVersion;
    }
    else if (gutil.env.major) {
      releaseVersion = majorVersion;
    }
    else if (gutil.env.prepatch) {
      releaseVersion = prePatchVersion;
    }
    else if (gutil.env.preMinorVersion) {
      releaseVersion = prePatchVersion;
    }
    else if (gutil.env.preMajorVersion) {
      releaseVersion = prePatchVersion;
    }
    else if (gutil.env.releaseVersion) {
      releaseVersion = gutil.env.releaseVersion;
    }
    
    if (releaseVersion) {
      doVersionBump();
    }
    else {
      let choices = [];
      
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
  
  gulp.task('prepare', () => {
    if (CWD !== root) {
      console.error('Prepare aborted: not in root folder.');
    
      return;
    }
    
    spawn(`
      gulp build &&
      gulp karma &&
      gulp examples &&
      gulp minify &&
      cd coral-component-playground && gulp build &&
      cd .. &&
      gulp playground &&
      gulp docs &&
      gulp push &&
      gulp tag-release &&
      gulp npm-publish
    `, [], {shell: true, stdio: 'inherit'});
  });
  
  // Full release task
  gulp.task('release', function() {
    if (CWD !== root) {
      console.error('Release aborted: not in root folder.');
  
      return;
    }
    
    runSequence(
      'bump-version',
      function() {
        // Command line shortcut
        if (gutil.env.confirm) {
          runSequence('prepare');
        }
        else {
          inq.prompt({
            type: 'confirm',
            name: 'confirmed',
            message: `Release ${releaseVersion} ?`
          })
            .then(function(res) {
              if (res.confirmed) {
                runSequence('prepare');
              }
            });
        }
      }
    );
  });
};
