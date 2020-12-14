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
import {SideNav} from '../../../coral-component-sidenav';

describe('SideNav', function () {

  describe('Namespace', function () {
    it('should define the variants in an enum', function () {
      expect(SideNav.variant).to.exist;
      expect(SideNav.variant.DEFAULT).to.equal('default');
      expect(SideNav.variant.MULTI_LEVEL).to.equal('multilevel');
      expect(Object.keys(SideNav.variant).length).to.equal(2);
    });
  });

  describe('Instantiation', function () {
    function testDefaultInstance(el) {
      expect(el.classList.contains('_coral-SideNav')).to.be.true;
    }

    it('should be possible using new', function () {
      const el = helpers.build(new SideNav());
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function () {
      const el = helpers.build(document.createElement('coral-sidenav', {is: 'coral-sidenav'}));
      testDefaultInstance(el);
    });

    it('should be possible using markup', function () {
      const el = helpers.build(window.__html__['SideNav.base.html']);
      testDefaultInstance(el);
    });

    helpers.cloneComponent(
      'should be possible to clone using markup',
      helpers.build(window.__html__['SideNav.base.html'])
    );

    const el = new SideNav();
    el.items.add({
      content: {
        textContent: 'Item'
      }
    });

    helpers.cloneComponent(
      'should be possible to clone using js',
      el
    );
  });

  describe('API', function () {
    let el;
    let item1;
    let item2;
    let item3;

    beforeEach(function (done) {
      el = helpers.build(new SideNav());

      item1 = new SideNav.Item();
      item2 = new SideNav.Item();
      item3 = new SideNav.Item();

      item1.content.textContent = 'Item 1';
      item1.value = '1';
      item2.content.textContent = 'Item 2';
      item2.value = '2';
      item3.content.textContent = 'Item 3';
      item3.value = '3';

      el.items.add(item1);
      el.items.add(item2);
      el.items.add(item3);

      // Wait for MO
      helpers.next(function () {
        done();
      });
    });

    afterEach(function () {
      el = item1 = item2 = item3 = null;
    });

    describe('#selectedItem', function () {
      it('should default to null', function () {
        expect(el.selectedItem).to.equal(null);
      });

      it('should not be settable', function () {
        try {
          el.selectedItem = item2;
        } catch (e) {
          expect(el.selectedItem).to.equal(null);
        }
      });

      it('should update to the selected value', function () {
        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);
      });
    });

    describe('#variant', function () {
      it('should be initially SideNav.variant.DEFAULT', function () {
        expect(el.variant).to.equal(SideNav.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(SideNav.variant.DEFAULT);
      });

      it('should set the new variant', function () {
        el.variant = SideNav.variant.MULTI_LEVEL;

        expect(el.variant).to.equal('multilevel');
        expect(el.classList.contains('_coral-SideNav--multiLevel')).to.be.true;
      });
    });

    describe('#items', function () {
      it('should be possible to add/remove items via Collection API', function (done) {
        expect(el.items.length).to.equal(3);

        const item = el.items.add();
        expect(el.items.length).to.equal(4);

        el.items.remove(item);
        expect(el.items.length).to.equal(3);

        el.items.add({
          selected: true
        });

        // Wait for MO
        helpers.next(() => {
          expect(el.selectedItem).to.equal(el.items.last());

          el.items.clear();
          expect(el.items.length).to.equal(0);
          done();
        });
      });
    });
  });

  describe('Markup', function () {
    describe('#variant', function () {
      it('should set the default variant', function () {
        const el = helpers.build(window.__html__['SideNav.base.html']);
        expect(el.getAttribute('variant')).to.equal(SideNav.variant.DEFAULT);
      });

      it('should set the new variant', function () {
        const el = helpers.build(window.__html__['SideNav.base.html']);

        el.setAttribute('variant', SideNav.variant.MULTI_LEVEL);
        expect(el.getAttribute('variant')).to.equal(SideNav.variant.MULTI_LEVEL);
        expect(el.classList.contains('_coral-SideNav--multiLevel')).to.be.true;
      });

      it('should expand until root if nested item is selected', function () {
        const el = helpers.build(window.__html__['SideNav.multilevel.withSelection.html']);
        expect(el.querySelector('coral-sidenav-level:not([_expanded="on"])')).to.equal(null);
      });
    });

    describe('#selectedItem', function () {
      it('should select via attributes', function () {
        const el = helpers.build(window.__html__['SideNav.base.html']);
        el.items.first().setAttribute('selected', '');
        expect(el.items.first().hasAttribute('selected')).to.be.true;
        expect(el.items.last().hasAttribute('selected')).to.be.false;

        el.items.last().setAttribute('selected', '');
        expect(el.items.first().hasAttribute('selected')).to.be.false;
        expect(el.items.last().hasAttribute('selected')).to.be.true;
      });

      it('should allow nested item selection', function () {
        const el = helpers.build(window.__html__['SideNav.multilevel.withSelection.html']);
        expect(el.selectedItem.textContent.trim()).to.equal('Level 3.3.3');
      });
    });

    describe('#items', function () {
      it('should be possible to add/remove items via Collection API', function (done) {
        const el = helpers.build(window.__html__['SideNav.base.html']);

        expect(el.items.length).to.equal(3);

        const item = el.appendChild(document.createElement('a', {is: 'coral-sidenav-item'}));
        expect(el.items.length).to.equal(4);

        el.items.remove(item);
        expect(el.items.length).to.equal(3);

        const selectedItem = document.createElement('a', {is: 'coral-sidenav-item'});
        selectedItem.setAttribute('selected', '');
        el.appendChild(selectedItem);

        // Wait for MO
        helpers.next(() => {
          expect(el.selectedItem).to.equal(el.items.last());

          el.items.clear();
          expect(el.items.length).to.equal(0);

          done();
        });
      });
    });
  });

  describe('Events', function () {
    describe('#coral-sidenav:change', function () {
      it('should trigger a change event when selection is manually changed', function (done) {
        const el = helpers.build(window.__html__['SideNav.base.selected.html']);
        const changeSpy = sinon.spy();
        el.on('coral-sidenav:change', changeSpy);

        el.items.last().selected = true;

        // Wait for MO
        helpers.next(() => {
          expect(changeSpy.callCount).to.equal(1);
          expect(changeSpy.args[0][0].detail.selection).to.equal(el.items.last());
          expect(changeSpy.args[0][0].detail.oldSelection).to.equal(el.items.first());

          done();
        });
      });

      it('should trigger a change event when selected item is added', function (done) {
        const el = helpers.build(window.__html__['SideNav.base.selected.html']);
        const changeSpy = sinon.spy();
        el.on('coral-sidenav:change', changeSpy);

        el.items.add({
          selected: true
        });

        // Wait for MO
        helpers.next(() => {
          expect(changeSpy.callCount).to.equal(1);
          expect(changeSpy.args[0][0].detail.selection).to.equal(el.items.last());
          expect(changeSpy.args[0][0].detail.oldSelection).to.equal(el.items.first());

          done();
        });
      });

      it('should trigger a change event when selected item is removed', function (done) {
        const el = helpers.build(window.__html__['SideNav.base.selected.html']);
        const changeSpy = sinon.spy();
        el.on('coral-sidenav:change', changeSpy);

        const selectedItem = el.selectedItem;
        selectedItem.remove();

        // Wait for MO
        helpers.next(() => {
          expect(changeSpy.callCount).to.equal(1);
          expect(changeSpy.args[0][0].detail.selection).to.equal(null);
          expect(changeSpy.args[0][0].detail.oldSelection).to.equal(selectedItem);

          done();
        });
      });

      it('should trigger a change event when selected item is removed via level', function (done) {
        const el = helpers.build(window.__html__['SideNav.multilevel.withSelection.html']);
        const changeSpy = sinon.spy();
        el.on('coral-sidenav:change', changeSpy);

        const selectedItem = el.selectedItem;
        const level = el.selectedItem.closest('coral-sidenav-level');
        level.remove();

        // Wait for MO
        helpers.next(() => {
          expect(changeSpy.callCount).to.equal(1);
          expect(changeSpy.args[0][0].detail.selection).to.equal(null);
          expect(changeSpy.args[0][0].detail.oldSelection).to.equal(selectedItem);

          done();
        });
      });
    });
  });

  describe('Accessibility', function () {
    describe('Heading', function () {
      it('should link heading with level on initialization', function () {
        const el = helpers.build(window.__html__['SideNav.withHeading.html']);
        Array.from(el._levels).forEach((level) => {
          const heading = level.previousElementSibling;
          expect(heading.getAttribute('role')).to.equal('heading');
          expect(level.getAttribute('aria-labelledby')).to.equal(heading.id);
        });
      });

      it('should link heading with level on adding level', function (done) {
        const el = helpers.build(window.__html__['SideNav.withHeading.html']);
        const heading = document.createElement('coral-sidenav-heading');
        const level = document.createElement('coral-sidenav-level');

        el.appendChild(heading);
        el.appendChild(level);

        // Wait for MO
        helpers.next(() => {
          expect(level.getAttribute('aria-labelledby')).to.equal(heading.id);
          done();
        });
      });

      it('should link heading with level on adding heading', function (done) {
        const el = helpers.build(window.__html__['SideNav.base.html']);
        const heading = document.createElement('coral-sidenav-heading');
        const level = document.createElement('coral-sidenav-level');

        el.appendChild(level);
        el.insertBefore(heading, level);

        // Wait for MO
        helpers.next(() => {
          expect(level.getAttribute('aria-labelledby')).to.equal(heading.id);
          done();
        });
      });

      it('should unlink heading with level on removing heading', function (done) {
        const el = helpers.build(window.__html__['SideNav.withHeading.html']);
        el._headings[0].remove();

        // Wait for MO
        helpers.next(() => {
          expect(el._levels[0].hasAttribute('aria-labelledby')).to.be.false;
          done();
        });
      });
    });

    describe('Item', function () {
      it('should link item with level on initialization', function () {
        const el = helpers.build(window.__html__['SideNav.multilevel.html']);
        Array.from(el._levels).forEach((level) => {
          const item = level.previousElementSibling;
          expect(item.getAttribute('aria-controls')).to.equal(level.id);
          expect(level.getAttribute('aria-labelledby')).to.equal(item.id);
        });
      });

      it('should link item with level on adding level', function (done) {
        const el = helpers.build(window.__html__['SideNav.base.html']);
        const level = document.createElement('coral-sidenav-level');
        const item = el.items.last();
        el.appendChild(level);

        // Wait for MO
        helpers.next(() => {
          expect(item.getAttribute('aria-controls')).to.equal(level.id);
          expect(level.getAttribute('aria-labelledby')).to.equal(item.id);
          done();
        });
      });

      it('should link item with level on adding item', function (done) {
        const el = helpers.build(window.__html__['SideNav.multilevel.html']);
        const level = el._levels[0];
        const item = new SideNav.Item();
        el.insertBefore(item, level);

        // Wait for MO
        helpers.next(() => {
          expect(item.getAttribute('aria-controls')).to.equal(level.id);
          expect(level.getAttribute('aria-labelledby')).to.equal(item.id);
          done();
        });
      });

      it('should unlink item with level on removing item', function (done) {
        const el = helpers.build(window.__html__['SideNav.multilevel.html']);
        const level = el._levels[0];
        const item2 = el.items.getAll()[1];
        const item3 = el.items.getAll()[2];

        expect(item3.getAttribute('aria-controls')).to.equal(level.id);
        expect(level.getAttribute('aria-labelledby')).to.equal(item3.id);

        item3.remove();

        // Wait for MO
        helpers.next(() => {
          expect(item2.getAttribute('aria-controls')).to.equal(level.id);
          expect(level.getAttribute('aria-labelledby')).to.equal(item2.id);
          done();
        });
      });
    });
  });
});
