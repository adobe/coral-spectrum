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

const path = require('path');
const CWD = process.cwd();

let root;
let isTLB;
let packageJSON;

try {
  root = CWD;
  packageJSON = require(path.join(root, 'package.json'));
  isTLB = true;
}
catch (e) {
  root = path.join(root, '..');
  packageJSON = require(path.join(root, 'package.json'));
  isTLB = false;
}

module.exports = {
  getRoot: function() {
    return root;
  },
  isTLB: function() {
    return isTLB;
  },
  getPackageJSON() {
    return packageJSON;
  }
};
