describe('Coral.Accordion', function() {
  'use strict';

  // Assert whether an item is properly active or inactive.
  var assertActiveness = function(item, isSelected) {
    var content = item._elements.acContent;
    var header = item._elements.acHeader;

    // make sure that the CSS3 transition is executed
    item._onCollapsed();

    if (isSelected) {
      expect(item.classList.contains('is-selected')).to.be.true;
      expect(header.getAttribute('aria-selected')).to.equal('true');
      expect(header.getAttribute('aria-expanded')).to.equal('true');
      expect(content.getAttribute('aria-hidden')).to.equal('false');
      expect(parseInt(getComputedStyle(content).height)).to.be.above(0);
      expect(getComputedStyle(content).display).to.equal('block');
    }
    else {
      expect(item.classList.contains('is-selected')).to.be.false;
      expect(header.getAttribute('aria-expanded')).to.equal('false');
      expect(header.getAttribute('aria-selected')).to.equal('false');
      expect(content.getAttribute('aria-hidden')).to.equal('true');
    }
  };

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Accordion');
      expect(Coral.Accordion).to.have.property('Item');
      expect(Coral.Accordion.Item).to.have.property('Label');
      expect(Coral.Accordion.Item).to.have.property('Content');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Accordion.variant).to.exist;
      expect(Coral.Accordion.variant.DEFAULT).to.equal('default');
      expect(Coral.Accordion.variant.QUIET).to.equal('quiet');
      expect(Coral.Accordion.variant.LARGE).to.equal('large');
      expect(Object.keys(Coral.Accordion.variant).length).to.equal(3);
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Accordion.base.html']);
    });
  
    it('should be possible to clone a nested accordion using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Accordion.nested.html']);
    });
  
    it('should be possible to clone a nested in content accordion using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Accordion.nested.content.html']);
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Coral.Accordion());
    });
  
    it('should be possible to clone an an instance with interactive components and elements in the item label', function() {
      helpers.cloneComponent(window.__html__['Coral.Accordion.label.interaction.html']);
    });
  });

  describe('API', function() {
    
    let el = null;
    let item = null;
    
    beforeEach(function() {
      el = new Coral.Accordion();
      item = new Coral.Accordion.Item();
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
      it('should defailt to DEFAULT', function() {
        expect(el.variant).to.equal(Coral.Accordion.variant.DEFAULT);
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
  });
  
  describe('Markup', function() {
  
    describe('#multiple', function() {
      it('should allow to select all items if [multiple=true]', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.base.html']);
        const items = el.items.getAll();
      
        el.multiple = true;
        items.forEach((item) => {
          item.setAttribute('selected', '');
        });
        expect(items).to.deep.equal(el.selectedItems);
      });
  
      it('should only allow to select 1 item if [multiple=false]', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.base.html']);
        expect(el.multiple).to.be.false;
        
        el.items.getAll().forEach((item) => {
          item.setAttribute('selected', '');
        });
        expect(el.selectedItems).to.deep.equal([el.items.last()]);
      });
    });
    
    describe('#selectedItems', function() {
      it('should return all selected items', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.selected.first.html']);
        expect(el.selectedItems).to.deep.equal([el.items.first()]);
      });
    });
  
    describe('#selectedItem', function() {
      it('should return the first selected item', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.selected.first.html']);
        expect(el.selectedItem).to.equal(el.items.first());
      });
  
      it('should return null if no item is selected', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.selected.first.html']);
        el.items.first().selected = false;
        expect(el.selectedItem).to.equal(null);
      });
    });
  
    describe('#variant', function() {
      it('should add the variant class ', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.base.html']);
        el.variant = Coral.Accordion.variant.LARGE;
        expect(el.classList.contains('coral3-Accordion--large')).to.be.true;
        el.variant = Coral.Accordion.variant.QUIET;
        expect(el.classList.contains('coral3-Accordion--quiet')).to.be.true;
        el.variant = Coral.Accordion.variant.DEFAULT;
        expect(el.classList.contains('coral3-Accordion--default')).to.be.false;
        expect(el.classList.contains('coral3-Accordion--quiet')).to.be.false;
      });
    });
    
    describe('#selected', function() {
      it('should expand collapsible in accordion', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.base.html']);
        var secondItem = el.items.getAll()[1];
        secondItem.selected = true;
        
        assertActiveness(secondItem, true);
      });
  
      it('should update the active panel on selection changing', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.selected.first.html']);
        expect(el.items.getAll()[0]).equal(el.selectedItem);
        
        var secondItem = el.items.getAll()[1];
        secondItem.selected = true;
        
        assertActiveness(secondItem, true);
        expect(secondItem).equal(el.selectedItem);
      });
    });

    describe('#coral-interactive', function() {
      it('should expand collapsible in accordion', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.label.interaction.html']);
        var secondItem = el.items.getAll()[1];
        secondItem.selected = true;
        
        assertActiveness(secondItem, true);
      });

      it('should expand collapsible in accordion while clicking the item label', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.label.interaction.html']);
        var firstItem = el.items.getAll()[0];
        var secondItem = el.items.getAll()[1];
        secondItem._elements.label.click();
        
        assertActiveness(secondItem, true);

        firstItem._elements.label.click();
        
        assertActiveness(firstItem, true);
      });

      it('should not expand collapsible in accordion while clicking on a checkbox in the item label', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.label.interaction.html']);
        
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

      it('should expand collapsible in accordion while clicking on the chevron while a child tag has the coral-interactive attribute in the item label', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.label.interaction.html']);
        var firstItem = el.items.getAll()[0];
        var chevron = firstItem.querySelector('[handle="icon"]');
  
        expect(chevron).to.exist;
  
        chevron.click();
        assertActiveness(firstItem, false);
  
        chevron.click();
        assertActiveness(firstItem, true);
      });

      it('should not expand collapsible in accordion while clicking on a button in the item label', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.label.interaction.html']);
        var secondItem = el.items.getAll()[1];
        var forthItem = el.items.getAll()[3];
        forthItem._elements.label.click();
  
        assertActiveness(forthItem, true);
  
        var button = secondItem.querySelector('button');
        expect(button).to.exist;
  
        button.click();
        assertActiveness(forthItem, true);
      });

      it('should not expand collapsible in accordion while clicking on a anchor in the item label', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.label.interaction.html']);
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
        const el = helpers.build(window.__html__['Coral.Accordion.label.interaction.html']);
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
        const el = helpers.build(window.__html__['Coral.Accordion.label.interaction.html']);
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
        const el = helpers.build(window.__html__['Coral.Accordion.base.html']);
        let changeSpy = sinon.spy();
        el.on('coral-accordion:change', changeSpy);
        el.items.first().selected = true;
        
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.args[0][0].detail.selection).to.equal(el.selectedItem);
        expect(changeSpy.args[0][0].detail.oldSelection).to.equal(null);
      });
  
      it('should return an array for selection and oldSelection if multiple=true', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.selected.first.html']);
        el.multiple = true;
        let changeSpy = sinon.spy();
        el.on('coral-accordion:change', changeSpy);
        el.items.last().selected = true;
    
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.args[0][0].detail.selection).to.deep.equal([el.items.first(), el.items.last()]);
        expect(changeSpy.args[0][0].detail.oldSelection).to.deep.equal([el.items.first()]);
      });
  
      it('should trigger on multiple change', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.selected.first.html']);
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
        const el = helpers.build(window.__html__['Coral.Accordion.base.html']);
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
    
    describe('coral-collection:remove', function() {
      it('should trigger coral-collection:remove when removing an item', function(done) {
        const el = helpers.build(window.__html__['Coral.Accordion.base.html']);
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
      const el = helpers.build(window.__html__['Coral.Accordion.base.html']);
      var secondItem = el.items.getAll()[1];
      secondItem._elements.label.click();
  
      assertActiveness(secondItem, true);
    });

    it('should collapse expanded panel in accordion when header is clicked', function() {
      const el = helpers.build(window.__html__['Coral.Accordion.selected.first.html']);
      var firstItem = el.items.getAll()[0];
      expect(firstItem).equal(el.selectedItem);
      firstItem._elements.label.click();
  
      expect(null).equal(el.selectedItem);
      assertActiveness(firstItem, false);
    });

    it('should not update the active panel when a disabled panel is clicked', function() {
      const el = helpers.build(window.__html__['Coral.Accordion.selected.first.html']);
      var firstItem = el.items.getAll()[0];
      var secondItem = el.items.getAll()[1];
      secondItem.disabled = true;
      secondItem.click();
  
      assertActiveness(firstItem, true);
      assertActiveness(secondItem, false);
      expect(firstItem).equal(el.selectedItem);
    });
  });

  describe('Implementation Details', function() {
    
    describe('accessibility', function() {
      it('should have role=tablist', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.base.html']);
        expect(el.getAttribute('role')).to.equal('tablist');
        expect(el.querySelectorAll('[role=presentation]').length).equal(3);
        expect(el.querySelectorAll('div[role=tabpanel]').length).equal(3);

        expect(el.querySelector('[role=tab]').getAttribute('aria-controls'))
          .equal(el.querySelector('div[role=tabpanel]').getAttribute('id'));

        expect(el.querySelector('div[role=tabpanel]').getAttribute('aria-labelledby'))
          .equal(el.querySelector('[role=tab]').getAttribute('id'));
      });
    });

    describe('animation', function () {
      it('should adapt styling after collapsing out', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.base.html']);
        var secondItem = el.items.getAll()[1];
        secondItem._selected = true;
        secondItem._onCollapsed();
        expect(secondItem._elements.acContent.classList.contains('is-collapsing')).to.be.false;
        expect(secondItem._elements.acContent.classList.contains('is-closed')).to.be.false;
        expect(secondItem._elements.acContent.classList.contains('is-open')).to.be.true;
        expect(secondItem._elements.acContent.style.height).to.be.equal('');
      });

      it('should adapt styling after collapsing in', function() {
        const el = helpers.build(window.__html__['Coral.Accordion.base.html']);
        var secondItem = el.items.getAll()[1];
        secondItem._selected = false;
        secondItem._onCollapsed();
        expect(secondItem._elements.acContent.classList.contains('is-collapsing')).to.be.false;
        expect(secondItem._elements.acContent.classList.contains('is-closed')).to.be.true;
        expect(secondItem._elements.acContent.classList.contains('is-open')).to.be.false;
        expect(secondItem._elements.acContent.style.height).to.be.equal('0px');
      });
    });
  });
});
