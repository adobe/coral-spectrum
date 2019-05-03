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
import {tracking} from '../../../coral-utils';
import {Multifield} from '../../../coral-component-multifield';

describe('Multifield', function() {
  // Mock for dragging
  function dragTo(dragAction, x, y) {
    var action = function(type, x, y) {
      dragAction[type]({
        pageX: x,
        pageY: y,
        preventDefault: function() {},
        target: {}
      });
    };
    action('_dragStart', 0, 0);
    action('_drag', x, y);
    action('_dragEnd', x, y);
  }
  
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Multifield).to.have.property('Item');
      expect(Multifield.Item).to.have.property('Content');
    });
  });
  
  describe('Instantation', function() {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['Multifield.nested.html']
    );
    
    var el = new Multifield();
    el.items.add();
    helpers.cloneComponent(
      'should be possible to clone using js',
      el
    );
  });

  describe('API', function() {
    describe('#items', function() {});
    describe('#template', function() {});
    describe('#coral-multifield-add', function() {});
    describe('#coral-multifield-template', function() {});
  });

  describe('Markup', function() {
    describe('#items', function() {});
    describe('#template', function() {});
    describe('#coral-multifield-add', function() {});
    describe('#coral-multifield-template', function() {});
  });

  describe('Collection API', function() {
    it('#items cannot be set', function() {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      var items = el.items;
      try {
        el.items = null;
      }
      catch (e) {
        expect(el.items).to.equal(items);
      }
    });

    it('triggers coral-collection:add on appendChild', function(done) {
      var eventSpy = sinon.spy();
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.on('coral-collection:add', eventSpy);
      var item = el.appendChild(new Multifield.Item());
      
      // Wait for MO
      helpers.next(function() {
        var all = el.items.getAll();
        expect(all.length).to.equal(1);
        expect(all[0]).to.equal(item);
        expect(eventSpy.callCount).to.equal(1);
        done();
      });
    });

    it('triggers coral-collection:remove on removeChild', function(done) {
      var eventSpy = sinon.spy();
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.on('coral-collection:remove', eventSpy);
      var item = el.items.add({});
      
      // Wait for MO
      helpers.next(function() {
        el.removeChild(item);
        
        // Wait for MO
        helpers.next(function() {
          expect(el.items.length).to.equal(0);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('#add with before null should insert at the beginning if there are no items', function() {
      var el = new Multifield();
      var item = new Multifield.Item();
      el.items.add(item, null);
      var all = el.items.getAll();
      expect(all.length).to.equal(1);
      expect(all[0]).to.equal(item);
      expect(el.firstChild).to.equal(all[0]);
    });

    it('#add with before null should insert at the end of the last item if at least one item', function() {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.items.add(new Multifield.Item(), null);
      var item = el.items.add(new Multifield.Item(), null);
      var all = el.items.getAll();
      expect(all.length).to.equal(2);
      expect(all[1]).to.equal(item);
      expect(all[0].nextElementSibling).to.equal(all[1]);
    });

    it('#add is able to insert before', function() {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.items.add(new Multifield.Item());
      var item = el.items.add(new Multifield.Item(), el.items.getAll()[0]);
      var all = el.items.getAll();
      expect(all.length).to.equal(2);
      expect(all[0]).to.equal(item);
    });

    it('#add should also support config', function() {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      var item = el.items.add({});
      var all = el.items.getAll();
      expect(all.length).to.equal(1);
      expect(all[0]).to.equal(item);
      expect(item.tagName).to.equal('CORAL-MULTIFIELD-ITEM');
    });

    it('should trigger coral-collection:add event when adding an item', function(done) {
      var eventSpy = sinon.spy();
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.on('coral-collection:add', eventSpy);
      el.items.add(new Multifield.Item());
      
      // Wait for MO
      helpers.next(function() {
        expect(eventSpy.callCount).to.equal(1, 'coral-collection:add should be called once');
        done();
      });
    });

    it('should trigger coral-collection:remove event when removing an item', function(done) {
      var eventSpy = sinon.spy();
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.on('coral-collection:remove', eventSpy);
      el.items.add(new Multifield.Item());
      
      // Wait for MO
      helpers.next(function() {
        
        el.items.remove(el.items.getAll()[0]);

        // Wait for MO
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'coral-collection:remove should be called once');
          expect(el.items.length).to.equal(0);
          done();
        });
      });
    });

    it('#getAll should be empty initially', function() {
      expect((new Multifield()).items.getAll().length).to.equal(0);
    });

    it('#getAll should retrieve 1 item', function() {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.items.add(new Multifield.Item());
      expect(el.items.getAll().length).to.equal(1);
    });

    it('#clear should remove all items', function() {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.items.add(new Multifield.Item());
      el.items.add(new Multifield.Item());
      el.items.clear();
      expect(el.items.length).to.equal(0);
    });
  });

  describe('User Interaction', function() {
    it('should add an item if clicking the add content zone', function() {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.querySelector('[coral-multifield-add]').click();
      
      expect(el.items.length).to.equal(1);
    });

    it('should remove an item if clicking the remove button', function() {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.items.add({});
      el.items.getAll()[0]._elements.remove.click();
      
      expect(el.items.length).to.equal(0);
    });
  });

  describe('Events', function() {

    describe('#change', function() {
      it('should not trigger change event if item is removed and parent is not multifield', function() {
        var eventSpy = sinon.spy();
        var item = new Multifield.Item();
        helpers.target.appendChild(item);
        item.parentNode.addEventListener('change', eventSpy);
        item._elements.remove.click();
        
        expect(eventSpy.callCount).to.equal(0);
      });

      it('should trigger a change event if removing a button by clicking the remove button', function() {
        var eventSpy = sinon.spy();
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.addEventListener('change', eventSpy);
        var item = el.items.add({});
        item._elements.remove.click();
        
        expect(eventSpy.callCount).to.equal(1);
      });

      it('should trigger a change event if reordering the items by drag and drop to bottom', function(done) {
        var eventSpy = sinon.spy();
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.addEventListener('change', eventSpy);
        el.items.add({});
        el.items.add({});
        
        // Wait for MO
        helpers.next(function() {
          expect(el.items.length).to.equal(2);
          dragTo(el.items.getAll()[0].dragAction, 0, 100);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });

      it('should trigger a change event if reordering the items by drag and drop to top', function(done) {
        var eventSpy = sinon.spy();
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.addEventListener('change', eventSpy);
        el.items.add({});
        el.items.add({});
        
        // Wait fo MO
        helpers.next(function() {
          expect(el.items.length).to.equal(2);
          dragTo(el.items.getAll()[1].dragAction, 0, 0);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    });
  
    describe('#itemorder', function() {
      it('should trigger a coral-multifield:itemorder event when reordering', function(done) {
        var eventSpy = sinon.spy();
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.addEventListener('coral-multifield:itemorder', eventSpy);
        el.items.add({});
        el.items.add({});
        helpers.next(function() {
          expect(el.items.length).to.equal(2);
          dragTo(el.items.getAll()[0].dragAction, 0, 100);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    
      it('should trigger a coral-multifield:beforeitemorder event before reordering', function(done) {
        var eventSpy = sinon.spy();
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.addEventListener('coral-multifield:beforeitemorder', eventSpy);
        el.items.add({});
        el.items.add({});
        helpers.next(function() {
          expect(el.items.length).to.equal(2);
          dragTo(el.items.getAll()[0].dragAction, 0, 100);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    
      it('should not trigger change event if coral-multifield:beforeitemorder event was prevented', function(done) {
        var eventSpy = sinon.spy();
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.addEventListener('change', eventSpy);
        el.items.add({});
        el.items.add({});
        helpers.next(function() {
          el.addEventListener('coral-multifield:beforeitemorder', function(e) {
            e.preventDefault();
            return false;
          });
          expect(el.items.length).to.equal(2);
          dragTo(el.items.getAll()[0].dragAction, 0, 100);
          expect(eventSpy.callCount).to.equal(0);
          done();
        });
      });
    });
  });

  describe('Implementation Details', function() {
    it('should support nested multifield', function(done) {
      const el = helpers.build(window.__html__['Multifield.nested.html']);
      el.items.add();
      
      // Wait for MO
      helpers.next(function() {
        var firstNested = el.items.first().content.firstElementChild;
        var lastNested = el.items.last().content.firstElementChild;
        expect(lastNested.tagName).to.equal(firstNested.tagName);
        expect(lastNested.items.length).to.equal(firstNested.items.length);
        expect(lastNested.template.innerHTML).to.equal(firstNested.template.innerHTML);
        done();
      });
    });
  });
  
  describe('Tracking', function() {
    var trackerFnSpy;
    
    beforeEach(function() {
      trackerFnSpy = sinon.spy();
      tracking.addListener(trackerFnSpy);
    });
    
    afterEach(function() {
      tracking.removeListener(trackerFnSpy);
    });
    
    it('should call tracker callback only once when the "add" button is clicked', function(done) {
      const el = helpers.build(window.__html__['Multifield.base.trackingOnWithAttrs.html']);
      el.querySelector('[coral-multifield-add]').click();
      helpers.next(function() {
        expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should be called once.');
        done();
      });
    });
    
    it('should call tracker callback with expected track data values when the "add" button is clicked', function(done) {
      const el = helpers.build(window.__html__['Multifield.base.trackingOnWithAttrs.html']);
      el.querySelector('[coral-multifield-add]').click();
      helpers.next(function() {
        var spyCall = trackerFnSpy.getCall(0);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', 'add item button');
        expect(trackData).to.have.property('targetElement', 'tag cloud');
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootFeature', 'sites');
        expect(trackData).to.have.property('rootElement', 'tag cloud');
        expect(trackData).to.have.property('rootType', 'coral-multifield');
        done();
      });
    });
    
    it('should call tracker callback with expected track data values when "remove" button is clicked', function(done) {
      const el = helpers.build(window.__html__['Multifield.base.trackingOnWithAttrs.html']);
      el.querySelector('[coral-multifield-add]').click();
      
      helpers.next(function() {
        // Click on remove.
        el.querySelector('button[handle="remove"]').click();
        
        helpers.next(function() {
          expect(trackerFnSpy.callCount).to.equal(2, 'Track callback should be called twice.');
          var spyCall = trackerFnSpy.getCall(1);
          var trackData = spyCall.args[0];
          expect(trackData).to.have.property('targetType', 'remove item button');
          expect(trackData).to.have.property('targetElement', 'tag cloud');
          expect(trackData).to.have.property('eventType', 'click');
          expect(trackData).to.have.property('rootFeature', 'sites');
          expect(trackData).to.have.property('rootElement', 'tag cloud');
          expect(trackData).to.have.property('rootType', 'coral-multifield');
          done();
        });
      });
    });
    
    it('should call tracker callback with expected track data values when a field value changes', function(done){
      const el = helpers.build(window.__html__['Multifield.base.trackingOnWithAttrs.html']);
      el.items.add(new Multifield.Item());
      
      helpers.next(function() {
        var inputEl = el.querySelector('input');
        inputEl.value = 'a';
        helpers.event('change', inputEl, {bubbles: true});
        
        var spyCall = trackerFnSpy.getCall(0);
        var targetData = spyCall.args[0];
        
        expect(trackerFnSpy.callCount).to.equal(1);
        expect(targetData).to.have.property('targetType', 'input');
        expect(targetData).to.have.property('eventType', 'change');
        done();
      });
    });
  });
});
