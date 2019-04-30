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
