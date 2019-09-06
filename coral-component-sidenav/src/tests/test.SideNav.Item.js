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

describe('SideNav.Item', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(SideNav).to.have.property('Item');
    });
  });
  
  describe('Instantiation', function() {
    function testDefaultInstance(el) {
      expect(el.classList.contains('_coral-SideNav-item')).to.be.true;
    }
  
    it('should be possible using new', function() {
      const el = helpers.build(new SideNav.Item());
      testDefaultInstance(el);
    });
  
    it('should be possible using createElement', function() {
      const el = helpers.build(document.createElement('coral-sidenav', {is: 'coral-sidenav-item'}));
      testDefaultInstance(el);
    });
  
    it('should be possible using markup', function() {
      const el = helpers.build(window.__html__['SideNav.item.base.html']);
      testDefaultInstance(el);
    });
  });
  
  describe('API', function() {
    let el;
    
    beforeEach(function() {
      el = helpers.build(new SideNav.Item());
    });
    
    afterEach(function() {
      el = null;
    });
    
    describe('#content', function() {
      it('should default to empty string', function() {
        expect(el.content.innerHTML).to.equal('');
      });
      
      it('should support setting content', function() {
        el.content.textContent = 'Item';
        expect(el.textContent.trim()).to.equal('Item');
      });
    });
    
    describe('#selected', function() {
      it('should not be selected by default', function() {
        const el = new SideNav.Item();
        expect(el.selected).to.be.false;
        expect(el.classList.contains('is-selected')).to.be.false;
        expect(el.hasAttribute('selected')).to.be.false;
      });
    });
    
    describe('#icon', function() {
      it('should be empty string by default', function() {
        const el = new SideNav.Item();
        expect(el.icon).to.equal('');
      });
  
      it('should be hidden by default', function() {
        const el = new SideNav.Item();
        expect(el._elements.icon.hidden).to.be.true;
      });
      
      it('should set the icon', function() {
        const el = new SideNav.Item();
        el.icon = 'Add';
        expect(el._elements.icon.icon).to.equal('Add');
        expect(el._elements.icon.hidden).to.be.false;
      });
    });
  });
  
  describe('Markup', function() {
    describe('#content', function() {
      it('should move content into the content zone', function() {
        const el = helpers.build(window.__html__['SideNav.item.base.html']);
        expect(el.content.innerHTML).to.equal('<strong>Item</strong>');
      });
  
      it('should not touch existing content zone', function() {
        const el = helpers.build(window.__html__['SideNav.item.content.html']);
        expect(el.content.textContent.trim()).to.equal('Item');
      });
    });
    
    describe('#selected', function() {
      it('should not be selected by default', function() {
        const el = helpers.build(window.__html__['SideNav.item.base.html']);
        expect(el.selected).to.be.false;
        expect(el.classList.contains('is-selected')).to.be.false;
        expect(el.hasAttribute('selected')).to.be.false;
      });
    });
    
    describe('#icon', function() {
      it('should set the icon', function() {
        const el = helpers.build(window.__html__['SideNav.item.icon.html']);
        expect(el.icon).to.equal('Add');
        expect(el._elements.icon.icon).to.equal('Add');
        expect(el._elements.icon.hidden).to.be.false;
      });
    });
  });
  
  describe('Events', function() {
    describe('#coral-sidenav-item:_selectedchanged', function() {
      it('should be triggered when the selection changes', function() {
        const el = helpers.build(new SideNav.Item());
        const changeSpy = sinon.spy();
        el.on('coral-sidenav-item:_selectedchanged', changeSpy);

        el.selected = true;
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.getCall(0).args[0].target.selected).to.be.true;

        el.selected = false;
        expect(changeSpy.callCount).to.equal(2);
        expect(changeSpy.getCall(0).args[0].target.selected).to.be.false;
      });
    });
  });
});
