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

import {helpers} from '../../../coral-utils/src/tests/helpers';
import {Shell} from '../../../coral-component-shell';

describe('Shell.SolutionSwitcher', function () {
  describe('Namespace', function () {
    it('should be defined in the Shell namespace', function () {
      expect(Shell).to.have.property('SolutionSwitcher');
      expect(Shell).to.have.property('Solutions');
      expect(Shell).to.have.property('Solution');
      expect(Shell.Solution).to.have.property('Label');
    });
  });

  describe('Initialization', function () {
    it('should support creation from markup', function () {
      const el = helpers.build(window.__html__['Shell.SolutionSwitcher.base.html']);
      expect(el instanceof Shell.SolutionSwitcher).to.equal(true);
    });

    it('should support creation from js', function () {
      var el = helpers.build(new Shell.SolutionSwitcher());
      expect(el instanceof Shell.SolutionSwitcher).to.equal(true);
    });

    it('should alphabetically sort linked solutions then non linked solutions', function () {
      const el = helpers.build(window.__html__['Shell.SolutionSwitcher.base.html']);
      const solutions = el.querySelectorAll('a[is="coral-shell-solution"]');
      for (let i = 0 ; i < solutions.length ; i++) {
        expect(solutions[i].id).to.equal(`solution-${i}`);
      }
    });

    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['Shell.SolutionSwitcher.base.html']
    );

    const el = new Shell.SolutionSwitcher();
    const solutions = el.items.add();
    solutions.items.add();

    helpers.cloneComponent(
      'should be possible to clone using js',
      el
    );
  });
});
