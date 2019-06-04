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

import {BaseComponent} from '../../../coral-base-component';
import {tracking} from '../../../coral-utils';
import {helpers} from '../../../coral-utils/src/tests/helpers';

describe('tracking', function() {
  class ComponentTestForTrackComponent extends BaseComponent(HTMLElement) {
    constructor() {
      super();
      
      this._delegateEvents({
        'click': '_onClick',
        'click coral-component-test-for-track-item': '_onClickItem',
      });
    }
    
    _onClick (event) {
      event.stopPropagation();
      
      this._trackEvent('click', 'componenttestfortrackcomponent', event);
    }
    
    _onClickItem(event) {
      event.stopPropagation();
      
      const item = event.matchedTarget;
      this._trackEvent('click', 'coral-component-test-for-track-item', event, item);
    }
  }
  
  class ComponentTestForTrackComponentItem extends BaseComponent(HTMLElement) {
    constructor() {
      super();
    }
  }
  
  window.customElements.define('coral-component-test-for-track', ComponentTestForTrackComponent);
  window.customElements.define('coral-component-test-for-track-item', ComponentTestForTrackComponentItem);
  
  describe('API', function() {
    
    it('should register three distinct trackers', function() {
      var trackerFnSpy1 = sinon.spy();
      var trackerFnSpy2 = sinon.spy();
      var trackerFnSpy3 = sinon.spy();
      
      tracking.addListener(trackerFnSpy1);
      tracking.addListener(trackerFnSpy2);
      tracking.addListener(trackerFnSpy3);
      
      var component = new ComponentTestForTrackComponent();
      component.click();
      
      expect(trackerFnSpy1.callCount).to.equal(1, 'Track callback 1 should be called three times.');
      expect(trackerFnSpy2.callCount).to.equal(1, 'Track callback 2 should be called three times.');
      expect(trackerFnSpy3.callCount).to.equal(1, 'Track callback 3 should be called three times.');
      
      tracking.removeListener(trackerFnSpy1);
      tracking.removeListener(trackerFnSpy2);
      tracking.removeListener(trackerFnSpy3);
    });
    
    it('should throw an exception when adding a tracker that doesn\'t have a callback function', function() {
      expect(function() { tracking.addListener(); }).to.throw('Coral.Tracking: Tracker must be a function callback.');
    });
    
    it('should throw an exception when adding a second tracker with the same name previously used is added', function() {
      var trackerCallback = function() {};
      tracking.addListener(trackerCallback);
      expect(function() { tracking.addListener(trackerCallback); }).to.throw('Coral.Tracking: Tracker callback cannot be added twice.');
      tracking.removeListener(trackerCallback);
    });
    
    it('should notify trackers when they exist', function() {
      var notifySpy = sinon.spy(tracking, 'track');
      var trackerCallback = function() {};
      tracking.addListener(trackerCallback);
      
      var component = new ComponentTestForTrackComponent();
      component.click();
      
      expect(notifySpy.callCount).to.equal(1, 'track was not called.');
      expect(notifySpy.getCall(0).returnValue).to.be.true;
      
      tracking.removeListener(trackerCallback);
      component.click();
      
      expect(notifySpy.callCount).to.equal(2, 'track was not called twice.');
      expect(notifySpy.getCall(1).returnValue).to.be.false;
      
      notifySpy.restore();
    });
    
  });
  
  describe('Component', function() {
    
    var trackerFnSpy;
    
    beforeEach(function() {
      trackerFnSpy = sinon.spy();
      tracking.addListener(trackerFnSpy);
    });
    
    afterEach(function() {
      tracking.removeListener(trackerFnSpy);
      trackerFnSpy = null;
    });
    
    it('should have tracking enabled by default at component level', function() {
      var component = new ComponentTestForTrackComponent();
      expect(component.tracking).to.equal(ComponentTestForTrackComponent.tracking.ON, 'Tracking should be enabled by default.');
    });
    
    it('should call tracker callback fn once when the component is clicked', function() {
      var component = new ComponentTestForTrackComponent();
      component.click();
      
      expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should be called once.');
    });
    
    it('should not call the tracker callback fn when component has tracking=off attribute', function() {
      var component = new ComponentTestForTrackComponent();
      component.setAttribute('tracking', ComponentTestForTrackComponent.tracking.OFF);
      component.click();
      
      expect(trackerFnSpy.callCount).to.equal(0, 'Tracking was performed while being disabled.');
    });
    
    it('should call the tracker callback fn with parameters: trackData, event, component, childComponent', function() {
      var component = new ComponentTestForTrackComponent();
      component.click();
      
      var spyCall = trackerFnSpy.getCall(0);
      var trackData = spyCall.args[0];
      
      expect(spyCall.args.length).to.equal(4);
      expect(trackData).to.be.an.instanceof(Object);
      expect(Object.keys(trackData)).to.have.lengthOf(6);
      expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(ComponentTestForTrackComponent);
      expect(spyCall.args[3]).to.be.an.undefined;
    });
    
    it('should call the tracker callback fn with trackData object as the first parameter and it contains all expected properties', function() {
      var component = new ComponentTestForTrackComponent();
      component.click();
      
      var spyCall = trackerFnSpy.getCall(0);
      var trackData = spyCall.args[0];
      
      expect(trackData).to.have.property('targetType');
      expect(trackData).to.have.property('targetElement');
      expect(trackData).to.have.property('eventType');
      expect(trackData).to.have.property('rootElement');
      expect(trackData).to.have.property('rootFeature');
      expect(trackData).to.have.property('rootType');
    });
    
    it('should call the tracker callback fn with custom trackData properties: trackingfeature and trackingelement', function() {
      var component = new ComponentTestForTrackComponent();
      component.setAttribute('trackingfeature', 'feature name');
      component.setAttribute('trackingelement', 'some element');
      component.click();
      
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args[0]).to.have.property('rootFeature', 'feature name');
      expect(spyCall.args[0]).to.have.property('rootElement', 'some element');
    });
    
    it('should call tracker callback fn with the expected track data when the component is clicked', function() {
      var component = new ComponentTestForTrackComponent();
      component.click();
      
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args[0]).to.have.property('targetType', 'componenttestfortrackcomponent');
      expect(spyCall.args[0]).to.have.property('targetElement', '');
      expect(spyCall.args[0]).to.have.property('eventType', 'click');
      expect(spyCall.args[0]).to.have.property('rootFeature', '');
      expect(spyCall.args[0]).to.have.property('rootElement', '');
      expect(spyCall.args[0]).to.have.property('rootType', 'coral-component-test-for-track');
    });
    
    it('should call tracker callback fn with different track data for multiple components of the same type', function() {
      var component1 = new ComponentTestForTrackComponent();
      component1.setAttribute('trackingfeature', 'a');
      component1.setAttribute('trackingelement', 'b');
      
      var component2 = new ComponentTestForTrackComponent();
      component2.setAttribute('trackingfeature', 'aa');
      component2.setAttribute('trackingelement', 'bb');
      
      var component3 = new ComponentTestForTrackComponent();
      component3.setAttribute('trackingfeature', 'aaa');
      component3.setAttribute('trackingelement', 'bbb');
      
      component1.click();
      component2.click();
      component3.click();
      
      expect(trackerFnSpy.callCount).to.equal(3, 'Track callback should have been called three times.');
      
      var spyCall;
      spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args[0]).to.have.property('rootFeature', 'a');
      expect(spyCall.args[0]).to.have.property('rootElement', 'b');
      
      spyCall = trackerFnSpy.getCall(1);
      expect(spyCall.args[0]).to.have.property('rootFeature', 'aa');
      expect(spyCall.args[0]).to.have.property('rootElement', 'bb');
      
      spyCall = trackerFnSpy.getCall(2);
      expect(spyCall.args[0]).to.have.property('rootFeature', 'aaa');
      expect(spyCall.args[0]).to.have.property('rootElement', 'bbb');
      
    });
  });
  
  describe('Component with child', function() {
    
    var trackerFnSpy;
    
    beforeEach(function() {
      trackerFnSpy = sinon.spy();
      tracking.addListener(trackerFnSpy);
    });
    
    afterEach(function() {
      tracking.removeListener(trackerFnSpy);
      trackerFnSpy = null;
    });
    
    it('should call tracker callback fn with expected trackData when the root component is clicked', function() {
      var rootComponent = helpers.build(window.__html__['tracking.componentChild.html']);
      
      rootComponent.click();
      
      expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called once.');
      var spyCall = trackerFnSpy.getCall(0);
      var trackData = spyCall.args[0];
      
      expect(trackData).to.have.property('targetType', 'componenttestfortrackcomponent');
      expect(trackData).to.have.property('targetElement', 'rail toggle');
      expect(trackData).to.have.property('eventType', 'click');
      expect(trackData).to.have.property('rootElement', 'rail toggle');
      expect(trackData).to.have.property('rootFeature', 'sites');
      expect(trackData).to.have.property('rootType', 'coral-component-test-for-track');
    });
    
    it('should call tracker callback fn with expected trackData when first child component item is clicked', function() {
      var rootComponent = helpers.build(window.__html__['tracking.componentChild.html']);
      var childComponent = rootComponent.firstElementChild;
      
      childComponent.click();
      
      expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called once.');
      var spyCall = trackerFnSpy.getCall(0);
      var trackData = spyCall.args[0];
      
      expect(trackData).to.have.property('targetType', 'coral-component-test-for-track-item');
      expect(trackData).to.have.property('targetElement', 'first item');
      expect(trackData).to.have.property('eventType', 'click');
      expect(trackData).to.have.property('rootElement', 'rail toggle');
      expect(trackData).to.have.property('rootFeature', 'sites');
      expect(trackData).to.have.property('rootType', 'coral-component-test-for-track');
    });
    
    it('should fallback targetElement to root value in targetData when the child component item being clicked doesn\'t have a targetElement value set', function() {
      var rootComponent = helpers.build(window.__html__['tracking.componentChild.html']);
      var childComponent = rootComponent.lastElementChild;
      
      childComponent.click();
      
      expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called once.');
      var spyCall = trackerFnSpy.getCall(0);
      var trackData = spyCall.args[0];
      
      expect(trackData).to.have.property('targetType', 'coral-component-test-for-track-item');
      expect(trackData).to.have.property('targetElement', 'rail toggle');
      expect(trackData).to.have.property('eventType', 'click');
      expect(trackData).to.have.property('rootElement', 'rail toggle');
      expect(trackData).to.have.property('rootFeature', 'sites');
      expect(trackData).to.have.property('rootType', 'coral-component-test-for-track');
    });
  });
});
