import {helpers} from '../../../coralui-util/src/tests/helpers';
import {CycleButton} from '../../../coralui-component-cyclebutton';

describe('CycleButton', function() {
  var SNIPPET_MIXEDITEMS = window.__html__['CycleButton.mixedItems.html'];
  var SNIPPET_TWOITEMS = window.__html__['CycleButton.twoItems.html'];
  var SNIPPET_THREEITEMS = window.__html__['CycleButton.threeItems.html'];
  var SNIPPET_PRESETSELECT = window.__html__['CycleButton.presetSelect.html'];
  var SNIPPET_WITHACTIONS = window.__html__['CycleButton.withActions.html'];
  var SNIPPET_GENERALICON = window.__html__['CycleButton.generalIcon.html'];

  var WHITESPACE_REGEX = /[\t\n\r ]+/g;

  function stripWhitespace(string) {
    return string.replace(WHITESPACE_REGEX, ' ');
  }

  describe('Namespace', function() {
    it('should define the displayMode in an enum', function() {
      expect(CycleButton.displayMode).to.exist;
      expect(CycleButton.displayMode.ICON).to.equal('icon');
      expect(CycleButton.displayMode.TEXT).to.equal('text');
      expect(CycleButton.displayMode.ICON_TEXT).to.equal('icontext');
      expect(Object.keys(CycleButton.displayMode).length).to.equal(3);
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function() {
      helpers.cloneComponent(SNIPPET_TWOITEMS);
    });

    it('should be possible via cloneNode using js', function() {
      var el = new CycleButton();
      el.appendChild(new CycleButton.Item());
      el.appendChild(new CycleButton.Item());
      helpers.cloneComponent(el);
    });
  });

  describe('API', function() {
    
    describe('#icon', function() {
      it('should have the general icon', function() {
        const el = helpers.build(SNIPPET_GENERALICON);
        
        expect(el.icon).to.equal('apps');
        expect(el._elements.button.icon).to.equal('apps');
      });
    });

    describe('#threshold', function() {
      it('should have default threshold', function() {
        var el = helpers.build(new CycleButton());
        
        expect(el.threshold).to.equal(3);
      });
    });

    describe('#displayMode', function() {
      it('should have default displayMode set to icon', function() {
        var el = helpers.build(new CycleButton());
        
        expect(el.displayMode).to.equal('icon');
      });

      it('should display only icon when in icon mode and icon and text is in item object', function() {
        const el = helpers.build(SNIPPET_MIXEDITEMS);
        el.displayMode = CycleButton.displayMode.ICON;
        
        var button = el._elements.button;
        expect(button.icon.trim()).to.equal('viewCard');
        expect(button.textContent.trim()).to.equal('');
      });

      it('should display icon and text when in icontext mode and icon and text is in item object', function() {
        const el = helpers.build(SNIPPET_MIXEDITEMS);
        el.displayMode = CycleButton.displayMode.ICON_TEXT;
        
        var button = el._elements.button;
        expect(button.icon.trim()).to.equal('viewCard');
        expect(button.textContent.trim()).to.equal('Card');
      });

      it('should display only icon when component in icontext mode and item in icon mode', function() {
        const el = helpers.build(SNIPPET_MIXEDITEMS);
        el.displayMode = CycleButton.displayMode.ICON_TEXT;
        el.items.getAll()[0].displayMode = CycleButton.displayMode.ICON;
        
        var button = el._elements.button;
        expect(button.icon.trim()).to.equal('viewCard');
        expect(button.textContent.trim()).to.equal('');
      });

      it('should display only text when in text mode and icon and text is in item object', function() {
        const el = helpers.build(SNIPPET_MIXEDITEMS);
        el.displayMode = CycleButton.displayMode.TEXT;
        
        var button = el._elements.button;
        expect(button.icon.trim()).to.equal('');
        expect(button.textContent.trim()).to.equal('Card');
      });

      it('should display text when in icon mode and only text is in item object', function() {
        const el = helpers.build(SNIPPET_MIXEDITEMS);
        el.displayMode = CycleButton.displayMode.ICON;
        el.items.getAll()[1].selected = true;
        
        var button = el._elements.button;
        expect(button.icon.trim()).to.equal('');
        expect(button.label.innerHTML.trim()).to.equal('List <b>View</b>');
      });

      it('should display icon when in text mode and only icon is in item object', function() {
        const el = helpers.build(SNIPPET_MIXEDITEMS);
        el.displayMode = CycleButton.displayMode.TEXT;
        el.items.getAll()[2].selected = true;
        
        var button = el._elements.button;
        expect(button.icon.trim()).to.equal('viewColumn');
        expect(button.textContent.trim()).to.equal('');
      });
    });

    describe('#selectedItem', function() {
      it('should return null when there are 0 buttons', function() {
        var el = new CycleButton();
        expect(el.selectedItem).to.be.null;
        
        helpers.build(el);
        expect(el.selectedItem).to.be.null;
      });

      it('should return the selected item', function() {
        const el = helpers.build(SNIPPET_TWOITEMS);
        expect(el.selectedItem).to.exist;
        expect(el.selectedItem.id).to.equal('btn1');
      });

      it('should be readonly', function() {
        const el = helpers.build(SNIPPET_TWOITEMS);
        try {
          el.selectedItem = el.items.getAll()[1];
        }
        catch (e) {
          expect(el.selectedItem.id).to.equal('btn1');
        }
      });

      it('should return the first element after a child got added', function(done) {
        var el = helpers.build(new CycleButton());
        var item = new CycleButton.Item();
        el.appendChild(item);
        
        // Wait for MO
        helpers.next(function() {
          expect(el.selectedItem).to.equal(item);
          done();
        });
      });

      it('should stay on the current item when the only item present got clicked', function(done) {
        var el = helpers.build(new CycleButton());
        var item = new CycleButton.Item();
        el.appendChild(item);
        
        // Wait for MO
        helpers.next(function() {
          item.click();
          
          expect(el.selectedItem).to.equal(item);
          done();
        });
      });

      it('should return the id of the 2nd child, after the 1st child got removed, using removeChild', function(done) {
        const el = helpers.build(SNIPPET_THREEITEMS);
        el.removeChild(el.items.getAll()[0]);
      
        // Wait for MO
        helpers.next(function() {
          expect(el.selectedItem.id).to.equal(el.items.getAll()[0].id);
          done();
        });
      });

      it('should return the id of the 2nd child, after the 1st child got removed', function(done) {
        const el = helpers.build(SNIPPET_THREEITEMS);
        el.removeChild(el.querySelector('#btn1'));
  
        // Wait for MO
        helpers.next(function() {
          expect(el.selectedItem.id).to.equal('btn2');
          done();
        });
      });

      it('should select the next available item on removing the current selection', function(done) {
        const el = helpers.build(SNIPPET_THREEITEMS);
        el.removeChild(el.querySelector('#btn1'));
        
        // Wait for MO
        helpers.next(function() {
          expect(el.selectedItem.id).to.equal('btn2');
          done();
        });
      });

      it('removing all items should set selectedItem to null', function() {
        const el = helpers.build(SNIPPET_THREEITEMS);
        
        // effectively removes all children
        el.innerHTML = '';
        
        expect(el.selectedItem).to.be.null;
      });

      it('preset selection should be honoured', function() {
        const el = helpers.build(SNIPPET_PRESETSELECT);
        expect(el.selectedItem.id).to.equal('btn2');
      });
    });

    describe('#items', function() {
      it('should exist and be readonly', function() {
        const el = helpers.build(SNIPPET_TWOITEMS);
        try {
          el.items = null;
        }
        catch (e) {
          expect(el.items).to.exist;
        }
      });

      describe('#length', function() {
        it('should return the number of items', function() {
          const el = helpers.build(SNIPPET_TWOITEMS);
          expect(el.items.length).to.equal(2);
        });
      });

      describe('#add', function() {
        it('should allow adding a node before the desired one', function(done) {
          const el = helpers.build(SNIPPET_TWOITEMS);
          var item = document.createElement('coral-cyclebutton-item');
          el.items.add(item, el.firstChild);
          
          // Wait for MO
          helpers.next(function() {
            expect(el.firstChild).to.equal(item);
            done();
          });
        });

        it('should allow adding a node at the end', function(done) {
          const el = helpers.build(SNIPPET_TWOITEMS);
          var item = document.createElement('coral-cyclebutton-item');
          el.items.add(item);
          
          // Wait for MO
          helpers.next(function() {
            expect(el.lastChild).to.equal(item);
            done();
          });
        });

        it('should return the added node', function() {
          const el = helpers.build(SNIPPET_TWOITEMS);
          var item = document.createElement('coral-cyclebutton-item');
          var newItem = el.items.add(item);
          expect(newItem).to.equal(item);
        });

        it('should support adding an object', function() {
          const el = helpers.build(SNIPPET_TWOITEMS);
          el.items.add({
            label: 'lorem ipsum'
          });
          
          expect(el.items.length).to.equal(3);
        });

        it('should do nothing if the added node is not a cyclebutton-item element', function() {
          const el = helpers.build(SNIPPET_TWOITEMS);
          var item = document.createElement('button');
          el.items.add(item);
          
          expect(el.items.length).to.equal(2);
        });

        it('should trigger coral-collection:add', function(done) {
          const el = helpers.build(SNIPPET_TWOITEMS);
          var item = document.createElement('coral-cyclebutton-item');
          var eventSpy = sinon.spy();

          el.on('coral-collection:add', eventSpy);
          el.items.add(item);

          // Wait for MO
          helpers.next(function() {
            expect(eventSpy.args[0][0].detail.item).to.equal(item);
            done();
          });
        });
      });

      describe('#remove', function() {
        it('should remove the desired node', function() {
          const el = helpers.build(SNIPPET_TWOITEMS);
          var item = el.firstChild;
          el.items.remove(item);
          
          expect(item.parentNode === null).to.be.true;
          expect(el.contains(item)).to.be.false;
        });

        it('should return the removed node', function() {
          const el = helpers.build(SNIPPET_TWOITEMS);
          var item = el.firstChild;
          var oldItem = el.items.remove(item);
          expect(oldItem).to.equal(item);
        });

        it('should do nothing if the removed is not a dom element', function() {
          const el = helpers.build(SNIPPET_TWOITEMS);
          el.items.remove(el.firstChild);
          expect(el.items.length).to.equal(2);
        });

        it('should trigger coral-collection:remove', function(done) {
          const el = helpers.build(SNIPPET_TWOITEMS);
          var item = el.items.getAll()[0];
          var eventSpy = sinon.spy();

          el.on('coral-collection:remove', eventSpy);
          el.items.remove(item);

          // Wait for MO
          helpers.next(function() {
            expect(eventSpy.args[0][0].detail.item).to.equal(item);
            done();
          });
        });
      });

      describe('#getAll', function() {
        it('should return all nodes', function() {
          const el = helpers.build(SNIPPET_TWOITEMS);
          var items = el.items.getAll();
          expect(items.length).to.equal(2);
          expect(items[0].id).to.equal(el.querySelector('#btn1').id);
          expect(items[1].id).to.equal(el.querySelector('#btn2').id);
          expect(items[0]).to.equal(el.querySelector('#btn1'));
          expect(items[1]).to.equal(el.querySelector('#btn2'));
        });
      });

      describe('#clear', function() {
        it('should remove all nodes', function() {
          const el = helpers.build(SNIPPET_TWOITEMS);
          var items = el.items.getAll();
          var oldItems = el.items.clear();
          
          expect(el.items.getAll().length).to.equal(0);
          expect(oldItems.length).to.equal(2);
          expect(oldItems[1]).to.equal(items[0]);
          expect(oldItems[0]).to.equal(items[1]);
        });

        it('should trigger coral-collection:remove for each removed node', function(done) {
          const el = helpers.build(SNIPPET_TWOITEMS);
          var items = el.items.getAll();
          var eventSpy = sinon.spy();

          el.on('coral-collection:remove', eventSpy);
          el.items.clear();

          // Wait for MO
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(2);
            expect(eventSpy.args[1][0].detail.item).to.equal(items[0]);
            expect(eventSpy.args[0][0].detail.item).to.equal(items[1]);
            done();
          });
        });
      });
    });

    describe('#actions', function() {
      it('should exist and be readonly', function() {
        const el = helpers.build(SNIPPET_WITHACTIONS);
        try {
          el.actions = null;
        }
        catch (e) {
          expect(el.actions).to.exist;
        }
      });

      describe('#length', function() {
        it('should return the number of items', function() {
          const el = helpers.build(SNIPPET_WITHACTIONS);
          expect(el.actions.length).to.equal(2);
        });
      });

      describe('#add', function() {
        it('should allow adding a node before the desired one', function() {
          const el = helpers.build(SNIPPET_WITHACTIONS);
          var action = document.createElement('coral-cyclebutton-action');
          el.actions.add(action, el.firstChild);
          
          expect(el.firstChild).to.equal(action);
        });

        it('should allow adding a node at the end', function() {
          const el = helpers.build(SNIPPET_WITHACTIONS);
          var action = document.createElement('coral-cyclebutton-action');
          el.actions.add(action);
          
          expect(el.lastChild).to.equal(action);
        });

        it('should return the added node', function() {
          const el = helpers.build(SNIPPET_WITHACTIONS);
          var action = document.createElement('coral-cyclebutton-action');
          var newAction = el.actions.add(action);
          expect(newAction).to.equal(action);
        });

        it('should support adding an object', function() {
          const el = helpers.build(SNIPPET_WITHACTIONS);
          el.actions.add({
            label: 'lorem ipsum'
          });
          
          expect(el.actions.length).to.equal(3);
        });

        it('should do nothing if the added node is not a cyclebutton-action element', function() {
          const el = helpers.build(SNIPPET_WITHACTIONS);
          var action = document.createElement('button');
          el.actions.add(action);
          
          expect(el.actions.length).to.equal(2);
        });
      });

      describe('#remove', function() {
        it('should remove the desired node', function() {
          const el = helpers.build(SNIPPET_WITHACTIONS);
          var action = el.firstChild;
          el.actions.remove(action);
          
          expect(action.parentNode === null).to.be.true;
          expect(el.contains(action)).to.be.false;
        });

        it('should return the removed node', function() {
          const el = helpers.build(SNIPPET_WITHACTIONS);
          var action = el.firstChild;
          var oldAction = el.actions.remove(action);
          expect(oldAction).to.equal(action);
        });

        it('should do nothing if the removed is not a dom element', function() {
          const el = helpers.build(SNIPPET_WITHACTIONS);
          el.actions.remove(el.firstChild);
          expect(el.actions.length).to.equal(2);
        });
      });

      describe('#getAll', function() {
        it('should return all nodes', function() {
          const el = helpers.build(SNIPPET_WITHACTIONS);
          var actions = el.actions.getAll();
          expect(actions.length).to.equal(2);
          expect(actions[0].id).to.equal(el.querySelector('#action1').id);
          expect(actions[1].id).to.equal(el.querySelector('#action2').id);
          expect(actions[0]).to.equal(el.querySelector('#action1'));
          expect(actions[1]).to.equal(el.querySelector('#action2'));
        });
      });

      describe('#clear', function() {
        it('should remove all nodes', function() {
          const el = helpers.build(SNIPPET_WITHACTIONS);
          var actions = el.actions.getAll();
          var oldActions = el.actions.clear();
          
          expect(el.actions.getAll().length).to.equal(0);
          expect(oldActions.length).to.equal(2);
          expect(oldActions[1]).to.equal(actions[0]);
          expect(oldActions[0]).to.equal(actions[1]);
        });
      });
    });
  }); // API

  describe('Markup', function() {
    describe('#threshold', function() {
      it('should be in normal mode if itemCount less than threshold', function() {
        const el = helpers.build(SNIPPET_TWOITEMS);
        expect(el.classList.contains('_coral-CycleSelect--extended')).to.be.false;
      });

      it('should enable extended mode if itemCount greater than threshold', function() {
        const el = helpers.build(SNIPPET_THREEITEMS);
        expect(el.classList.contains('_coral-CycleSelect--extended')).to.be.true;
      });

      it('should change extended mode if itemCount gets greater than threshold', function(done) {
        const el = helpers.build(SNIPPET_TWOITEMS);
        expect(el.classList.contains('_coral-CycleSelect--extended')).to.be.false;
        var button = new CycleButton.Item();
        el.appendChild(button);
        
        // Wait for MO
        helpers.next(function() {
          expect(el.classList.contains('_coral-CycleSelect--extended')).to.be.true;
          done();
        });
      });

      it('should change extended mode if itemCount gets less than threshold', function(done) {
        const el = helpers.build(SNIPPET_THREEITEMS);
        expect(el.classList.contains('_coral-CycleSelect--extended')).to.be.true;
        el.removeChild(el.querySelector('#btn3'));
        
        // Wait for MO
        helpers.next(function() {
          expect(el.classList.contains('_coral-CycleSelect--extended')).to.be.false;
          done();
        });
      });
    });
  }); // Markup

  describe('Events', function() {
    var changeSpy;

    beforeEach(function() {
      changeSpy = sinon.spy();
      document.addEventListener('coral-cyclebutton:change', changeSpy);
      expect(changeSpy.callCount).to.equal(0);
    });

    afterEach(function() {
      document.removeEventListener('coral-cyclebutton:change', changeSpy);
      changeSpy.reset();
    });

    it('should not trigger change when appended', function(done) {
      const el = helpers.build(SNIPPET_TWOITEMS);
      expect(changeSpy.callCount).to.equal(0);
      
      // Wait for MO
      helpers.next(function() {
        expect(changeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('should trigger change on click', function() {
      const el = helpers.build(SNIPPET_TWOITEMS);
      // reset changeSpy, for same reason the callCount is '1' here
      changeSpy.reset();
      el.items.getAll()[0].click();
      
      expect(changeSpy.callCount).to.equal(1);
    });

    it('should proxy click event on action when selected by clicking an actionList item', function() {
      const el = helpers.build(SNIPPET_WITHACTIONS);
      var spy = sinon.spy();
  
      // Opens the overlay
      el._elements.button.click();
      
      document.addEventListener('click', spy);
  
      // We click on the first action available
      el._elements.actionList.items.first().click();
      
      expect(spy.callCount).to.equal(1, 'spy called once after clicking actions actionList item');
      expect(spy.args[0][0].target.tagName.toLowerCase()).to.equal('coral-cyclebutton-action');
      document.removeEventListener('click', spy);
    });
  }); // Events

  describe('User Interaction', function() {
    it('should open the overlay when there are more than 3 items and keep the focus on the item', function(done) {
      const el = helpers.build(SNIPPET_THREEITEMS);
      var labelString = stripWhitespace(el.selectedItem.textContent);
      expect(el._elements.button.getAttribute('aria-haspopup')).to.equal('true', 'aria-haspopup attribute is not set to \'true\'');
      expect(el._elements.button.getAttribute('aria-expanded')).to.equal('false', 'aria-expanded attribute was not set to \'false\' when overlay is closed');
      expect(el._elements.button.getAttribute('aria-owns')).to.equal(el._elements.selectList.id, 'aria-owns attribute was not set');
      expect(el._elements.button.getAttribute('aria-controls')).to.equal(el._elements.selectList.id, 'aria-controls attribute was not set');
      if (el.icon) {
        expect(el._elements.button.getAttribute('aria-label')).to.equal(labelString, 'aria-label attribute on button does not match the selected item label');
        expect(el._elements.button.getAttribute('title')).to.equal(labelString, 'title attribute on button does not match the selected item label');
      }
      el.querySelector('#btn1').click();
      
      expect(el.selectedItem.id).to.equal('btn1');
      expect(el._elements.button.getAttribute('aria-expanded')).to.equal('true', 'aria-expanded attribute was not set to \'true\' when overlay is closed');
      
      // Wait for list to be populated
      el.on('coral-overlay:open', () => {
        expect(el._elements.overlay.open).to.be.true;
        expect(el._elements.selectList.items.first()).to.equal(document.activeElement);
        
        done();
      });
    });

    it('overlay should be open following a click of a child of the button element', function(done) {
      const el = helpers.build(SNIPPET_THREEITEMS);
      el._elements.button.querySelector('coral-icon').click();
      
      // Wait for the list to be populated
      helpers.next(function() {
        expect(el._elements.overlay.open).to.be.true;
        done();
      });
    });

    it('should close the overlay when the selected item is clicked again', function(done) {
      const el = helpers.build(SNIPPET_THREEITEMS);
      el.querySelector('#btn1').click();
      
      // Wait for the list to be populated
      el.on('coral-overlay:open', () => {
        el.querySelector('#btn1').click();
  
        expect(el.selectedItem.id).to.equal('btn1');
        expect(el._elements.overlay.open).to.be.false;
        expect(el._elements.button.getAttribute('aria-expanded')).to.equal('false', 'aria-expanded attribute was not set to \'false\'');
        done();
      });
    });

    it('should close the overlay, update the selected item and focus the button when an item is clicked', function(done) {
      const el = helpers.build(SNIPPET_THREEITEMS);
  
      el.querySelector('#btn1').click();
      
      el.on('coral-overlay:open', () => {
        el._elements.selectList.children[1].click();
      });
      
      el.on('coral-overlay:close', () => {
        var labelString = stripWhitespace(el.selectedItem.textContent);
        expect(el.selectedItem.id).to.equal('btn2', 'Second item not selected, when clicked on element in popover');
        expect(el._elements.overlay.open).to.be.false;
        expect(document.activeElement).to.exist;
        expect(document.activeElement.id).to.equal(el._elements.button.id, 'Button didn\'t get focus automatically');
        if (el.icon) {
          expect(el._elements.button.getAttribute('aria-label')).to.equal(labelString, 'aria-label attribute on button does not match the updated selected item label');
          expect(el._elements.button.getAttribute('title')).to.equal(labelString, 'title attribute on button does not match the updated selected item label');
        }
        
        done();
      });
    });

    it('should close the overlay, when there is a global click outside of the overlay', function(done) {
      const el = helpers.build(SNIPPET_THREEITEMS);
      el.querySelector('#btn1').click();
      
      // Wait for list to be populaited
      helpers.next(function() {
        document.body.click();
        
        expect(el._elements.overlay.open).to.be.false;
        expect(el._elements.button.getAttribute('aria-expanded')).to.equal('false', 'aria-expanded attribute was not set to \'false\'');
        done();
      });
    });

    it('should move to the next item when the current item gets clicked and focus it', function() {
      const el = helpers.build(SNIPPET_TWOITEMS);
      
      var labelString = '';
      expect(el.selectedItem.id).to.equal('btn1', 'First item not selected by default');
      el.querySelector('#btn1').click();
  
      labelString = stripWhitespace(el.selectedItem.textContent);
      expect(el.selectedItem.id).to.equal('btn2', 'Second item not selected after first was clicked');
      expect(document.activeElement).to.exist;
      expect(document.activeElement.id).to.equal(el._elements.button.id, 'Button didn\'t get focus automatically');
      if (el.icon) {
        expect(el._elements.button.getAttribute('aria-label')).to.equal(labelString, 'aria-label attribute on button does not match the updated selected item label');
        expect(el._elements.button.getAttribute('title')).to.equal(labelString, 'title attribute on button does not match the updated selected item label');
      }
      el.querySelector('#btn2').click();
  
      labelString = stripWhitespace(el.selectedItem.textContent);
      expect(el.selectedItem.id).to.equal('btn1', 'First item not selected after second was clicked');
      expect(document.activeElement).to.exist;
      expect(document.activeElement.id).to.equal(el._elements.button.id, 'Button didn\'t get focus automatically');
      if (el.icon) {
        expect(el._elements.button.getAttribute('aria-label')).to.equal(labelString, 'aria-label attribute on button does not match the updated selected item label');
        expect(el._elements.button.getAttribute('title')).to.equal(labelString, 'title attribute on button does not match the updated selected item label');
      }
    });

    it('should keep the actions selectList hidden when there are no actions', function() {
      const el = helpers.build(SNIPPET_THREEITEMS);
      expect(el.actions.length).to.equal(0);
      el.querySelector('#btn1').click();
      
      expect(el._elements.actionList.getAttribute('hidden') === 'true').to.be.true;
    });

    it('should show the actions selectList when there are actions', function() {
      const el = helpers.build(SNIPPET_WITHACTIONS);
      el.querySelector('#btn1').click();
      
      expect(el._elements.actionList.hasAttribute('hidden')).to.be.false;
    });

    it('should switch between inline/overlay selection when adding/removing nodes', function(done) {
      const el = helpers.build(SNIPPET_THREEITEMS);
      el.querySelector('#btn1').click();

      // Wait for the list to be populated
      helpers.next(function() {
        expect(el._elements.overlay.open).to.be.true;
        el.querySelector('#btn1').click();
        
        var btn = el.querySelector('#btn3');
        el.removeChild(btn);
        el.querySelector('#btn1').click();
        
        expect(el._elements.overlay.open).to.be.false;
        el.appendChild(btn);
  
        // Wait for the list to be populated
        helpers.next(function() {
          el.querySelector('#btn1').click();

          helpers.next(function() {
            expect(el._elements.overlay.open).to.be.true;
            done();
          });
        });
      });
    });

    it('should allow changing the number of nodes after which to switch to overlay selection', function(done) {
      const el = helpers.build(SNIPPET_THREEITEMS);
      el.threshold = 4;
      expect(el._elements.overlay.open).to.be.false;
      
      el.querySelector('#btn1').click();
      el.querySelector('#btn2').click();
      el.querySelector('#btn3').click();
      var item = el.appendChild(document.createElement('coral-cyclebutton-item'));
      el.querySelector('#btn1').click();

      // Wait for the list to be populated
      helpers.next(function() {
        expect(el._elements.overlay.open).to.be.true;
        el.querySelector('#btn1').click();
        
        el.removeChild(item);
        el.querySelector('#btn1').click();
        
        expect(el._elements.overlay.open).to.be.false;
        done();
      });
    });

    it('should update the overlay content when adding/removing more items', function() {
      const el = helpers.build(SNIPPET_THREEITEMS);

      el.querySelector('#btn1').click();
      
      expect(el._elements.selectList.children.length).to.equal(3);
      el.querySelector('#btn1').click();
  
      var btn = el.appendChild(document.createElement('coral-cyclebutton-item'));
      el.querySelector('#btn1').click();
  
      expect(el._elements.selectList.children.length).to.equal(4);
      el.querySelector('#btn1').click();
      
      el.removeChild(btn);
      el.querySelector('#btn1').click();
  
      expect(el._elements.selectList.children.length).to.equal(3);
    });

    it('should have the general icon when item is clicked and has no icon defined', function() {
      const el = helpers.build(SNIPPET_GENERALICON);
      
      el.items.first().click();
      expect(el.icon).to.equal('apps', 'The general icon is not apps');
      expect(el._elements.button.icon).to.equal('apps', 'The icon of the the button is not the general one');
      el.icon = 'visibility';
      
      expect(el._elements.button.icon).to.equal('visibility', 'The button icon is not the new defined "visibility" one');
      el._elements.selectList.children[0].click();
      
      expect(el.icon).to.equal('visibility', 'The general icon is not apps');
      expect(el._elements.button.icon).to.equal('visibility', 'The icon of the button is not the defined default visibility one');
    });

    it('should have the item icon when item is clicked and has a icon defined', function() {
      const el = helpers.build(SNIPPET_GENERALICON);
      
      el.items.first().click();
      expect(el.icon).to.equal('apps', 'The general icon is not apps');
      expect(el._elements.button.icon).to.equal('apps', 'The icon of the the button is not the general one');
      el._elements.selectList.children[1].click();
      
      expect(el.icon).to.equal('apps', 'The general icon is not apps');
      expect(el._elements.button.icon).to.equal(el.selectedItem.icon, 'The icon of the button is not overwritten by the selected item');
    });
  }); // User Interaction

  describe('Implementation Details', function() {
    it('should keep selection when moved around', function() {
      const el = helpers.build(window.__html__['CycleButton.presetSelect.html']);
      // we move the component to a fragment to produce an attach/detach
      var frag = new DocumentFragment();
      frag.appendChild(el);

      helpers.target.appendChild(frag);
      
      expect(el.items.getAll()[1].selected).to.equal(true, 'Second item is selected');
    });
  
    it('should allow HTML content inside the items', function() {
      const el = helpers.build(SNIPPET_MIXEDITEMS);
      
      // Opens the overlay
      el._elements.button.click();
  
      const items = el.items.getAll();
      const listItems = el._elements.selectList.items.getAll();
  
      items.forEach((item, index) => {
        // We use contain, as the item will have the markup for the icon as well
        expect(listItems[index].content.innerHTML).to.contain(item.content.innerHTML, 'Items should include the HTML');
      });
  
      // Selects the 2nd item
      listItems[1].click();
  
      expect(el._elements.button.label.innerHTML).to.equal(items[1].content.innerHTML, 'Button should show the HTML');
    });
  
    it('should allow HTML content inside the actions', function() {
      const el = helpers.build(SNIPPET_WITHACTIONS);
      
      // Opens the overlay
      el._elements.button.click();
      
      const items = el.actions.getAll();
      const listItems = el._elements.actionList.items.getAll();
    
      items.forEach((item, index) => {
        expect(item.content.innerHTML).to.equal(listItems[index].content.innerHTML, 'Actions should include the HTML');
      });
    
      // selects the 2nd item
      listItems[1].click();
    });
  
    describe('Smart Overlay', () => {
      helpers.testSmartOverlay('coral-cyclebutton');
    });
  }); // Implementation Details
});
