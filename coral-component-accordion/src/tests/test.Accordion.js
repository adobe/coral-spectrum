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
import {Accordion} from '../../../coral-component-accordion';

describe('Accordion', function() {
  // Assert whether an item is properly active or inactive.
  var assertActiveness = function(item, isSelected) {
    var button = item._elements.button;

    if (isSelected) {
      expect(item.classList.contains('is-open')).to.be.true;
      expect(button.getAttribute('aria-expanded')).to.equal('true');
    }
    else {
      expect(item.classList.contains('is-open')).to.be.false;
      expect(button.getAttribute('aria-expanded')).to.equal('false');
    }
  };

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Accordion).to.have.property('Item');
      expect(Accordion.Item).to.have.property('Label');
      expect(Accordion.Item).to.have.property('Content');
    });

    it('should define the variants in an enum', function() {
      expect(Accordion.variant).to.exist;
      expect(Accordion.variant.DEFAULT).to.equal('default');
      expect(Accordion.variant.QUIET).to.equal('quiet');
      expect(Accordion.variant.LARGE).to.equal('large');
      expect(Object.keys(Accordion.variant).length).to.equal(3);
    });
  });
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['Accordion.base.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone a nested accordion using markup',
      window.__html__['Accordion.nested.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone a nested in content accordion using markup',
      window.__html__['Accordion.nested.content.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Accordion()
    );
  
    helpers.cloneComponent(
      'should be possible to clone an an instance with interactive components and elements in the item label',
      window.__html__['Accordion.label.interaction.html']
    );
  });

  describe('API', function() {
    
    let el = null;
    let item = null;
    
    beforeEach(function() {
      el = new Accordion();
      item = new Accordion.Item();
    });
    
    afterEach(function() {
      el = item = null
    });
    
    describe('#selectedItems', function() {
      it('should default to empty array', function() {
        expect(el.selectedItems).to.deep.equal([]);
      });
    });
  
    describe('#selectedItem', function() {
      it('should default to null', function() {
        expect(el.selectedItem).to.be.null;
      });
    });
  
    describe('#multiple', function() {
      it('should default to false', function() {
        expect(el.multiple).to.be.false;
      });
    });
  
    describe('#variant', function() {
      it('should default to DEFAULT', function() {
        expect(el.variant).to.equal(Accordion.variant.DEFAULT);
      });
    });
  
    describe('#selected', function() {
      it('should default to false', function() {
        expect(item.selected).to.be.false;
      });
    });
  
    describe('#disabled', function() {
      it('should default to false', function() {
        expect(item.disabled).to.be.false;
      });
    });
    
    describe('#content', function() {
      it('should not be null', function() {
        expect(item.content).not.to.be.null;
      });
    });
  
    describe('#label', function() {
      it('should not be null', function() {
        expect(item.label).not.to.be.null;
      });
    });

    describe('#level', function() {
      it('should set heading level for Accordion item headings', function(done) {
        const el = helpers.build(window.__html__['Accordion.base.html']);
        el.level = 4;
        helpers.next(function() {
          helpers.next(function() {
            expect(el.querySelectorAll('h3[aria-level="4"]').length).equal(3);
            done();
          });
        });
      });
    });
  });
  
  describe('Markup', function() {
  
    describe('#multiple', function() {
      it('should allow to select all items if [multiple=true]', function() {
        const el = helpers.build(window.__html__['Accordion.base.html']);
        const items = el.items.getAll();
      
        el.multiple = true;
        items.forEach((item) => {
          item.setAttribute('selected', '');
        });
        expect(items).to.deep.equal(el.selectedItems);
      });
  
      it('should only allow to select 1 item if [multiple=false]', function() {
        const el = helpers.build(window.__html__['Accordion.base.html']);
        expect(el.multiple).to.be.false;
        
        el.items.getAll().forEach((item) => {
          item.setAttribute('selected', '');
        });
        expect(el.selectedItems).to.deep.equal([el.items.last()]);
      });
    });
    
    describe('#selectedItems', function() {
      it('should return all selected items', function() {
        const el = helpers.build(window.__html__['Accordion.selected.first.html']);
        expect(el.selectedItems).to.deep.equal([el.items.first()]);
      });
    });
  
    describe('#selectedItem', function() {
      it('should return the first selected item', function() {
        const el = helpers.build(window.__html__['Accordion.selected.first.html']);
        expect(el.selectedItem).to.equal(el.items.first());
      });
  
      it('should return null if no item is selected', function() {
        const el = helpers.build(window.__html__['Accordion.selected.first.html']);
        el.items.first().selected = false;
        expect(el.selectedItem).to.equal(null);
      });
    });
  
    describe('#variant', function() {
      it('should set the variant', function() {
        const el = helpers.build(window.__html__['Accordion.base.html']);
        el.variant = Accordion.variant.LARGE;
        expect(el.variant).to.equal('large');
        el.variant = Accordion.variant.QUIET;
        expect(el.variant).to.equal('quiet');
        el.variant = Accordion.variant.DEFAULT;
        expect(el.variant).to.equal('default');
      });
    });
    
    describe('#selected', function() {
      it('should expand collapsible in accordion', function() {
        const el = helpers.build(window.__html__['Accordion.base.html']);
        var secondItem = el.items.getAll()[1];
        secondItem.selected = true;
        
        assertActiveness(secondItem, true);
      });
  
      it('should update the active panel on selection changing', function() {
        const el = helpers.build(window.__html__['Accordion.selected.first.html']);
        expect(el.items.getAll()[0]).equal(el.selectedItem);
        
        var secondItem = el.items.getAll()[1];
        secondItem.selected = true;
        
        assertActiveness(secondItem, true);
        expect(secondItem).equal(el.selectedItem);
      });
    });

    describe('#coral-interactive', function() {
      it('should expand collapsible in accordion', function() {
        const el = helpers.build(window.__html__['Accordion.label.interaction.html']);
        var secondItem = el.items.getAll()[1];
        secondItem.selected = true;
        
        assertActiveness(secondItem, true);
      });

      it('should expand collapsible in accordion while clicking the item label', function() {
        const el = helpers.build(window.__html__['Accordion.label.interaction.html']);
        var firstItem = el.items.getAll()[0];
        var secondItem = el.items.getAll()[1];
        secondItem._elements.label.click();
        
        assertActiveness(secondItem, true);

        firstItem._elements.label.click();
        
        assertActiveness(firstItem, true);
      });

      it('should not expand collapsible in accordion while clicking on a checkbox in the item label', function() {
        const el = helpers.build(window.__html__['Accordion.label.interaction.html']);
        
        var firstItem = el.items.getAll()[0];
        var forthItem = el.items.getAll()[3];
        forthItem._elements.label.click();
  
        assertActiveness(forthItem, true);
  
        var checkbox = firstItem.querySelector('input[type="checkbox"]');
        expect(checkbox).to.exist;
  
        checkbox.click();
  
        assertActiveness(forthItem, true);
        expect(checkbox.checked).to.be.true;
      });

      it('should not expand collapsible in accordion while clicking on a button in the item label', function() {
        const el = helpers.build(window.__html__['Accordion.label.interaction.html']);
        var secondItem = el.items.getAll()[1];
        var forthItem = el.items.getAll()[3];
  
        var button = secondItem.querySelector('[coral-interactive]');
        button.click();
        assertActiveness(forthItem, false);
  
        forthItem._elements.button.click();
        assertActiveness(forthItem, true);
      });

      it('should not expand collapsible in accordion while clicking on a anchor in the item label', function() {
        const el = helpers.build(window.__html__['Accordion.label.interaction.html']);
        var secondItem = el.items.getAll()[1];
        var forthItem = el.items.getAll()[3];
        secondItem._elements.label.click();
  
        assertActiveness(secondItem, true);
  
        var anchor = forthItem.querySelector('a');
        expect(anchor).to.exist;
  
        anchor.click();
  
        assertActiveness(secondItem, true);
      });

      it('should not expand collapsible in accordion while interacting with a textarea in the item label', function() {
        const el = helpers.build(window.__html__['Accordion.label.interaction.html']);
        var secondItem = el.items.getAll()[1];
        var fifthItem = el.items.getAll()[4];
        secondItem._elements.label.click();
  
        assertActiveness(secondItem, true);
  
        var textarea = fifthItem.querySelector('textarea');
        expect(textarea).to.exist;
  
        textarea.click();
        textarea.focus();
        textarea.blur();
  
        assertActiveness(secondItem, true);
      });

      it('should not expand collapsible in accordion while clicking on a radio in the item label', function() {
        const el = helpers.build(window.__html__['Accordion.label.interaction.html']);
        var secondItem = el.items.getAll()[1];
        var eighthItem = el.items.getAll()[7];
        secondItem._elements.label.click();
        
        assertActiveness(secondItem, true);
  
        var firstRadioInput = eighthItem.querySelector('input[type="radio"]');
        firstRadioInput.click();
  
        assertActiveness(secondItem, true);
        expect(firstRadioInput.checked).to.be.true;
      });
    });
  });

  describe('Events', function() {
    
    describe('#coral-accordion:change', function() {
      it('should trigger on selection change', function() {
        const el = helpers.build(window.__html__['Accordion.base.html']);
        let changeSpy = sinon.spy();
        el.on('coral-accordion:change', changeSpy);
        el.items.first().selected = true;
        
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.args[0][0].detail.selection).to.equal(el.selectedItem);
        expect(changeSpy.args[0][0].detail.oldSelection).to.equal(null);
      });
  
      it('should return an array for selection and oldSelection if multiple=true', function() {
        const el = helpers.build(window.__html__['Accordion.selected.first.html']);
        el.multiple = true;
        let changeSpy = sinon.spy();
        el.on('coral-accordion:change', changeSpy);
        el.items.last().selected = true;
    
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.args[0][0].detail.selection).to.deep.equal([el.items.first(), el.items.last()]);
        expect(changeSpy.args[0][0].detail.oldSelection).to.deep.equal([el.items.first()]);
      });
  
      it('should trigger on multiple change', function() {
        const el = helpers.build(window.__html__['Accordion.selected.first.html']);
        el.multiple = true;
        el.items.last().selected = true;
        
        let changeSpy = sinon.spy();
        el.on('coral-accordion:change', changeSpy);
        el.multiple = false;
  
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.args[0][0].detail.selection).to.equal(el.items.last());
        expect(changeSpy.args[0][0].detail.oldSelection).to.deep.equal([el.items.first(), el.items.last()]);
      });
    });
    
    describe('#coral-collection:add', function() {
      it('should trigger coral-collection:add when adding an item', function(done) {
        const el = helpers.build(window.__html__['Accordion.base.html']);
        var addSpy = sinon.spy();
        el.on('coral-collection:add', addSpy);
        var item = el.items.add();
        
        helpers.next(function() {
          expect(addSpy.callCount).to.equal(1);
          expect(el.items.length).to.equal(4);
          expect(el.items.last()).to.equal(item);
          done();
        });
      });
    });
    
    describe('#coral-collection:remove', function() {
      it('should trigger coral-collection:remove when removing an item', function(done) {
        const el = helpers.build(window.__html__['Accordion.base.html']);
        var removeSpy = sinon.spy();
        el.on('coral-collection:remove', removeSpy);
        var item = el.items.last().remove();
    
        helpers.next(function() {
          expect(removeSpy.callCount).to.equal(1);
          expect(el.items.length).to.equal(2);
          expect(el.items.last()).to.not.equal(item);
          done();
        });
      });
    });
  });
  
  describe('User Interaction', function() {
    it('should expand panel in accordion when header is clicked', function() {
      const el = helpers.build(window.__html__['Accordion.base.html']);
      var secondItem = el.items.getAll()[1];
      secondItem._elements.label.click();
  
      assertActiveness(secondItem, true);
    });

    it('should collapse expanded panel in accordion when header is clicked', function() {
      const el = helpers.build(window.__html__['Accordion.selected.first.html']);
      var firstItem = el.items.getAll()[0];
      expect(firstItem).equal(el.selectedItem);
      firstItem._elements.label.click();
  
      expect(null).equal(el.selectedItem);
      assertActiveness(firstItem, false);
    });

    it('should not update the active panel when a disabled panel is clicked', function() {
      const el = helpers.build(window.__html__['Accordion.selected.first.html']);
      var firstItem = el.items.getAll()[0];
      var secondItem = el.items.getAll()[1];
      secondItem.disabled = true;
      secondItem.click();
  
      assertActiveness(firstItem, true);
      assertActiveness(secondItem, false);
      expect(firstItem).equal(el.selectedItem);
    });
  });
  
  describe('Accessibility', function() {
    it('should comply to WAI-ARIA 1.1', function() {
      const el = helpers.build(window.__html__['Accordion.base.html']);
      expect(el.getAttribute('role')).to.equal('region');
      expect(el.querySelectorAll('coral-accordion-item[role=presentation]').length).equal(3);
      expect(el.querySelectorAll('coral-accordion-item-content[role=region]').length).equal(3);
      
      expect(el.querySelector('[aria-expanded]').getAttribute('aria-controls'))
        .equal(el.querySelector('coral-accordion-item-content[role=region]').getAttribute('id'));
      
      expect(el.querySelector('coral-accordion-item-content[role=region]').getAttribute('aria-labelledby'))
        .equal(el.querySelector('[aria-expanded]').getAttribute('id'));
    });
  });
});
