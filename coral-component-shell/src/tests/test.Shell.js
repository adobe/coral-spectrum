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

describe('Shell', function () {

  describe('Instantiation', function () {
    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['Shell.base.html']
    );

    helpers.cloneComponent(
      'should be possible to clone using js',
      new Shell()
    );
  });

  describe('API', function () {
    var el;

    beforeEach(function () {
      el = helpers.build(new Shell());
    });

    afterEach(function () {
      el = null;
    });

    describe('#header', function () {
      it('should be defined', function () {
        expect(el.header).to.exist;
      });

      it('should be a content zone', function () {
        el.header.appendChild(document.createElement('button'));
        expect(el.header.children.length).not.to.equal(0);
      });
    });

    describe('#menus', function () {
      it('should be defined', function () {
        expect(el.header).to.exist;
      });

      it('should return a collection of menus', function () {
        expect(el.menus).to.exist;
        el.menus.add();
        expect(el.querySelector('coral-shell-menu')).to.equal(el.menus.first());
      });
    });

    describe('#content', function () {
      it('should be defined', function () {
        expect(el.content).to.exist;
      });

      it('should be a content zone', function () {
        el.content.appendChild(document.createElement('button'));
        expect(el.content.children.length).not.to.equal(0);
      });
    });
  });

  describe('Markup', function () {
    describe('#header', function () {
      it('should be created if not provided', function () {
        const el = helpers.build(window.__html__['Shell.base.html']);
        expect(el.header).to.equal(el.children[0]);
      });
    });

    describe('#content', function () {
      it('should be created if not provided', function () {
        const el = helpers.build(window.__html__['Shell.base.html']);
        expect(el.content).to.equal(el.children[1]);
        expect(el.content.textContent.trim()).to.equal('This is the content.');
      });

      it('should keep an existing content if provided', function () {
        const el = helpers.build(window.__html__['Shell.content.html']);
        const title = el.querySelector('h1');
        expect(el.contains(title)).to.be.true;
        expect(el.content.contains(title)).to.be.false;
      });
    });

    describe('#menus', function () {
      it('should keep an existing content if provided', function () {
        const el = helpers.build(window.__html__['Shell.content.html']);
        expect(el.menus.length).to.equal(3);
        el.menus.getAll().forEach(function (menu) {
          expect(el.content.contains(menu)).to.be.false;
        });
      });
    });
  });
});
