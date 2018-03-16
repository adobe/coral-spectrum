import {Autocomplete} from '/coralui-component-autocomplete';
import {i18n} from '/coralui-util';

describe('Autocomplete', function() {
  describe('Namespace', function() {
    it('should expose enums', function() {
      expect(Autocomplete).to.have.property('match');
      expect(Autocomplete).to.have.property('variant');
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent(window.__html__['Autocomplete.base.html']);
    });

    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Autocomplete());
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = helpers.build(new Autocomplete());

      // No delay by default
      el.delay = 0;
    });

    afterEach(function() {
      el = null;
    });

    describe('#name', function() {
      it('should default to empty string', function() {
        expect(el.name).to.equal('');
      });

      it('should set field name when name set', function() {
        el.name = 'abc';
        expect(el.name).to.equal('abc');
        expect(el.getAttribute('name')).to.equal('abc');
      });
    });

    describe('#multiple', function() {
      it('should default to false', function() {
        expect(el.multiple).to.be.false;
      });
    });

    describe('#forceSelection', function() {
      it('should default to false', function() {
        expect(el.forceSelection).to.be.false;
      });
    });

    describe('#delay', function() {
      it('should default to 200', function() {
        // we create a new instance since the global one sets delay to 0
        el = new Autocomplete();

        expect(el.delay).to.equal(200);
      });
    });

    describe('#value', function() {
      it('should default to empty string', function() {
        expect(el.value).to.equal('');
      });

      it('should set field value and select items when value set', function() {
        el.value = 'abc';

        expect(el.value).to.equal('abc');

        expect(el.values.length).to.equal(1);
        expect(el.values[0]).to.equal('abc');
      });
    });

    describe('#values', function() {
      it('should default to empty array', function() {
        expect(el.values).to.deep.equal([]);
      });

      it('should add tags and select items when values set', function() {
        el.multiple = true;
        expect(el.values.length).to.equal(0);

        el.values = ['abc', 'def'];

        expect(el.value).to.equal('abc');
        expect(el.values.length).to.equal(2);
        expect(el.values[0]).to.equal('abc');
        expect(el.values[1]).to.equal('def');
      });

      it('should remove values when a tag is removed', function(done) {
        el.multiple = true;
        expect(el.values.length).to.equal(0);

        el.values = ['abc', 'def'];

        expect(el.value).to.equal('abc');
        expect(el.values.length).to.equal(2);
        expect(el.values[0]).to.equal('abc');
        expect(el.values[1]).to.equal('def');

        helpers.next(function() {
          // Find the first tag and remove it
          el.querySelector('coral-tag').remove();

          helpers.next(function() {

            // The first tag should be removed
            expect(el.values.length).to.equal(1);
            expect(el.values[0]).to.equal('def');

            done();
          });
        });
      });
    });

    describe('#placeholder', function() {
      it('should default to empty string', function() {
        expect(el.placeholder).to.equal('');
      });

      it('should set field placeholder', function(done) {
        el.placeholder = 'abc';
        helpers.next(function() {
          expect(el.placeholder).to.equal('abc');
          // get attribute as the placeholder property is not available in IE9
          expect(el._elements.input.getAttribute('placeholder')).to.equal('abc');
          done();
        });
      });
    });

    describe('#maxLength', function() {
      it('should default to -1', function() {
        expect(el.maxLength).to.equal(-1, 'Default should be -1');
      });

      it('should set field maxlength to 10', function(done) {
        el.maxLength = 10;

        expect(el.maxLength).to.equal(10);
        helpers.next(function() {
          expect(el._elements.input.getAttribute('maxlength')).to.equal('10');
          done();
        });
      });

      it('should not allow setting -1', function(done) {
        el.maxLength = 20;
        expect(el.maxLength).to.equal(20);

        try {
          el.maxLength = -1;
        }
        catch (e) {
          done();
        }
      });

      it('should allow setting a string', function(done) {
        el.maxLength = '17';
        expect(el.maxLength).to.equal(17);

        helpers.next(function() {
          expect(el._elements.input.getAttribute('maxlength')).to.equal('17');
          done();
        });
      });
    });

    describe('#icon', function() {
      it('should default to empty string', function() {
        expect(el.icon).to.equal('');
      });

      it('should set icon', function() {
        el.icon = 'search';
        expect(el.getAttribute('icon')).to.equal('search');
      });
    });
    
    describe('#variant', function() {
      it('should default to DEFAULT', function() {
        expect(el.variant).to.equal(Autocomplete.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(el.variant);
      });
      
      it('should switch the variant to QUIET', function() {
        el.variant = Autocomplete.variant.QUIET;
        
        expect(el.variant).to.equal(Autocomplete.variant.QUIET);
        expect(el.getAttribute('variant')).to.equal(el.variant);
        expect(el._elements.trigger.classList.contains('_coral-Button--quiet--dropdown')).to.be.true;
        expect(el._elements.trigger.classList.contains('_coral-Button--dropdown')).to.be.false;
        expect(el._elements.inputGroup.classList.contains('_coral-InputGroup--quiet')).to.be.true;
      });
  
      it('should restore the DEFAULT variant', function() {
        el.variant = Autocomplete.variant.QUIET;
        el.variant = Autocomplete.variant.DEFAULT;
  
        expect(el.variant).to.equal(Autocomplete.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(el.variant);
        expect(el._elements.trigger.classList.contains('_coral-Button--quiet--dropdown')).to.be.false;
        expect(el._elements.trigger.classList.contains('_coral-Button--dropdown')).to.be.true;
        expect(el._elements.inputGroup.classList.contains('_coral-InputGroup--quiet')).to.be.false;
      });
    });

    it('#clear() should clear the value', function() {
      el.value = 'Hello!';

      el.clear();

      expect(el.value).to.equal('');
      expect(el.values).to.deep.equal([]);
      expect(el._elements.input.value).to.equal('');
    });

    it('#showSuggestions() should display selections', function(done) {
      el.multiple = true;
      el.forceSelection = false;

      // show suggestions with no items programmatically
      el.showSuggestions();

      helpers.next(function() {
        expect(el._elements.overlay.open).to.equal(true, 'with no items, selectList should be open');

        expect(el._elements.selectList.items.length).to.equal(1);
        expect(el._elements.selectList.items.getAll()[0].textContent.trim()).to.equal(i18n.get('No matching results.'), 'with no matching results, display "No matching results." message');

        // hide and clear suggestions
        el.hideSuggestions();
        el.clearSuggestions();

        el.items.add({
          value: 'ch',
          content: {
            textContent: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            textContent: 'Firefox'
          }
        });

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          expect(el._elements.selectList.items.length).to.equal(0, 'there should be no items in the selectList before private _showSuggestions method is called');

          // show suggestions programatically
          el.showSuggestions();

          helpers.next(function() {
            expect(el._elements.overlay.open).to.equal(true, 'overlay should open when items are available in selectList');

            expect(el._elements.selectList.items.length).to.equal(2, 'selectList should contain items');

            // Click the first suggestion
            el._elements.selectList.items.getAll()[0].trigger('mousedown');

            // Click the second suggestion
            el._elements.selectList.items.getAll()[1].trigger('mousedown');

            helpers.next(function() {
              expect(el._elements.tagList.items.length).to.equal(2, 'tagList should contain  selected items');

              // show suggestions programatically
              el.clearSuggestions();

              el.on('coral-autocomplete:showsuggestions', function(event) {
                // Don't show suggestions from existing items
                // This shows a loading icon until we call addSuggestions
                event.preventDefault();

                // Add suggestions
                el.addSuggestions([
                  {
                    value: 'sa',
                    content: 'Safari'
                  }
                ]);
              });

              el.showSuggestions();

              helpers.next(function() {
                expect(el._elements.overlay.open).to.equal(true, 'overlay should be open when "remote" selections are loading');

                expect(el._elements.selectList.items.length).to.equal(1, 'selectList should contain item added remotely');

                expect(el._elements.selectList.items.getAll()[0].value).to.equal('sa', 'SelectList item should represent remote suggestion');

                done();
              });
            });
          });
        });
      });
    });
  });

  describe('Events', function() {
    var el;

    beforeEach(function() {
      el = helpers.build(new Autocomplete());

      // No delay by default
      el.delay = 0;
    });

    afterEach(function() {
      el = null;
    });

    describe('#coral-autocomplete:showsuggestions', function() {
      it('should support "remote" suggestions with coral-autocomplete:showsuggestions', function() {
        var spy = sinon.spy();

        el.on('coral-autocomplete:showsuggestions', function(event) {
          spy();

          // Don't show suggestions from existing items
          // This shows a loading icon until we call addSuggestions
          event.preventDefault();

          // Add suggestions
          el.addSuggestions([
            {
              value: 'sa',
              content: 'Safari'
            }
          ]);
        });

        // Trigger input event
        el._elements.input.value = 'sa';
        helpers.event('input', el._elements.input);

        expect(spy.callCount).to.equal(1, 'spy should be called');
        expect(el._elements.selectList.items.length).to.equal(1, 'should have a single SelectList item');
        expect(el._elements.selectList.items.getAll()[0].value).to.equal('sa', 'SelectList item should represent remote suggestion');
      });

      it('should add items to the collection when selection from suggestions added with addSuggestions()', function() {
        el.on('coral-autocomplete:showsuggestions', function(event) {
          // Don't show suggestions from existing items
          // This shows a loading icon until we call addSuggestions
          event.preventDefault();

          // Add suggestions
          el.addSuggestions([
            {
              value: 'sa',
              content: 'Safari'
            }
          ]);
        });

        // Trigger input event
        el._elements.input.value = 'sa';
        helpers.event('input', el._elements.input);

        // Click the suggestion
        el._elements.selectList.items.getAll()[0].trigger('mousedown');

        // Value should be correct
        expect(el.value).to.equal('sa', 'value should be set from SelectList item click');
        expect(el._elements.input.value).to.equal('Safari', 'displayed value for input should be correct from item click');

        // Item should be present in collection
        expect(el.items.length).to.equal(1, 'should have a single Autocomplete item');
        expect(el.items.getAll()[0].value).to.equal('sa', 'Autocomplete item should represent the clicked SelectList item');
      });


      it('should add items to the collection, when selected from suggestions with keyboard and added with addSuggestions()', function() {
        el.on('coral-autocomplete:showsuggestions', function() {

          // Add suggestions
          el.addSuggestions([
            {
                value: 'ch',
                content: 'Chrome'
            },
              {
                value: 'fi',
                content: 'Firefox'
            },
              {
                value: 'ie',
                content: 'Internet Explorer'
            },
              {
                value: 'sa',
                content: 'Safari'
            }
          ]);
        });

        // Trigger input event
        el._elements.input.value = 'Chrome';
        helpers.event('input', el._elements.input);

        // Select first item
        helpers.keydown('down', el._elements.input);
        
        // Hit enter to select value
        helpers.keypress('enter', el._elements.input);
        
        // Check for selected value
        expect(el.value).to.equal('ch', 'value should be set from SelectList item click');
      });
    });

    describe('#change', function() {
      it('should trigger change events when an item is selected inside of the SelectList', function(done) {
        var spy = sinon.spy();

        el.items.add({
          value: 'ch',
          content: {
            textContent: 'Chrome'
          }
        });

        var firefox = el.items.add({
          value: 'fi',
          content: {
            textContent: 'Firefox'
          }
        });

        var handleChange = function(event) {
          expect(el.value).to.equal(firefox.value);
          spy.call(spy, this.arguments);
        };

        el.on('change', handleChange);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          // Trigger input event
          el._elements.input.value = 'fi';
          helpers.event('input', el._elements.input);

          // Click the suggestion
          el._elements.selectList.items.getAll()[0].trigger('mousedown');

          expect(spy.callCount).to.equal(1, 'call count after selecting item');

          // Remove event listener to prevent blur event problems
          el.off('change', handleChange);

          done();
        });
      });

      it('should trigger change events when an item is selected by exact match keyboard entry', function(done) {
        var spy = sinon.spy();

        el.items.add({
          value: 'ch',
          content: {
            textContent: 'Chrome'
          }
        });

        var firefox = el.items.add({
          value: 'fi',
          content: {
            textContent: 'Firefox'
          }
        });

        var handleChange = function(event) {
          expect(el.value).to.equal(firefox.value);
          spy.apply(spy, arguments);
        };

        el.on('change', handleChange);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          // Add some text
          el._elements.input.value = 'firefox';

          // Hit enter
          helpers.keypress('enter', el._elements.input);
          
          expect(spy.callCount).to.equal(1, 'call count after hitting enter on exact match');

          // Remove event listener to prevent blur event problems
          el.off('change', handleChange);

          done();
        });
      });

      it('should trigger a change event when the input is cleared', function(done) {
        el.multiple = false;

        var changeSpy = sinon.spy();

        el.items.add({
          value: 'ch',
          content: {
            textContent: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            textContent: 'Firefox'
          },
          selected: true
        });

        el.on('change', changeSpy);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          expect(el.value).to.equal('fi', 'value should be firefox');

          // Clear the input text and trigger events
          el._elements.input.value = '';
          helpers.event('input', el._elements.input);
          el._handleInput({preventDefault:function(){}}); // Fake call..
          el._onInputChange({stopPropagation:function(){}}); // Fake call..;

          // Wait for mutation observers to pick up items
          helpers.next(function() {
            expect(el.value).to.equal('', 'value should be empty');
            expect(changeSpy.callCount).to.equal(1, 'call count after selecting item');
            expect(el._elements.input.value).to.equal('', 'el._elements.input.value should now contain ""');

            // Remove event listener to prevent blur event problems
            el.off('change', changeSpy);

            done();
          });
        });
      });

      it('should trigger change events when an item is selected by non-matching keyboard entry', function(done) {
        var spy = sinon.spy();
        var handleChange = function(event) {
          expect(el.value).to.equal('stuff');
          spy.apply(spy, arguments);
        };

        el.items.add({
          value: 'ch',
          content: {
            textContent: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            textContent: 'Firefox'
          }
        });

        el.on('change', handleChange);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          // Add some text
          el._elements.input.value = 'stuff';

          // Hit enter
          helpers.keypress('enter', el._elements.input);
          
          expect(spy.callCount).to.equal(1, 'call count after hitting enter on non-matching entry');

          // Remove event listener to prevent blur event problems
          el.off('change', handleChange);

          done();
        });
      });

      it('should not trigger two change events when an item is selected and then component lost focus', function(done) {
        var spy = sinon.spy();

        el.items.add({
          value: 'ch',
          content: {
            textContent: 'Chrome'
          }
        });

        var firefox = el.items.add({
          value: 'fi',
          content: {
            textContent: 'Firefox'
          }
        });

        var handleChange = function(event) {
          expect(el.value).to.equal(firefox.value);
          spy.apply(spy, arguments);
        };

        el.on('change', handleChange);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          // Add some text
          el._elements.input.value = 'firefox';

          // Hit enter
          helpers.keypress('enter', el._elements.input);
          // Lose focus
          el.trigger('blur');
          
          expect(spy.callCount).to.equal(1, 'call count after losing focus on component');

          // Remove event listener to prevent blur event problems
          el.off('change', handleChange);

          done();
        });
      });

      it('should not trigger two change events when an item is selected by non-matching keyboard entry and then component lost focus', function(done) {
        var spy = sinon.spy();
        var handleChange = function(event) {
          expect(el.value).to.equal('stuff');
          spy.apply(spy, arguments);
        };

        el.items.add({
          value: 'ch',
          content: {
            textContent: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            textContent: 'Firefox'
          }
        });

        el.on('change', handleChange);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          // Add some text
          el._elements.input.value = 'stuff';

          // Hit enter
          helpers.keypress('enter', el._elements.input);

          // Lost focus
          el.trigger('blur');
          
          expect(spy.callCount).to.equal(1, 'call count after hitting enter on non-matching entry');

          // Remove event listener to prevent blur event problems
          el.off('change', handleChange);

          done();
        });
      });

      it('should trigger change events when a tag is removed after a user interaction', function() {
        el.multiple = true;
        expect(el.values.length).to.equal(0);

        var tagList = el.querySelector('coral-taglist');

        el.values = ['abc'];

        expect(el.value).to.equal('abc');
        expect(el.values.length).to.equal(1);
        expect(el.values[0]).to.equal('abc');
        expect(tagList.items.length).to.equal(1, 'TagList should have 1 item after values set');

        var spy = sinon.spy();
        el.on('change', spy);
        
        expect(tagList.items.length).to.equal(1, 'TagList should have 1 item after a frame');

        // Find the first tag and remove it
        el.querySelector('coral-tag').remove();
        
        expect(tagList.items.length).to.equal(0, 'TagList should have 0 item after a frame');
        expect(spy.callCount).to.equal(1, 'Change spy should have been called once');
      });
    });

    describe('#coral-autocomplete-item:_valuechanged', function() {
      it('should not be propagated on value change', function(done) {
        var spy = sinon.spy();

        var chrome = el.items.add({
          value: 'ch',
          content: {
            textContent: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            textContent: 'Firefox'
          }
        });

        // listen to event on chrome. This should not be executed
        el.on('coral-autocomplete-item:_valuechanged', spy);

        // wait for items to be picked up
        helpers.next(function() {
          // change value of an item
          chrome.value = 'chr';

          // wait for mutation observer events to propagate
          helpers.next(function() {
            var option = el._options[0];
            expect(chrome.value).to.equal(option.value);

            expect(spy.callCount).to.equal(0, 'call count after value change is triggered');

            done();
          });
        });
      });
    });

    describe('#coral-autocomplete-item:_contentchanged', function() {
      it('should not be propagated', function(done) {
        var spy = sinon.spy();

        var chrome = el.items.add({
          value: 'ch',
          content: {
            textContent: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            textContent: 'Firefox'
          }
        });

        // listen event on chrome. This should not be executed
        el.on('coral-autocomplete-item:_contentchanged', spy);

        // wait for items to be picked up
        helpers.next(function() {
          // change content of an item
          chrome.textContent = 'Chromium';

          // wait for mutation observer events to propagate
          helpers.next(function() {
            var option = el._options[0];
            expect(chrome.textContent).to.equal(option.content);

            expect(spy.callCount).to.equal(0, 'call count after value change is triggered');

            done();
          });
        });
      });
    });

    describe('#coral-autocomplete-item:_selectedchanged', function() {
      it('should not be propagated', function(done) {
        var spy = sinon.spy();

        var chrome = el.items.add({
          value: 'ch',
          content: {
            textContent: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            textContent: 'Firefox'
          }
        });

        // listen event on chrome. This should not be executed
        el.on('coral-autocomplete-item:_selectedchanged', spy);

        // wait for items to be picked up
        helpers.next(function() {
          expect(el.values.length).to.equal(0, 'Nothing is selected');
          expect(el.value).to.be.empty;

          // select chrome
          chrome.selected = true;

          // Wait for event propogation
          helpers.next(function() {
            expect(el.values.length).to.equal(1, 'Chrome is selected');
            expect(el.value).to.equal(chrome.value);

            expect(spy.callCount).to.equal(0, 'call count after value change is triggered');

            done();
          });
        });
      });
    });
  });

  describe('User Interaction', function() {
    var el;

    beforeEach(function() {
      el = helpers.build(new Autocomplete());

      // No delay by default
      el.delay = 0;
    });

    afterEach(function() {
      el = null;
    });

    it('should clear the input field after valid selection in multiselect mode', function(done) {
      el.multiple = true;

      var spy = sinon.spy();

      el.items.add({
        value: 'ch',
        content: {
          textContent: 'Chrome'
        }
      });

      var firefox = el.items.add({
        value: 'fi',
        content: {
          textContent: 'Firefox'
        }
      });

      var handleChange = function(event) {
        expect(el.value).to.equal(firefox.value);
        spy.call(spy, this.arguments);
      };

      el.on('change', handleChange);

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Trigger input event
        el._elements.input.value = 'Fi';
        helpers.event('input', el._elements.input);

        // Click the suggestion
        el._elements.selectList.items.getAll()[0].trigger('mousedown');

        expect(spy.callCount).to.equal(1, 'call count after selecting item');
        expect(el._elements.input.value).to.equal('', 'el._elements.input.value should be reset to an empty string');

        // Remove event listener to prevent blur event problems
        el.off('change', handleChange);

        done();
      });
    });

    it('should be possible to deselect an item by setting an incomplete text in the input in single select mode (if forceSelection === true)', function(done) {
      el.multiple = false;
      el.forceSelection = true;

      var changeSpy = sinon.spy();

      el.items.add({
        value: 'ch',
        content: {
          textContent: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          textContent: 'Firefox'
        }
      });

      el.on('change', changeSpy);

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Trigger input event
        el._elements.input.value = 'Fi';
        helpers.event('input', el._elements.input);

        // Click the suggestion
        el._elements.selectList.items.getAll()[0].trigger('mousedown');

        expect(el.value).to.equal('fi', 'value should now be firefox');
        expect(changeSpy.callCount).to.equal(1, 'call count after selecting item');
        expect(el._elements.input.value).to.equal('Firefox', 'el._elements.input.value should now contain "Firefox"');

        // Set an incomplete text and fire input event
        // As on input change is somehow not called by triggering the 'input' event we fake the call..
        el._elements.input.value = 'Firef';
        helpers.event('input', el._elements.input);
        el._handleInput({preventDefault:function(){}}); // Fake call..
        el._onInputChange({stopPropagation:function(){}}); // Fake call..

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          expect(el.value).to.equal('', 'value should now be empty again');
          // CUI-5533 Another change event should be trigger when cleared
          expect(changeSpy.callCount).to.equal(2, 'call count after selecting item');
          expect(el._elements.input.value).to.equal('Firef', 'el._elements.input.value should now contain "Firef"');

          // Remove event listener to prevent blur event problems
          el.off('change', changeSpy);

          done();
        });

      });
    });

    it('should not be possible to deselect an item by setting an incomplete text in the input in single select mode (if forceSelection === false)', function(done) {
      el.multiple = false;

      var changeSpy = sinon.spy();

      el.items.add({
        value: 'ch',
        content: {
          textContent: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          textContent: 'Firefox'
        }
      });

      el.on('change', changeSpy);

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Trigger input event
        el._elements.input.value = 'Fi';
        helpers.event('input', el._elements.input);

        // Click the suggestion
        el._elements.selectList.items.getAll()[0].trigger('mousedown');

        expect(el.value).to.equal('fi', 'value should now be firefox');
        expect(changeSpy.callCount).to.equal(1, 'call count after selecting item');
        expect(el._elements.input.value).to.equal('Firefox', 'el._elements.input.value should now contain "Firefox"');

        // Set an incomplete text and fire input event
        // As on input change is somehow not called by triggering the 'input' event we fake the call..
        el._elements.input.value = 'Firef';
        helpers.event('input', el._elements.input);
        el._handleInput({preventDefault:function(){}}); // Fake call..
        el._onInputChange({stopPropagation:function(){}}); // Fake call..

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          expect(el.value).to.equal('Firef', 'value should be "Firef"');
          expect(changeSpy.callCount).to.equal(2, 'call count after selecting item');
          expect(el._elements.input.value).to.equal('Firef', 'el._elements.input.value should now contain "Firef"');

          // Remove event listener to prevent blur event problems
          el.off('change', changeSpy);

          done();
        });

      });
    });

    it('should be possible to deselect an item by setting an empty text in the input in single select mode (if forceSelection === false)', function(done) {
      el.multiple = false;

      var changeSpy = sinon.spy();

      el.items.add({
        value: 'ch',
        content: {
          textContent: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          textContent: 'Firefox'
        }
      });

      el.on('change', changeSpy);

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Trigger input event
        el._elements.input.value = 'Fi';
        helpers.event('input', el._elements.input);

        // Click the suggestion
        el._elements.selectList.items.getAll()[0].trigger('mousedown');

        expect(el.value).to.equal('fi', 'value should now be firefox');
        expect(changeSpy.callCount).to.equal(1, 'call count after selecting item');
        expect(el._elements.input.value).to.equal('Firefox', 'el._elements.input.value should now contain "Firefox"');

        // Set an incomplete text and fire input event
        // As on input change is somehow not called by triggering the 'input' event we fake the call..
        el._elements.input.value = '';
        helpers.event('input', el._elements.input);
        el._handleInput({preventDefault:function(){}}); // Fake call..
        el._onInputChange({stopPropagation:function(){}}); // Fake call..

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          expect(el.value).to.equal('', 'value should be "Firef"');
          // CUI-5533 Another change event should be trigger when cleared
          expect(changeSpy.callCount).to.equal(2, 'call count after selecting item');
          expect(el._elements.input.value).to.equal('', 'el._elements.input.value should now contain ""');

          // Remove event listener to prevent blur event problems
          el.off('change', changeSpy);

          done();
        });

      });
    });

    it('should be possible to change the value by setting an any text in the input in multi select mode (if forceSelection === false)', function(done) {
      el.multiple = true;
      el.forceSelection = false;

      var changeSpy = sinon.spy();

      el.items.add({
        value: 'ch',
        content: {
          textContent: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          textContent: 'Firefox'
        }
      });

      el.on('change', changeSpy);

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Add some text
        el._elements.input.value = 'anything';

        // Hit enter
        helpers.keypress('enter', el._elements.input);

        expect(el.value).to.equal('anything', 'value should be "anything"');

        done();
      });
    });

    it('should be possible to change the value by setting any text and empty text in the input in single select mode (if forceSelection === false)', function(done) {
      el.multiple = false;
      el.forceSelection = false;

      var changeSpy = sinon.spy();

      el.items.add({
        value: 'ch',
        content: {
          textContent: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          textContent: 'Firefox'
        }
      });

      el.on('change', changeSpy);

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Add some text
        el._elements.input.value = 'anything';

        // Hit enter
        helpers.keypress('enter', el._elements.input);

        expect(el.value).to.equal('anything', 'value should be "anything"');
      
        // Set empty text
        el._elements.input.value = '';

        // Hit enter
        helpers.keypress('enter', el._elements.input);

        expect(el.value).to.equal('', 'value should be ""');

        done();
      });
    });

    it('should be possible to select an item using the keyboard alone (if forceSelection === true)', function(done) {
      el.multiple = false;
      el.forceSelection = true;

      el.items.add({
        value: 'ch',
        content: {
          textContent: ' Chrome '
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          textContent: ' Firefox '
        }
      });

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Trigger down arrow on input to open selectList
        helpers.keydown('down', el._elements.input);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          expect(el._elements.overlay.open).to.be.true;

          // Trigger down arrow on input to focus first item in selectList
          helpers.keydown('down', el._elements.input);

          helpers.next(function() {
            var selectListItem = el._elements.selectList.items.first();

            expect(el._elements.input.getAttribute('aria-activedescendant')).to.equal(selectListItem.id, 'aria-activedescendant on input should match id of first item in selectList');

            expect(selectListItem.className.indexOf('is-focused') !== -1).to.equal(true, 'item in selectList should display keyboard focus');

            // trigger selection of 'focused' item is selectList
            helpers.keydown('enter', el._elements.input);
            
            expect(el.value).to.equal(el.items.first().value, 'new value should match value of item selected using keyboard');

            done();
          });
        });
      });
    });

    it('should be possible set focus to an item in the dropdown menu without closing the menu', function(done) {
      const overlayAnimationDuration = 125;
      
      el.multiple = false;
      el.forceSelection = false;

      el.items.add({
        value: 'ch',
        content: {
          innerHTML: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          innerHTML: 'Firefox'
        }
      });

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Click trigger to open selectList overlay
        el._elements.trigger.click();

        setTimeout(function() {
          expect(el._elements.overlay.open).to.be.true;

          // Set focus to first selectList item
          el._elements.selectList.querySelector('[role=option]').focus();
        
          expect(el._elements.overlay.open).to.equal(true, 'menu should remain open when item receives focus');

          // click focused selectList item element
          document.activeElement.trigger('mousedown');

          setTimeout(function() {
            expect(el._elements.overlay.open).to.be.false;

            expect(document.activeElement === el._elements.input).to.be.true;

            expect(el._elements.input.value).to.equal('Chrome', 'input value should be "Chrome"');

            done();
          }, overlayAnimationDuration);
        }, overlayAnimationDuration);
      });
    });

    it('should be possible close menu by clicking the toggle button', function(done) {
      const overlayAnimationDuration = 125;
      var event = document.createEvent('MouseEvent');
      
      el.multiple = false;
      el.forceSelection = false;

      el.items.add({
        value: 'ch',
        content: {
          innerHTML: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          innerHTML: 'Firefox'
        }
      });

      // Wait for mutation observers to pick up items
      helpers.next(function() {

        // Click trigger to open selectList overlay
        el._elements.trigger.click();
        
        setTimeout(function() {
          // SelectList overlay should be open
          expect(el._elements.overlay.open).to.be.true;
  
          // Input should have focus
          expect(document.activeElement === el._elements.input).to.be.true;
  
          // Mousedown on trigger
          helpers.mouseEvent('mousedown', el._elements.trigger);
  
          // Trigger should receive focus on mousedown
          expect(document.activeElement === el._elements.trigger).to.be.true;
  
          // SelectList overlay should still be open
          expect(el._elements.overlay.open).to.be.true;
  
          // Mouseup on trigger
          helpers.mouseEvent('mouseup', el._elements.trigger);
          event.initEvent('mouseup', true, true);
  
          // Click trigger to close selectList overlay
          el._elements.trigger.click();
          
          setTimeout(function() {
            // SelectList overlay should be closed
            expect(el._elements.overlay.open).to.be.false;
  
            // TODO Focus should be restored to input
            // expect(document.activeElement === el._elements.input).to.be.true;
  
            done();
          }, overlayAnimationDuration);
        }, overlayAnimationDuration);
      });
    });
  });

  describe('Implementation Details', function() {

    it('should allow items to be added and selected before appending to the DOM', function(done) {
      var autocomplete = new Autocomplete().set({
        placeholder: 'Enter a word',
        match: 'startswith'
      });
      var chrome = autocomplete.items.add({
        value: 'ch',
        content: {
          textContent: 'Chrome'
        }
      });
      var firefox = autocomplete.items.add({
        value: 'fi',
        content: {
          textContent: 'Firefox'
        }
      });
      var ie = autocomplete.items.add({
        value: 'ie',
        content: {
          textContent: 'Internet Explorer'
        }
      });
      var safari = autocomplete.items.add({
        value: 'sa',
        content: {
          textContent: 'Safari'
        }
      });
      autocomplete.multiple = true;
      autocomplete.values = ['sa', 'fi'];
      helpers.target.appendChild(autocomplete);

      helpers.next(function() {
        // Ensure autocomplete API is updated
        expect(autocomplete.values).to.include('fi');
        expect(autocomplete.values).to.include('sa');

        // Ensure item API is updated
        expect(firefox.hasAttribute('selected')).to.equal(true, 'firefox should be selected');
        expect(safari.hasAttribute('selected')).to.equal(true, 'safari should be selected');
        expect(ie.hasAttribute('selected')).to.equal(false, 'ie should not be selected');
        expect(chrome.hasAttribute('selected')).to.equal(false, 'chrome should not be selected');

        done();
      });
    });

    it('should deselect other items when an item is selected', function(done) {
      var el = new Autocomplete();

      // No delay by default
      el.delay = 0;

      helpers.target.appendChild(el);

      var chrome = el.items.add({
        value: 'ch',
        content: {
          textContent: 'Chrome'
        }
      });

      var firefox = el.items.add({
        value: 'fi',
        content: {
          textContent: 'Firefox'
        },
        selected: true
      });

      helpers.next(function() {
        expect(firefox.selected).to.equal(true);
        expect(chrome.selected).to.equal(false);

        // Select Chrome
        chrome.selected = true;

        helpers.next(function() {
          expect(firefox.selected).to.equal(false);
          expect(chrome.selected).to.equal(true);

          done();
        });
      });
    });


    it('should not escape special characters when an item is selected', function() {
      var el = new Autocomplete();

      // No delay by default
      el.delay = 0;

      helpers.target.appendChild(el);

      var item = el.items.add({
        value: '&&',
        content: {
          textContent: '&&'
        }
      });

      item.selected = true;
      
      expect(el.value).to.equal(item.value, 'value should now be &&');
    });

    it('should not escape special characters when an item is selected from the selectlist via mouse click', function(done) {
      var el = new Autocomplete();

      // No delay by default
      el.delay = 0;

      helpers.target.appendChild(el);

      var item = el.items.add({
        value: '&&',
        content: {
          textContent: '&&'
        }
      });

      // Wait for MO
      helpers.next(function() {
        // Trigger input event
        el._elements.input.value = '&';
        helpers.event('input', el._elements.input);

        // Click the suggestion
        el._elements.selectList.items.getAll()[0].trigger('mousedown');

        // Special characters should not be escaped
        expect(el.value).to.equal(item.value, 'value should now be &&');
        
        done();
      });
    });

    it('should not escape special characters when an item is selected from the selectlist via keyboard enter', function(done) {
      var el = new Autocomplete();

      // No delay by default
      el.delay = 0;

      helpers.target.appendChild(el);

      var item = el.items.add({
        value: '&&',
        content: {
          textContent: '&&'
        }
      });

      // Wait for MO
      helpers.next(function() {
        // Trigger input event
        el._elements.input.value = '&';
        helpers.event('input', el._elements.input);

        // Hit enter
        helpers.keypress('enter', el._elements.selectList.items.getAll()[0]);

        // Special characters should not be escaped
        expect(el.value).to.equal(item.value, 'value should now be &&');
        
        done();
      });
    });

    it('should support disabled items', function() {
      var el = new Autocomplete();

      var chrome = el.items.add({
        value: 'ch',
        disabled: true,
        content: {
          textContent: 'Chrome'
        }
      });

      var firefox = el.items.add({
        value: 'fi',
        content: {
          textContent: 'Firefox'
        }
      });
      
      expect(firefox.disabled).to.equal(false);
      expect(firefox.hasAttribute('disabled')).to.equal(false);
      expect(chrome.disabled).to.equal(true);
      expect(chrome.hasAttribute('disabled')).to.equal(true);
    });

    it('should update accessibility label on toggle button when number of suggestions available', function(done) {
      var el = helpers.build(new Autocomplete());

       el.items.add({
        value: 'ch',
        content: {
          textContent: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          textContent: 'Firefox'
        }
      });

      el.items.add({
        value: 'ie',
        content: {
          textContent: 'Internet Explorer'
        }
      });

      el.items.add({
        value: 'sa',
        content: {
          textContent: 'Safari'
        }
      });

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        expect(el._elements.trigger.getAttribute('aria-label')).to.equal('Show suggestions');

        el._elements.input.value = 'Chrome';
        
        helpers.event('input', el._elements.input);

        // test with delay
        setTimeout(function() {
          expect(el._elements.overlay.open).to.be.true;

          expect(el._elements.trigger.getAttribute('aria-label')).to.equal('Show suggestion');

          // close selectList
          helpers.keydown('esc', el._elements.input);

          // clear value
          el._elements.input.value = '';
          el._elements.input;
          helpers.event('input', el._elements.input);

          // force open selectList
          el._elements.trigger.click();
          
          expect(el._elements.trigger.getAttribute('aria-label')).to.equal('Show 4 suggestions');

          // close selectList
          helpers.keydown('esc', el._elements.input);

          // search for items containing the letter 'i'
          el._elements.input.value = 'i';
          el._elements.input;
          helpers.event('input', el._elements.input);

          // force open selectList
          el._elements.trigger.click();
          
          expect(el._elements.trigger.getAttribute('aria-label')).to.equal('Show 3 suggestions');

          // navigate to focus first item in selectList
          helpers.keydown('down', el._elements.input);
          
          // select focused item in selectList
          helpers.keydown('Enter', el._elements.input);
        
          expect(el._elements.trigger.getAttribute('aria-label')).to.equal('Show suggestions');

          done();
        }, el.delay);
      });
    });

    it('should display the overlay with items and their html content', function(done) {
      var el = helpers.build(new Autocomplete());
      var ch_text = 'Chrome';
      var fi_html = '<strong>Firefox</strong>';
      var ie_html = '<strong>Internet Explorer</strong>';

      // 'Chrome' item with text content
      el.items.add({
        value: 'ch',
        content: {
          textContent: ch_text
        }
      });

      // 'Firefox' item with html content
      el.items.add({
        value: 'fi',
        content: {
          innerHTML: fi_html
        }
      });

      // 'Internet Explorer' item with html content
      el.items.add({
        value: 'ie',
        content: {
          innerHTML: ie_html
        }
      });

      el.on('coral-overlay:open', function() {
        // Get all items of selectList
        var items = el._elements.selectList.items.getAll();

        // Check if the items have the original content
        expect(items[0].content.innerText).to.equal(ch_text, 'chrome item should have text only content');
        expect(items[1].content.innerHTML).to.equal(fi_html, 'firefox item should have html content');
        expect(items[2].content.innerHTML).to.equal(ie_html, 'internet explorer item should have html content.');

        done();
      });

      helpers.event('input', el._elements.input);
    });

    it('should select the best matching option when an item is selected inside of the SelectList', function(done) {
      var el = helpers.build(new Autocomplete());
      
      // Add same text options but case different
      el.items.add({
        value: 'uppercase',
        content: {
          textContent: 'CHROME'
        }
      });

      el.items.add({
        value: 'lowercase',
        content: {
          innerHTML: 'chrome'
        }
      });

      el.on('coral-overlay:open', function() {
        el._elements.selectList.items.getAll()[1].trigger('mousedown');

        // Mimic the input focus out
        el._handleFocusOut({target: el._elements.input, preventDefault: function() {}});
        
        // Lowercase option should be the selected value
        var matchedOption = el.items.last();
        expect(el._elements.input.value).to.equal(matchedOption.textContent);
        expect(el.value).to.equal(matchedOption.value);

        done();
      });

      el._elements.input.value = 'c';
      helpers.event('input', el._elements.input);
    });
  
    it('should suggest the best matching option supporting html entities', function(done) {
      var el = helpers.build(new Autocomplete());
    
      el.items.add({
        value: 'ch',
        content: {
          innerHTML: 'chrome'
        }
      });
    
      // Add html entity &amp;
      el.items.add({
        value: 'ie',
        content: {
          innerHTML: 'Internet &amp; Explorer'
        }
      });
    
      el.on('coral-overlay:open', function() {
        var suggestions = el._elements.selectList.items.getAll();
      
        expect(suggestions.length).to.equal(1);
        expect(suggestions[0].value).to.equal('ie');
      
        done();
      });
    
      el._elements.input.value = 'Internet & Explorer';
      helpers.event('input', el._elements.input);
    });
  
    describe('Smart Overlay', () => {
      helpers.testSmartOverlay('coral-autocomplete');
    });
  
    describe('#formField (single select)', function() {
      // Run generic formField tests
      helpers.testFormField(window.__html__['Autocomplete.base.html'], {
        value: 'op',
        default: ''
      });
    });
  
    describe('#formField (multi select)', function() {
      // Run generic formField tests
      helpers.testFormField(window.__html__['Autocomplete.multiple.value.html'], {
        value: 'op',
        default: ''
      });
    });
  });
});
