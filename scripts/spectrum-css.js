/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Removes invalid CSS see https://github.com/adobe/spectrum-css/issues/656

const fs = require('fs');
const root = process.cwd();
const barLoader = `${root}/node_modules/@adobe/spectrum-css/dist/components/barloader/index-diff.css`;
const coachmark = `${root}/node_modules/@adobe/spectrum-css/dist/components/coachmark/index-diff.css`;

const removeLines = (file, lines) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.startsWith('.spectrum--large {')) {
      fs.writeFileSync(file, content.split('\n').slice(lines).join('\n'), 'utf8');
    }
  }
  catch (e) {}
};

removeLines(barLoader, 8);
removeLines(coachmark, 31);
