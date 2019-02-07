const fs = require('fs-extra');
const path = require('path');

class Externals {
  onHandleConfig(ev) {
    this._config = ev.data.config;
    
    const srcPath = path.resolve(__dirname, 'external-ecmascript.js');
    const outPath = path.resolve(this._config.source, '.external-ecmascript.js');
    
    fs.copySync(srcPath, outPath);
  }
  
  onHandleDocs(ev) {
    const outPath = path.resolve(this._config.source, '.external-ecmascript.js');
    fs.removeSync(outPath);
    
    const name = path.basename(path.resolve(this._config.source)) + '/.external-ecmascript.js';
    for (const doc of ev.data.docs) {
      if (doc.kind === 'external' && doc.memberof === name) doc.builtinExternal = true;
    }
    
    const tagIndex = ev.data.docs.findIndex(doc => doc.kind === 'file' && doc.name === name);
    ev.data.docs.splice(tagIndex, 1);
  }
  
}

module.exports = new Externals();
