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
import {Alert} from '../../../coral-component-alert';

describe('Alert', function() {
  describe('Namespace', function() {
    it('should define the variants in an enum', function() {
      expect(Alert.variant).to.exist;
      expect(Alert.variant.ERROR).to.equal('error');
      expect(Alert.variant.WARNING).to.equal('warning');
      expect(Alert.variant.SUCCESS).to.equal('success');
      expect(Alert.variant.HELP).to.equal('help');
      expect(Alert.variant.INFO).to.equal('info');
      expect(Object.keys(Alert.variant).length).to.equal(5);
    });

    it('should define the sizes in an enum', function() {
      expect(Alert.size).to.exist;
      expect(Alert.size.SMALL).to.equal('S');
      expect(Alert.size.LARGE).to.equal('L');
      expect(Object.keys(Alert.size).length).to.equal(2);
    });
  });

  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['Alert.base.html']
    );
    
    helpers.cloneComponent(
      'should be possible to clone a large alert using markup',
      window.__html__['Alert.large.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Alert()
    );
  
    helpers.cloneComponent(
      'should be possible to clone a large alert using js',
      new Alert().set({size: 'L'})
    );
  });

  describe('API', function() {
    
    var el;
    beforeEach(function() {
      el = new Alert();
    });
  
    afterEach(function() {
      el = null;
    });
    
    describe('#content', function() {
      it('should set provided content', function() {
        var content = 'I am content!';
        el.content.innerHTML = content;
        expect(el._elements.content.innerHTML).to.equal(content, 'content after set');
      });
    });
  
    describe('#header', function() {
      it('should set provided header', function() {
        var header = 'I am header!';
        el.header.innerHTML = header;
        expect(el._elements.header.innerHTML).to.equal(header, 'content after set');
      });
    });
  
    describe('#size', function() {
      it('should default to small', function() {
        expect(el.size).to.equal(Alert.size.SMALL);
      });
    });
  
    describe('#variant', function() {
      it('should default to info', function() {
        expect(el.variant).to.equal(Alert.variant.INFO);
      });
    
      it('should set correct className when variant is error', function() {
        el.variant = Alert.variant.ERROR;
        expect(el.classList.contains('_coral-Alert--error')).to.be.true;
      });
    
      it('should set correct className when variant is warning', function() {
        el.variant = Alert.variant.WARNING;
        expect(el.classList.contains('_coral-Alert--warning')).to.be.true;
      });
    
      it('should set correct className when variant is success', function() {
        el.variant = Alert.variant.SUCCESS;
        expect(el.classList.contains('_coral-Alert--success')).to.be.true;
      });
    
      it('should set correct className when variant is help', function() {
        el.variant = Alert.variant.HELP;
        expect(el.classList.contains('_coral-Alert--help')).to.be.true;
      });
    
      it('should set correct className when variant is info', function() {
        el.variant = Alert.variant.INFO;
        expect(el.classList.contains('_coral-Alert--info')).to.be.true;
      });
    });
  });
  
  describe('#Markup', function() {
    var alert;
    beforeEach(function() {
      alert = helpers.build(new Alert());
    });
  
    afterEach(function() {
      alert = null;
    });
    
    function testContentZoneIndicies(alert) {
      var headerIndex = -1;
      var contentIndex = -2;
      var footerIndex = -3;
      var child;
      for (var i = 0; i < alert.children.length; i++) {
        child = alert.children[i];
        if (child.tagName === 'CORAL-ALERT-HEADER') {
          headerIndex = i;
        }
        else if (child.tagName === 'CORAL-ALERT-CONTENT') {
          contentIndex = i;
        }
        else if (child.tagName === 'CORAL-ALERT-FOOTER') {
          footerIndex = i;
        }
      }
    
      expect(headerIndex).to.be.below(contentIndex, 'Header should come before the content');
      expect(contentIndex).to.be.below(footerIndex, 'Content should come before the footer');
    }
    
    describe('#header', function() {
      it('should have the correct order when header set', function() {
        var header = alert.header = document.createElement('coral-alert-header');
        expect(alert.header).to.equal(header);
        expect(alert.querySelector('coral-alert-header')).to.equal(header);
        testContentZoneIndicies(alert);
      });
    });
    
    describe('#content', function() {
      it('should have the correct order on render', function() {
        testContentZoneIndicies(alert);
      });
  
      it('should have the correct order when content set', function() {
        var content = alert.content = document.createElement('coral-alert-content');
        expect(alert.content).to.equal(content);
        expect(alert.querySelector('coral-alert-content')).to.equal(content);
        testContentZoneIndicies(alert);
      });
    });
    
    describe('#footer', function() {
      it('should have the correct order when footer set', function() {
        var footer = alert.footer = document.createElement('coral-alert-footer');
        expect(alert.footer).to.equal(footer);
        expect(alert.querySelector('coral-alert-footer')).to.equal(footer);
        testContentZoneIndicies(alert);
      });
    });
  });

  describe('User Interaction', function() {
    
    describe('#coral-close', function() {
      it('should hide when any element with [coral-close] clicked', function() {
        const el = helpers.build(new Alert());
        expect(el.hidden).to.equal(false, 'hidden before close clicked');
      
        el.content.innerHTML = '<button coral-close id="closeButton">Close me!</button>';
      
        el.querySelector('#closeButton').click();
      
        expect(el.hidden).to.equal(true, 'hidden after close clicked');
      });
    
      it('should only hide if selector matches value of [coral-close], should not let events bubble', function() {
        const el = helpers.build(new Alert());
        var spy = sinon.spy();
        helpers.target.addEventListener('click', spy);
      
        el.id = 'myAlert';
        expect(el.hidden).to.equal(false, 'hidden before close clicked');
      
        el.content.innerHTML = '<button coral-close="#myAlert" id="closeMyAlert">Close me!</button><button coral-close="#otherAlert" id="closeOtherAlert">Close someone else!</button>';
      
        el.querySelector('#closeOtherAlert').click();
      
        expect(el.hidden).to.equal(false, 'hidden after close clicked');
        expect(spy.callCount).to.equal(1);
      
        spy.resetHistory();
        el.querySelector('#closeMyAlert').click();
      
        expect(el.hidden).to.equal(true, 'hidden after close clicked');
        expect(spy.callCount).to.equal(0);
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
    
    it('should call the tracker callback fn with at least four parameters: trackData, event, component, childComponent when the alert is closed', function() {
      const el = helpers.build(window.__html__['Alert.tracking.html']);
      el.querySelector('[coral-close]').click();
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args.length).to.equal(4);
      
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', 'element name');
      expect(trackData).to.have.property('targetType', 'coral-alert');
      expect(trackData).to.have.property('eventType', 'close');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-alert');
      expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Alert);
    });
  });
});
