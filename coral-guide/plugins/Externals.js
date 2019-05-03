/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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
