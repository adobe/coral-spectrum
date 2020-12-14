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

import {build, target} from './helpers.build';

/**
 Helpers used to test a cloned component.

 @param {String} description - The test description
 @param {Element|String} element - The HTMLElement or markup used to initialize the component.
 @param {Object} [options] - Object that contains configuration values to test.
 @param {Boolean} [options.deepClone=true] - deepClone the component. True, if not provided.
 */
const cloneComponent = function (description, element, options) {
  // sets the default if component should be deep cloned
  options = options || {};
  options.deepClone = options.deepClone || true;

  describe(description, function () {

    var el;
    var elClone;

    beforeEach(function () {

      if (typeof element === 'string') {
        el = build(element);
      } else if (element instanceof HTMLElement) {
        el = target.appendChild(element);
      }

      // Do the clone
      elClone = target.appendChild(el.cloneNode(options.deepClone));
    });

    afterEach(function () {
      el = elClone = null;
    });

    describe('cloned classname', function () {
      // Expect component css classes to match
      var elClassNameArray;
      var elCloneClassNameArray;

      beforeEach(function () {
        elClassNameArray = el.className.split(' ');
        elCloneClassNameArray = elClone.className.split(' ');
      });

      it('should have the same members', function () {
        expect(elCloneClassNameArray).to.have.members(elClassNameArray, 'clone className members does not match');
      });

      it('should have the same length', function () {
        expect(elCloneClassNameArray.length).to.equal(elClassNameArray.length, 'clone className count does not match');
      });
    });

    describe('cloned children', function () {
      var elChildren;
      var elCloneChildren;

      beforeEach(function () {
        elChildren = el.querySelectorAll('*');
        elCloneChildren = elClone.querySelectorAll('*');
      });

      it('should have the same length', function () {
        expect(elCloneChildren.length).to.equal(elChildren.length, 'cloned children count does not match');
      });

      it('should have the same tagname', function () {
        for (var i = 0 ; i < elCloneChildren.length ; i++) {
          expect(elCloneChildren[i].tagName).to.equal(elChildren[i].tagName, 'cloned child tagName does not match');
        }
      });

      it('should have matching classnames', function () {
        for (var i = 0 ; i < elCloneChildren.length ; i++) {
          var elChildrenClassName;
          var elCloneChildrenClassName;

          if (typeof elChildren[i].className === 'string') {
            elChildrenClassName = elChildren[i].className.trim().split(' ');
            elCloneChildrenClassName = elCloneChildren[i].className.trim().split(' ');

            expect(elCloneChildrenClassName).to.have.members(elChildrenClassName,
              'clone child className vs new child className');
            expect(elCloneChildrenClassName.length).to.equal(elChildrenClassName.length,
              'clone child className length vs new child className length');
          }
          // Support <svg>
          else if (typeof elCloneChildren === 'object') {
            elChildrenClassName = elChildren[i].className;
            elCloneChildrenClassName = elCloneChildren[i].className;

            expect(elCloneChildrenClassName).to.deep.equal(elChildrenClassName,
              'clone child className vs new child className');
          }
        }
      });
    });
  });
};

export {cloneComponent};
