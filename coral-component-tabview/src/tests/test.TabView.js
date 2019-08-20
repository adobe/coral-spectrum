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

import {tracking} from '../../../coral-utils';
import {helpers} from '../../../coral-utils/src/tests/helpers';
import {TabView} from '../../../coral-component-tabview';

describe('TabView', function() {
  
  function testDefaultInstance(el) {
    expect(el.classList.contains('_coral-TabView')).to.be.true;
    expect(el.tabList).not.to.be.null;
    expect(el.panelStack).not.to.be.null;

    expect(el.hasAttribute('orientation')).to.be.true;
  }

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var el = helpers.build(new TabView());
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = helpers.build(document.createElement('coral-tabview'));
      testDefaultInstance(el);
    });

    it('should be possible using markup', function() {
      const el = helpers.build('<coral-tabview></coral-tabview>');
      testDefaultInstance(el);
    });

    it('should position the tablist before the panelstack', function() {
      const el = helpers.build(window.__html__['TabView.order.html']);
      expect(el.tabList).to.equal(el.firstElementChild);
      expect(el.panelStack).to.equal(el.lastElementChild);
    });
  
    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['TabView.base.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new TabView()
    );
  
    helpers.cloneComponent(
      'should be possible to clone an an instance with selected item',
      window.__html__['TabView.selectedItem.html']
    );
  });

  describe('API', function() {
  
    var el;
  
    beforeEach(function() {
      el = helpers.build(new TabView());
    });
  
    afterEach(function() {
      el = null;
    });
    
    describe('#tabList', function() {
      it('should define a coral-tablist content zone by default', function() {
        expect(el.tabList.tagName).to.equal('CORAL-TABLIST');
      });
      
      it('should set a coral-tablist content zone', function() {
        const tabList = document.createElement('coral-tablist');
        el.tabList = tabList;
        expect(el.tabList).to.equal(tabList);
      });
      
      it('support nested coral-tablist', function(done) {
        const tabList = document.createElement('coral-tablist');
        el.tabList.appendChild(tabList);
        // Wait for MO
        helpers.next(() => {
          expect(el.tabList).to.not.equal(tabList);
          done();
        });
      });
    });
  
    describe('#panelStack', function() {
      it('should define a coral-panelstack content zone by default', function() {
        expect(el.panelStack.tagName).to.equal('CORAL-PANELSTACK');
      });
    
      it('should set a coral-panelstack content zone', function() {
        const panelStack = document.createElement('coral-panelstack');
        el.panelStack = panelStack;
        expect(el.panelStack).to.equal(panelStack);
      });
    
      it('support nested coral-panelstack', function(done) {
        const panelStack = document.createElement('coral-panelstack');
        el.panelStack.appendChild(panelStack);
        // Wait for MO
        helpers.next(() => {
          expect(el.panelStack).to.not.equal(panelStack);
          done();
        });
      });
    });

    describe('#orientation', function() {
      it('should default to TabView.orientation.HORIZONTAL', function() {
        expect(el.orientation).to.equal(TabView.orientation.HORIZONTAL);
      });

      it('should be settable', function() {
        el.orientation = TabView.orientation.VERTICAL;
        expect(el.orientation).to.equal(TabView.orientation.VERTICAL);
        expect(el.classList.contains('_coral-TabView--vertical')).to.be.true;
      });
  
      it('should set orientation to tablist', function() {
        const el = helpers.build(window.__html__['TabView.orientation.html']);
        expect(el.orientation).to.equal(TabView.orientation.VERTICAL);
        expect(el.classList.contains('_coral-TabView--vertical')).to.be.true;
        expect(el.tabList.getAttribute('orientation')).to.equal(TabView.orientation.VERTICAL);
      });
    });
  });

  describe('Events', function() {
    describe('#coral-tabview:change', function() {
      it('should trigger when an item is selected', function() {
        const el = helpers.build(window.__html__['TabView.base.html']);
        const tab1 = el.tabList.items.first();
        const tab3 = el.tabList.items.last();
        
        var changeSpy = sinon.spy();
        el.on('coral-tabview:change', changeSpy);
    
        tab3.selected = true;
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.args[0][0].detail.selection).to.equal(tab3);
        expect(changeSpy.args[0][0].detail.oldSelection).to.equal(tab1);
      });
    });
  });
  
  describe('Tracking', function() {
    var trackerFnSpy;
    
    beforeEach(function () {
      trackerFnSpy = sinon.spy();
      tracking.addListener(trackerFnSpy);
    });
    
    afterEach(function () {
      tracking.removeListener(trackerFnSpy);
    });
    
    it('should call the tracker callback with the expected trackData parameters when a panel is displayed', function (done) {
      const el = helpers.build(window.__html__['TabView.tracking.html']);
      
      // Wait for selection MOs to finish
      helpers.next(function() {
        el.querySelector('coral-tab:nth-child(2)').click();
        expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called only once.');
        
        var spyCall = trackerFnSpy.getCall(0);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', 'coral-tab');
        expect(trackData).to.have.property('targetElement', 'element name');
        expect(trackData).to.have.property('eventType', 'display');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootElement', 'element name');
        expect(trackData).to.have.property('rootType', 'coral-tabview');
        done();
      });
    });
  });
});
